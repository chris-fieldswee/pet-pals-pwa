-- Migration: Create Health Overview Feature Tables
-- Description: Comprehensive health tracking system with records, vitals, alerts, and documents

-- ============================================
-- Table: health_records
-- Purpose: Stores all health-related events (vet visits, vaccinations, medications, general notes)
-- ============================================
CREATE TABLE IF NOT EXISTS public.health_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pet_id UUID NOT NULL REFERENCES public.pets(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Record type and categorization
  record_type TEXT NOT NULL CHECK (record_type IN (
    'vet_visit',
    'vaccination',
    'medication',
    'weight_log',
    'surgery',
    'allergy',
    'diagnosis',
    'general'
  )),
  
  -- Core information
  title VARCHAR(200) NOT NULL,
  description TEXT,
  date DATE NOT NULL,
  time TIME, -- Optional time for specific events
  
  -- Specific fields based on type
  medication_name TEXT, -- For medication records
  dosage TEXT, -- e.g., "5mg daily"
  frequency TEXT, -- e.g., "Once daily", "Every 12 hours"
  duration TEXT, -- e.g., "7 days", "Ongoing"
  
  -- Vaccination specific
  vaccine_type TEXT, -- e.g., "Rabies", "DHPP", "FVRCP"
  vaccine_batch_number TEXT,
  veterinarian_name TEXT,
  clinic_name TEXT,
  
  -- Vet visit specific
  visit_reason TEXT,
  diagnosis TEXT,
  treatment_notes TEXT,
  follow_up_required BOOLEAN DEFAULT false,
  follow_up_date DATE,
  
  -- Metadata
  notes TEXT,
  cost DECIMAL(10, 2), -- Optional cost tracking
  location TEXT, -- Vet clinic location
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for health_records
CREATE INDEX IF NOT EXISTS idx_health_records_pet_id ON health_records(pet_id);
CREATE INDEX IF NOT EXISTS idx_health_records_user_id ON health_records(user_id);
CREATE INDEX IF NOT EXISTS idx_health_records_date ON health_records(date DESC);
CREATE INDEX IF NOT EXISTS idx_health_records_type ON health_records(record_type);
CREATE INDEX IF NOT EXISTS idx_health_records_pet_date ON health_records(pet_id, date DESC);

-- ============================================
-- Table: health_vitals
-- Purpose: Tracks vital signs and measurements over time (weight, temperature, heart rate, etc.)
-- ============================================
CREATE TABLE IF NOT EXISTS public.health_vitals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pet_id UUID NOT NULL REFERENCES public.pets(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Measurement type
  vital_type TEXT NOT NULL CHECK (vital_type IN (
    'weight',
    'temperature',
    'heart_rate',
    'respiratory_rate',
    'blood_pressure_systolic',
    'blood_pressure_diastolic',
    'body_condition_score',
    'hydration_level'
  )),
  
  -- Value and unit
  value DECIMAL(10, 2) NOT NULL,
  unit TEXT NOT NULL, -- e.g., "lbs", "kg", "°F", "°C", "bpm"
  
  -- Context
  measured_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  measured_by TEXT, -- "owner", "vet", "nurse", etc.
  notes TEXT,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for health_vitals
CREATE INDEX IF NOT EXISTS idx_health_vitals_pet_id ON health_vitals(pet_id);
CREATE INDEX IF NOT EXISTS idx_health_vitals_user_id ON health_vitals(user_id);
CREATE INDEX IF NOT EXISTS idx_health_vitals_type ON health_vitals(vital_type);
CREATE INDEX IF NOT EXISTS idx_health_vitals_measured_at ON health_vitals(measured_at DESC);
CREATE INDEX IF NOT EXISTS idx_health_vitals_pet_type_date ON health_vitals(pet_id, vital_type, measured_at DESC);

-- ============================================
-- Table: health_alerts
-- Purpose: Tracks upcoming health-related alerts and reminders (vaccines due, medications, checkups)
-- ============================================
CREATE TABLE IF NOT EXISTS public.health_alerts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pet_id UUID NOT NULL REFERENCES public.pets(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Alert type
  alert_type TEXT NOT NULL CHECK (alert_type IN (
    'vaccination_due',
    'medication_due',
    'medication_refill',
    'checkup_due',
    'follow_up_due',
    'test_due',
    'surgery_follow_up',
    'custom'
  )),
  
  -- Alert details
  title VARCHAR(200) NOT NULL,
  description TEXT,
  due_date DATE NOT NULL,
  
  -- Related record (optional)
  related_record_id UUID REFERENCES health_records(id) ON DELETE SET NULL,
  
  -- Priority
  priority TEXT NOT NULL CHECK (priority IN ('low', 'medium', 'high', 'urgent')) DEFAULT 'medium',
  
  -- Status
  status TEXT NOT NULL CHECK (status IN ('active', 'snoozed', 'completed', 'cancelled')) DEFAULT 'active',
  
  -- Snooze information
  snoozed_until DATE,
  snooze_reason TEXT,
  
  -- Completion
  completed_at TIMESTAMPTZ,
  completed_by TEXT, -- "user", "system", etc.
  
  -- Rescheduling
  rescheduled_from DATE,
  rescheduled_to DATE,
  
  -- Notification settings
  notification_sent BOOLEAN DEFAULT false,
  notification_sent_at TIMESTAMPTZ,
  
  -- Metadata
  notes TEXT,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for health_alerts
CREATE INDEX IF NOT EXISTS idx_health_alerts_pet_id ON health_alerts(pet_id);
CREATE INDEX IF NOT EXISTS idx_health_alerts_user_id ON health_alerts(user_id);
CREATE INDEX IF NOT EXISTS idx_health_alerts_status ON health_alerts(status);
CREATE INDEX IF NOT EXISTS idx_health_alerts_due_date ON health_alerts(due_date);
CREATE INDEX IF NOT EXISTS idx_health_alerts_type ON health_alerts(alert_type);
CREATE INDEX IF NOT EXISTS idx_health_alerts_pet_status_date ON health_alerts(pet_id, status, due_date);

-- ============================================
-- Table: health_documents
-- Purpose: Stores file attachments related to health records (lab results, X-rays, prescriptions, etc.)
-- ============================================
CREATE TABLE IF NOT EXISTS public.health_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pet_id UUID NOT NULL REFERENCES public.pets(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Related record (optional - document can exist independently)
  related_record_id UUID REFERENCES health_records(id) ON DELETE SET NULL,
  
  -- Document information
  title VARCHAR(200) NOT NULL,
  description TEXT,
  file_name TEXT NOT NULL,
  file_path TEXT NOT NULL, -- Path in storage bucket
  file_size BIGINT, -- Size in bytes
  file_type TEXT, -- MIME type, e.g., "image/jpeg", "application/pdf"
  
  -- Document metadata
  document_type TEXT CHECK (document_type IN (
    'lab_result',
    'xray',
    'prescription',
    'invoice',
    'insurance',
    'certificate',
    'general'
  )) DEFAULT 'general',
  
  -- Storage information
  storage_bucket TEXT DEFAULT 'health-documents',
  
  -- Dates
  document_date DATE, -- Date of the document (if applicable)
  uploaded_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for health_documents
CREATE INDEX IF NOT EXISTS idx_health_documents_pet_id ON health_documents(pet_id);
CREATE INDEX IF NOT EXISTS idx_health_documents_user_id ON health_documents(user_id);
CREATE INDEX IF NOT EXISTS idx_health_documents_record_id ON health_documents(related_record_id);
CREATE INDEX IF NOT EXISTS idx_health_documents_type ON health_documents(document_type);
CREATE INDEX IF NOT EXISTS idx_health_documents_date ON health_documents(document_date DESC);

-- ============================================
-- Enable Row Level Security (RLS)
-- ============================================
ALTER TABLE health_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE health_vitals ENABLE ROW LEVEL SECURITY;
ALTER TABLE health_alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE health_documents ENABLE ROW LEVEL SECURITY;

-- ============================================
-- RLS Policies: health_records
-- ============================================
CREATE POLICY "Users can view their own health records"
  ON health_records FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own health records"
  ON health_records FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own health records"
  ON health_records FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own health records"
  ON health_records FOR DELETE
  USING (auth.uid() = user_id);

-- ============================================
-- RLS Policies: health_vitals
-- ============================================
CREATE POLICY "Users can view their own health vitals"
  ON health_vitals FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own health vitals"
  ON health_vitals FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own health vitals"
  ON health_vitals FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own health vitals"
  ON health_vitals FOR DELETE
  USING (auth.uid() = user_id);

-- ============================================
-- RLS Policies: health_alerts
-- ============================================
CREATE POLICY "Users can view their own health alerts"
  ON health_alerts FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own health alerts"
  ON health_alerts FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own health alerts"
  ON health_alerts FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own health alerts"
  ON health_alerts FOR DELETE
  USING (auth.uid() = user_id);

-- ============================================
-- RLS Policies: health_documents
-- ============================================
CREATE POLICY "Users can view their own health documents"
  ON health_documents FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own health documents"
  ON health_documents FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own health documents"
  ON health_documents FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own health documents"
  ON health_documents FOR DELETE
  USING (auth.uid() = user_id);

-- ============================================
-- Functions for automatic timestamp updates
-- ============================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_health_records_updated_at
  BEFORE UPDATE ON health_records
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_health_vitals_updated_at
  BEFORE UPDATE ON health_vitals
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_health_alerts_updated_at
  BEFORE UPDATE ON health_alerts
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_health_documents_updated_at
  BEFORE UPDATE ON health_documents
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- Helper View: health_summary
-- Purpose: Quick access to latest vitals and important dates
-- ============================================
CREATE OR REPLACE VIEW health_summary AS
SELECT 
  p.id as pet_id,
  p.name as pet_name,
  
  -- Latest weight
  (SELECT value FROM health_vitals 
   WHERE pet_id = p.id AND vital_type = 'weight' 
   ORDER BY measured_at DESC LIMIT 1) as latest_weight,
   
  -- Latest weight date
  (SELECT measured_at FROM health_vitals 
   WHERE pet_id = p.id AND vital_type = 'weight' 
   ORDER BY measured_at DESC LIMIT 1) as latest_weight_date,
   
  -- Last vet visit
  (SELECT date FROM health_records 
   WHERE pet_id = p.id AND record_type = 'vet_visit' 
   ORDER BY date DESC LIMIT 1) as last_vet_visit,
   
  -- Active alerts count
  (SELECT COUNT(*) FROM health_alerts 
   WHERE pet_id = p.id AND status = 'active') as active_alerts_count,
   
  -- Upcoming alerts (next 7 days)
  (SELECT COUNT(*) FROM health_alerts 
   WHERE pet_id = p.id AND status = 'active' 
   AND due_date <= CURRENT_DATE + INTERVAL '7 days') as upcoming_alerts_count

FROM pets p;

-- ============================================
-- Storage Bucket Setup (Run separately in Supabase Dashboard)
-- ============================================
-- Create storage bucket for health documents:
-- 1. Go to Storage in Supabase Dashboard
-- 2. Create new bucket: "health-documents"
-- 3. Set it to private
-- 4. Add policy: "Users can upload their own health documents"
-- 5. Add policy: "Users can view their own health documents"
-- 6. Add policy: "Users can delete their own health documents"

