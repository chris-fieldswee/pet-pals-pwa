-- Migration: Add Activities Feed Feature
-- Description: Creates tables for user activities, follows, and social feed

-- ==========================================
-- 1. FOLLOWS TABLE
-- ==========================================

CREATE TABLE IF NOT EXISTS follows (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    follower_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    following_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    
    UNIQUE(follower_id, following_id),
    CHECK(follower_id != following_id)
);

CREATE INDEX IF NOT EXISTS idx_follows_follower ON follows(follower_id);
CREATE INDEX IF NOT EXISTS idx_follows_following ON follows(following_id);

ALTER TABLE follows ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view who they follow" ON follows
    FOR SELECT USING (auth.uid() = follower_id OR auth.uid() = following_id);

CREATE POLICY "Users can follow others" ON follows
    FOR INSERT WITH CHECK (auth.uid() = follower_id);

CREATE POLICY "Users can unfollow" ON follows
    FOR DELETE USING (auth.uid() = follower_id);

-- ==========================================
-- 2. ACTIVITIES TABLE
-- ==========================================

CREATE TABLE IF NOT EXISTS activities (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    pet_id UUID NOT NULL REFERENCES pets(id) ON DELETE CASCADE,
    
    -- Activity type
    activity_type TEXT NOT NULL CHECK (activity_type IN ('walk', 'feed', 'play', 'health', 'photo', 'milestone')),
    
    -- Activity data
    title TEXT,
    description TEXT,
    duration_minutes INTEGER,
    distance_miles DECIMAL(10, 2),
    calories_burned INTEGER,
    
    -- Photo/video
    media_url TEXT,
    media_type TEXT CHECK (media_type IN ('image', 'video')),
    
    -- Location
    location_name TEXT,
    
    -- Walk-specific data
    walk_id UUID REFERENCES walks(id) ON DELETE SET NULL,
    
    -- Privacy settings
    is_public BOOLEAN DEFAULT true,
    share_location BOOLEAN DEFAULT false,
    
    -- Engagement
    likes_count INTEGER DEFAULT 0,
    comments_count INTEGER DEFAULT 0,
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_activities_user_id ON activities(user_id);
CREATE INDEX IF NOT EXISTS idx_activities_pet_id ON activities(pet_id);
CREATE INDEX IF NOT EXISTS idx_activities_type ON activities(activity_type);
CREATE INDEX IF NOT EXISTS idx_activities_created_at ON activities(created_at DESC);

ALTER TABLE activities ENABLE ROW LEVEL SECURITY;

-- Users can see their own activities
CREATE POLICY "Users can view their own activities" ON activities
    FOR SELECT USING (auth.uid() = user_id);

-- Users can see public activities
CREATE POLICY "Users can view public activities" ON activities
    FOR SELECT USING (is_public = true);

-- Users can see activities of people they follow
CREATE POLICY "Users can view following activities" ON activities
    FOR SELECT USING (
        user_id IN (
            SELECT following_id FROM follows WHERE follower_id = auth.uid()
        )
    );

-- Users can insert their own activities
CREATE POLICY "Users can insert their own activities" ON activities
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Users can update their own activities
CREATE POLICY "Users can update their own activities" ON activities
    FOR UPDATE USING (auth.uid() = user_id);

-- Users can delete their own activities
CREATE POLICY "Users can delete their own activities" ON activities
    FOR DELETE USING (auth.uid() = user_id);

-- ==========================================
-- 3. ACTIVITY LIKES TABLE
-- ==========================================

CREATE TABLE IF NOT EXISTS activity_likes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    activity_id UUID NOT NULL REFERENCES activities(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    
    UNIQUE(activity_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_activity_likes_activity ON activity_likes(activity_id);
CREATE INDEX IF NOT EXISTS idx_activity_likes_user ON activity_likes(user_id);

ALTER TABLE activity_likes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Everyone can view likes" ON activity_likes
    FOR SELECT USING (true);

CREATE POLICY "Users can like activities" ON activity_likes
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can unlike activities" ON activity_likes
    FOR DELETE USING (auth.uid() = user_id);

-- ==========================================
-- 4. ACTIVITY COMMENTS TABLE
-- ==========================================

CREATE TABLE IF NOT EXISTS activity_comments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    activity_id UUID NOT NULL REFERENCES activities(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_activity_comments_activity ON activity_comments(activity_id);
CREATE INDEX IF NOT EXISTS idx_activity_comments_user ON activity_comments(user_id);

ALTER TABLE activity_comments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Everyone can view comments on activities they can see" ON activity_comments
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM activities 
            WHERE activities.id = activity_comments.activity_id
            AND (
                activities.user_id = auth.uid() 
                OR activities.is_public = true
                OR activities.user_id IN (
                    SELECT following_id FROM follows WHERE follower_id = auth.uid()
                )
            )
        )
    );

CREATE POLICY "Users can comment on activities they can see" ON activity_comments
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own comments" ON activity_comments
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own comments" ON activity_comments
    FOR DELETE USING (auth.uid() = user_id);

-- ==========================================
-- 5. TRIGGERS
-- ==========================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_activities_updated_at
    BEFORE UPDATE ON activities
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_comments_updated_at
    BEFORE UPDATE ON activity_comments
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Trigger to update likes count
CREATE OR REPLACE FUNCTION update_activity_likes_count()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        UPDATE activities 
        SET likes_count = likes_count + 1 
        WHERE id = NEW.activity_id;
    ELSIF TG_OP = 'DELETE' THEN
        UPDATE activities 
        SET likes_count = likes_count - 1 
        WHERE id = OLD.activity_id;
    END IF;
    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER activity_likes_count_trigger
    AFTER INSERT OR DELETE ON activity_likes
    FOR EACH ROW
    EXECUTE FUNCTION update_activity_likes_count();

-- Trigger to update comments count
CREATE OR REPLACE FUNCTION update_activity_comments_count()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        UPDATE activities 
        SET comments_count = comments_count + 1 
        WHERE id = NEW.activity_id;
    ELSIF TG_OP = 'DELETE' THEN
        UPDATE activities 
        SET comments_count = comments_count - 1 
        WHERE id = OLD.activity_id;
    END IF;
    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER activity_comments_count_trigger
    AFTER INSERT OR DELETE ON activity_comments
    FOR EACH ROW
    EXECUTE FUNCTION update_activity_comments_count();

-- ==========================================
-- 6. HELPER FUNCTIONS
-- ==========================================

-- Function to get user's activity feed
CREATE OR REPLACE FUNCTION get_activity_feed(p_user_id UUID, p_limit INTEGER DEFAULT 20)
RETURNS TABLE (
    id UUID,
    user_id UUID,
    pet_id UUID,
    activity_type TEXT,
    title TEXT,
    description TEXT,
    duration_minutes INTEGER,
    distance_miles DECIMAL,
    calories_burned INTEGER,
    media_url TEXT,
    media_type TEXT,
    location_name TEXT,
    is_public BOOLEAN,
    likes_count INTEGER,
    comments_count INTEGER,
    created_at TIMESTAMPTZ,
    user_name TEXT,
    user_avatar_url TEXT,
    pet_name TEXT,
    pet_photo_url TEXT,
    has_liked BOOLEAN,
    is_own_activity BOOLEAN
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        a.id,
        a.user_id,
        a.pet_id,
        a.activity_type,
        a.title,
        a.description,
        a.duration_minutes,
        a.distance_miles,
        a.calories_burned,
        a.media_url,
        a.media_type,
        a.location_name,
        a.is_public,
        a.likes_count,
        a.comments_count,
        a.created_at,
        p.first_name as user_name,
        p.avatar_url as user_avatar_url,
        pt.name as pet_name,
        pt.photo_url as pet_photo_url,
        EXISTS (SELECT 1 FROM activity_likes al WHERE al.activity_id = a.id AND al.user_id = p_user_id) as has_liked,
        a.user_id = p_user_id as is_own_activity
    FROM activities a
    JOIN profiles p ON a.user_id = p.id
    JOIN pets pt ON a.pet_id = pt.id
    WHERE 
        -- Own activities
        a.user_id = p_user_id
        OR
        -- Activities from people they follow
        a.user_id IN (SELECT following_id FROM follows WHERE follower_id = p_user_id)
        OR
        -- Public activities
        (a.is_public = true AND a.user_id != p_user_id)
    ORDER BY a.created_at DESC
    LIMIT p_limit;
END;
$$ LANGUAGE plpgsql;

-- ==========================================
-- 7. SEED DATA
-- ==========================================

-- Note: You'll need to insert with actual user and pet IDs after setup
-- Example queries are provided below

COMMENT ON TABLE follows IS 'Tracks user following relationships for social feed';
COMMENT ON TABLE activities IS 'User pet activities shared in the feed (walks, feeds, play, etc.)';
COMMENT ON TABLE activity_likes IS 'Likes on activities';
COMMENT ON TABLE activity_comments IS 'Comments on activities';

COMMENT ON COLUMN activities.activity_type IS 'walk, feed, play, health, photo, milestone';
COMMENT ON COLUMN activities.is_public IS 'Whether activity is visible to everyone or just followers';
COMMENT ON COLUMN activities.walk_id IS 'Reference to walks table for walk activities';



