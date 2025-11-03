-- Migration: Create Health Profile Sharing Feature
-- Description: Allows users to share pet health profiles with others via secure links

-- ============================================
-- Table: health_profile_shares
-- Purpose: Tracks shared health profile access
-- ============================================
CREATE TABLE IF NOT EXISTS public.health_profile_shares (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pet_id UUID NOT NULL REFERENCES public.pets(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Share details
  share_token TEXT NOT NULL UNIQUE, -- Secure token for the share link
  access_code TEXT, -- Optional access code for extra security
  
  -- Recipient information
  recipient_email TEXT NOT NULL,
  recipient_name TEXT, -- Optional recipient name
  message TEXT, -- Optional message from sharer
  
  -- Access settings
  expires_at TIMESTAMPTZ NOT NULL, -- When the link expires
  max_views INTEGER DEFAULT NULL, -- Optional max number of views (NULL = unlimited)
  views_count INTEGER DEFAULT 0, -- Current number of views
  
  -- Status
  status TEXT NOT NULL CHECK (status IN ('active', 'expired', 'revoked', 'max_views_reached')) DEFAULT 'active',
  
  -- Permissions (what can be viewed)
  allow_health_records BOOLEAN DEFAULT true,
  allow_vitals BOOLEAN DEFAULT true,
  allow_alerts BOOLEAN DEFAULT true,
  allow_documents BOOLEAN DEFAULT true,
  
  -- Metadata
  last_accessed_at TIMESTAMPTZ, -- Last time the link was accessed
  revoked_at TIMESTAMPTZ, -- When manually revoked
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for health_profile_shares
CREATE INDEX IF NOT EXISTS idx_health_shares_pet_id ON health_profile_shares(pet_id);
CREATE INDEX IF NOT EXISTS idx_health_shares_user_id ON health_profile_shares(user_id);
CREATE INDEX IF NOT EXISTS idx_health_shares_token ON health_profile_shares(share_token);
CREATE INDEX IF NOT EXISTS idx_health_shares_status ON health_profile_shares(status);
CREATE INDEX IF NOT EXISTS idx_health_shares_expires_at ON health_profile_shares(expires_at);

-- ============================================
-- Table: health_share_access_logs
-- Purpose: Logs access attempts and views
-- ============================================
CREATE TABLE IF NOT EXISTS public.health_share_access_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  share_id UUID NOT NULL REFERENCES health_profile_shares(id) ON DELETE CASCADE,
  
  -- Access information
  accessed_at TIMESTAMPTZ DEFAULT NOW(),
  ip_address INET, -- Optional IP tracking
  user_agent TEXT, -- Browser/device info
  
  -- What was accessed
  viewed_section TEXT, -- 'records', 'vitals', 'alerts', 'documents', 'summary'
  success BOOLEAN DEFAULT true, -- Whether access was successful
  
  -- Error details (if access failed)
  error_reason TEXT
);

-- Indexes for access logs
CREATE INDEX IF NOT EXISTS idx_share_logs_share_id ON health_share_access_logs(share_id);
CREATE INDEX IF NOT EXISTS idx_share_logs_accessed_at ON health_share_access_logs(accessed_at);

-- ============================================
-- Enable Row Level Security (RLS)
-- ============================================
ALTER TABLE health_profile_shares ENABLE ROW LEVEL SECURITY;
ALTER TABLE health_share_access_logs ENABLE ROW LEVEL SECURITY;

-- ============================================
-- RLS Policies: health_profile_shares
-- ============================================
-- Users can view their own shares
CREATE POLICY "Users can view their own shares"
  ON health_profile_shares FOR SELECT
  USING (auth.uid() = user_id);

-- Users can create shares for their pets
CREATE POLICY "Users can create shares for their pets"
  ON health_profile_shares FOR INSERT
  WITH CHECK (
    auth.uid() = user_id
    AND pet_id IN (SELECT id FROM pets WHERE user_id = auth.uid())
  );

-- Users can update their own shares (e.g., revoke)
CREATE POLICY "Users can update their own shares"
  ON health_profile_shares FOR UPDATE
  USING (auth.uid() = user_id);

-- Users can delete their own shares
CREATE POLICY "Users can delete their own shares"
  ON health_profile_shares FOR DELETE
  USING (auth.uid() = user_id);

-- Public access for valid share tokens (via service role or function)
-- This will be handled by Edge Functions or API endpoints

-- ============================================
-- RLS Policies: health_share_access_logs
-- ============================================
-- Users can view logs for their shares
CREATE POLICY "Users can view their share logs"
  ON health_share_access_logs FOR SELECT
  USING (
    share_id IN (
      SELECT id FROM health_profile_shares WHERE user_id = auth.uid()
    )
  );

-- Logs can be inserted by service (via Edge Function)
-- Regular users won't insert logs directly

-- ============================================
-- Function: Generate secure share token
-- ============================================
CREATE OR REPLACE FUNCTION generate_share_token()
RETURNS TEXT AS $$
DECLARE
  token TEXT;
BEGIN
  -- Generate a cryptographically secure random token
  -- Format: 32 character hex string
  token := encode(gen_random_bytes(16), 'hex');
  RETURN token;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- Function: Generate access code
-- ============================================
CREATE OR REPLACE FUNCTION generate_access_code()
RETURNS TEXT AS $$
DECLARE
  code TEXT;
BEGIN
  -- Generate a 6-digit access code
  code := LPAD(floor(random() * 1000000)::TEXT, 6, '0');
  RETURN code;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- Function: Check if share is valid
-- ============================================
CREATE OR REPLACE FUNCTION is_share_valid(p_token TEXT)
RETURNS BOOLEAN AS $$
DECLARE
  share_record health_profile_shares%ROWTYPE;
BEGIN
  SELECT * INTO share_record
  FROM health_profile_shares
  WHERE share_token = p_token
  AND status = 'active';
  
  -- Check if share exists and is active
  IF NOT FOUND THEN
    RETURN FALSE;
  END IF;
  
  -- Check expiration
  IF share_record.expires_at < NOW() THEN
    UPDATE health_profile_shares
    SET status = 'expired'
    WHERE id = share_record.id;
    RETURN FALSE;
  END IF;
  
  -- Check max views
  IF share_record.max_views IS NOT NULL 
     AND share_record.views_count >= share_record.max_views THEN
    UPDATE health_profile_shares
    SET status = 'max_views_reached'
    WHERE id = share_record.id;
    RETURN FALSE;
  END IF;
  
  RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- Function: Record share access
-- ============================================
CREATE OR REPLACE FUNCTION record_share_access(
  p_token TEXT,
  p_viewed_section TEXT DEFAULT NULL,
  p_ip_address INET DEFAULT NULL,
  p_user_agent TEXT DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
  share_id UUID;
  log_id UUID;
BEGIN
  -- Get share ID and check validity
  SELECT id INTO share_id
  FROM health_profile_shares
  WHERE share_token = p_token
  AND status = 'active'
  AND expires_at > NOW();
  
  IF share_id IS NULL THEN
    RETURN NULL;
  END IF;
  
  -- Increment views count
  UPDATE health_profile_shares
  SET 
    views_count = views_count + 1,
    last_accessed_at = NOW()
  WHERE id = share_id;
  
  -- Create access log
  INSERT INTO health_share_access_logs (
    share_id,
    accessed_at,
    ip_address,
    user_agent,
    viewed_section,
    success
  ) VALUES (
    share_id,
    NOW(),
    p_ip_address,
    p_user_agent,
    p_viewed_section,
    true
  )
  RETURNING id INTO log_id;
  
  RETURN log_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- Function: Auto-expire shares (for scheduled cleanup)
-- ============================================
CREATE OR REPLACE FUNCTION auto_expire_shares()
RETURNS INTEGER AS $$
DECLARE
  expired_count INTEGER;
BEGIN
  UPDATE health_profile_shares
  SET status = 'expired'
  WHERE status = 'active'
  AND expires_at < NOW();
  
  GET DIAGNOSTICS expired_count = ROW_COUNT;
  RETURN expired_count;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- Function: Update updated_at timestamp
-- ============================================
CREATE OR REPLACE FUNCTION update_health_shares_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_health_shares_updated_at
  BEFORE UPDATE ON health_profile_shares
  FOR EACH ROW
  EXECUTE FUNCTION update_health_shares_updated_at();

-- ============================================
-- Helper View: Active Shares Summary
-- ============================================
CREATE OR REPLACE VIEW health_shares_summary AS
SELECT 
  hs.id,
  hs.pet_id,
  p.name as pet_name,
  hs.user_id,
  hs.recipient_email,
  hs.share_token,
  hs.status,
  hs.expires_at,
  hs.views_count,
  hs.max_views,
  hs.last_accessed_at,
  hs.created_at,
  CASE 
    WHEN hs.expires_at < NOW() THEN 'expired'
    WHEN hs.status = 'revoked' THEN 'revoked'
    WHEN hs.max_views IS NOT NULL AND hs.views_count >= hs.max_views THEN 'max_views_reached'
    WHEN hs.status = 'active' THEN 'active'
    ELSE 'unknown'
  END as current_status
FROM health_profile_shares hs
JOIN pets p ON hs.pet_id = p.id;

