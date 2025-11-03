-- Migration: Add Pet Walking Feature
-- Description: Creates tables and functions to support walk tracking (standard and guided walks)

-- ==========================================
-- 1. GUIDED WALKS LIBRARY
-- ==========================================

-- Table: guided_walks
-- Stores the library of available guided walks with categories, trainers, and content
CREATE TABLE IF NOT EXISTS guided_walks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    subtitle TEXT,
    description TEXT,
    duration INTEGER NOT NULL, -- Duration in minutes
    category TEXT NOT NULL, -- e.g., "Leash Training", "Energy Burners", "Get Started"
    level TEXT NOT NULL, -- "Easy", "Intermediate", "Advanced"
    trainer_name TEXT,
    trainer_bio TEXT,
    trainer_image_url TEXT,
    hero_image_url TEXT NOT NULL,
    audio_url TEXT, -- URL to the audio guide file
    practice_tags TEXT[], -- Array of tags like ["Focus", "Rewards", "Anti-Pulling"]
    is_featured BOOLEAN DEFAULT false,
    is_free BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create index for quick category filtering
CREATE INDEX IF NOT EXISTS idx_guided_walks_category ON guided_walks(category);

-- Create index for level filtering
CREATE INDEX IF NOT EXISTS idx_guided_walks_level ON guided_walks(level);

-- Enable RLS
ALTER TABLE guided_walks ENABLE ROW LEVEL SECURITY;

-- Policy: All users can read guided walks (public library)
CREATE POLICY "Guided walks are viewable by everyone" ON guided_walks
    FOR SELECT USING (true);

-- ==========================================
-- 2. WALK SESSIONS
-- ==========================================

-- Table: walks
-- Tracks individual walk sessions (both standard and guided)
CREATE TABLE IF NOT EXISTS walks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    pet_id UUID NOT NULL REFERENCES pets(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    guided_walk_id UUID REFERENCES guided_walks(id) ON DELETE SET NULL, -- NULL for standard walks
    walk_type TEXT NOT NULL CHECK (walk_type IN ('standard', 'guided')),
    
    -- Walk tracking data
    start_time TIMESTAMPTZ,
    end_time TIMESTAMPTZ,
    duration_seconds INTEGER, -- Total duration in seconds
    distance_meters DECIMAL(10, 2), -- Distance traveled in meters
    distance_miles DECIMAL(10, 2), -- Distance in miles for display
    average_pace TEXT, -- e.g., "12:30 per mile"
    calories_burned INTEGER,
    
    -- Route data (stored as JSON)
    route_data JSONB, -- Array of {lat, lng, timestamp} points
    
    -- Weather data
    weather_condition TEXT,
    temperature_celsius DECIMAL(5, 2),
    
    -- Music integration
    music_provider TEXT, -- 'spotify', 'apple_music', null
    playlist_name TEXT,
    
    -- Status
    status TEXT NOT NULL CHECK (status IN ('active', 'completed', 'paused', 'cancelled')) DEFAULT 'active',
    notes TEXT,
    
    -- Metadata
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for common queries
CREATE INDEX IF NOT EXISTS idx_walks_pet_id ON walks(pet_id);
CREATE INDEX IF NOT EXISTS idx_walks_user_id ON walks(user_id);
CREATE INDEX IF NOT EXISTS idx_walks_guided_walk_id ON walks(guided_walk_id);
CREATE INDEX IF NOT EXISTS idx_walks_start_time ON walks(start_time DESC);
CREATE INDEX IF NOT EXISTS idx_walks_status ON walks(status);

-- Enable RLS
ALTER TABLE walks ENABLE ROW LEVEL SECURITY;

-- Policy: Users can only see their own walks
CREATE POLICY "Users can view their own walks" ON walks
    FOR SELECT USING (auth.uid() = user_id);

-- Policy: Users can only insert their own walks
CREATE POLICY "Users can insert their own walks" ON walks
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Policy: Users can only update their own walks
CREATE POLICY "Users can update their own walks" ON walks
    FOR UPDATE USING (auth.uid() = user_id);

-- Policy: Users can only delete their own walks
CREATE POLICY "Users can delete their own walks" ON walks
    FOR DELETE USING (auth.uid() = user_id);

-- ==========================================
-- 3. SAVED/DOWNLOADED GUIDED WALKS
-- ==========================================

-- Table: user_saved_walks
-- Tracks which guided walks users have saved or downloaded for offline use
CREATE TABLE IF NOT EXISTS user_saved_walks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    guided_walk_id UUID NOT NULL REFERENCES guided_walks(id) ON DELETE CASCADE,
    status TEXT NOT NULL CHECK (status IN ('saved', 'downloaded', 'completed')) DEFAULT 'saved',
    saved_at TIMESTAMPTZ DEFAULT NOW(),
    completed_at TIMESTAMPTZ,
    
    UNIQUE(user_id, guided_walk_id)
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_user_saved_walks_user_id ON user_saved_walks(user_id);
CREATE INDEX IF NOT EXISTS idx_user_saved_walks_guided_walk_id ON user_saved_walks(guided_walk_id);
CREATE INDEX IF NOT EXISTS idx_user_saved_walks_status ON user_saved_walks(status);

-- Enable RLS
ALTER TABLE user_saved_walks ENABLE ROW LEVEL SECURITY;

-- Policy: Users can only see their own saved walks
CREATE POLICY "Users can view their own saved walks" ON user_saved_walks
    FOR SELECT USING (auth.uid() = user_id);

-- Policy: Users can insert their own saved walks
CREATE POLICY "Users can insert their own saved walks" ON user_saved_walks
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Policy: Users can update their own saved walks
CREATE POLICY "Users can update their own saved walks" ON user_saved_walks
    FOR UPDATE USING (auth.uid() = user_id);

-- Policy: Users can delete their own saved walks
CREATE POLICY "Users can delete their own saved walks" ON user_saved_walks
    FOR DELETE USING (auth.uid() = user_id);

-- ==========================================
-- 4. HELPER FUNCTIONS
-- ==========================================

-- Function: Update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for walks table
CREATE TRIGGER update_walks_updated_at
    BEFORE UPDATE ON walks
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Trigger for guided_walks table
CREATE TRIGGER update_guided_walks_updated_at
    BEFORE UPDATE ON guided_walks
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Function: Calculate walk distance from route data
CREATE OR REPLACE FUNCTION calculate_walk_distance(route_data JSONB)
RETURNS DECIMAL AS $$
DECLARE
    total_distance DECIMAL := 0;
    i INTEGER;
    point_count INTEGER;
BEGIN
    IF route_data IS NULL OR jsonb_array_length(route_data) < 2 THEN
        RETURN 0;
    END IF;
    
    point_count := jsonb_array_length(route_data);
    
    FOR i IN 1..point_count - 1 LOOP
        total_distance := total_distance + (
            -- Haversine formula for distance between two lat/lng points
            6371000 * acos(
                cos(radians((route_data->i->>'lat')::DECIMAL)) *
                cos(radians((route_data->(i+1)->>'lat')::DECIMAL)) *
                cos(radians((route_data->(i+1)->>'lng')::DECIMAL) - radians((route_data->i->>'lng')::DECIMAL)) +
                sin(radians((route_data->i->>'lat')::DECIMAL)) *
                sin(radians((route_data->(i+1)->>'lat')::DECIMAL))
            )
        );
    END LOOP;
    
    RETURN total_distance;
END;
$$ LANGUAGE plpgsql;

-- Function: Get user's walk statistics
CREATE OR REPLACE FUNCTION get_user_walk_stats(p_user_id UUID)
RETURNS TABLE (
    total_walks BIGINT,
    total_distance_miles DECIMAL,
    total_duration_minutes INTEGER,
    average_pace TEXT,
    this_week_walks BIGINT,
    this_month_walks BIGINT
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        COUNT(*)::BIGINT as total_walks,
        COALESCE(SUM(CASE WHEN distance_miles IS NOT NULL THEN distance_miles ELSE 0 END), 0) as total_distance_miles,
        COALESCE(SUM(duration_seconds) / 60, 0)::INTEGER as total_duration_minutes,
        'TODO: Calculate avg pace'::TEXT as average_pace,
        (SELECT COUNT(*)::BIGINT FROM walks WHERE user_id = p_user_id AND start_time >= date_trunc('week', NOW())) as this_week_walks,
        (SELECT COUNT(*)::BIGINT FROM walks WHERE user_id = p_user_id AND start_time >= date_trunc('month', NOW())) as this_month_walks
    FROM walks
    WHERE user_id = p_user_id AND status = 'completed';
END;
$$ LANGUAGE plpgsql;

-- ==========================================
-- 5. SEED DATA FOR GUIDED WALKS
-- ==========================================

-- Insert sample guided walks for the library
INSERT INTO guided_walks (title, subtitle, description, duration, category, level, trainer_name, trainer_bio, practice_tags, hero_image_url, is_featured) VALUES
    -- Get Started Collection
    ('First Walk', 'Practical tips for you and your new friend', 'Start your walking journey with confidence. This beginner-friendly walk introduces basic leash handling and builds a positive walking experience for both you and your pet.', 10, 'Get Started', 'Easy', 'Sarah Jenkins', 'Certified dog trainer with 15 years of experience', ARRAY['Basics', 'Leash Handling', 'Confidence'], 'https://images.unsplash.com/photo-1548199973-03cce0bbc87b', true),
    ('Puppy''s Day Out', 'Practical tips for you and your new friend', 'Perfect for young pets! Learn how to introduce your puppy to the world safely while making walks enjoyable and educational.', 15, 'Get Started', 'Easy', 'Sarah Jenkins', 'Certified dog trainer with 15 years of experience', ARRAY['Puppy', 'Socialization', 'Safety'], 'https://images.unsplash.com/photo-1551717743-49959800b1f6', true),
    
    -- Leash Training 101
    ('Loose Leash Basics', 'Guided tips to stop pulling and start enjoying', 'Master the fundamentals of loose-leash walking. Learn proven techniques to teach your dog to walk calmly by your side without constant pulling.', 20, 'Leash Training', 'Easy', 'Michael Chen', 'Behavior specialist focused on positive reinforcement training', ARRAY['Leash Training', 'Positive Reinforcement', 'Calm Walking'], 'https://images.unsplash.com/photo-1583336663077-fe0e71893ddb', true),
    ('Handling Distractions', 'Guided tips to stop pulling and start enjoying', 'Navigate real-world distractions with confidence. This guided walk teaches you how to manage exciting triggers like other dogs, squirrels, and busy streets.', 25, 'Leash Training', 'Intermediate', 'Michael Chen', 'Behavior specialist focused on positive reinforcement training', ARRAY['Distractions', 'Focus', 'Control'], 'https://images.unsplash.com/photo-1601758228041-f3b2795255f1', false),
    
    -- Energy Burners
    ('Speedy Sessions', 'Intervals and activities for high-energy pets', 'Perfect for pets with boundless energy! This fast-paced interval walk alternates between walking and structured play to burn off steam.', 15, 'Energy Burners', 'Intermediate', 'Emma Rodriguez', 'Fitness trainer specializing in canine athletics', ARRAY['High Energy', 'Intervals', 'Activity'], 'https://images.unsplash.com/photo-1605559424843-9e4c228bf1c2', false),
    ('Long Haul', 'Intervals and activities for high-energy pets', 'An extended walk designed for pets with exceptional stamina. Great for preparing for longer adventures or challenging your active pet.', 45, 'Energy Burners', 'Advanced', 'Emma Rodriguez', 'Fitness trainer specializing in canine athletics', ARRAY['Endurance', 'Stamina', 'Advanced'], 'https://images.unsplash.com/photo-1507146426996-ef05306b995a', false);

-- ==========================================
-- COMMENTS FOR DOCUMENTATION
-- ==========================================

COMMENT ON TABLE guided_walks IS 'Library of available guided walking content with audio guides and trainer information';
COMMENT ON TABLE walks IS 'Tracks individual walk sessions (both standard and guided) with route data, distance, and metrics';
COMMENT ON TABLE user_saved_walks IS 'Tracks which guided walks users have saved, downloaded, or completed for personal library';

COMMENT ON COLUMN walks.walk_type IS 'standard for self-led walks, guided for audio-guided walks';
COMMENT ON COLUMN walks.route_data IS 'JSONB array of {lat, lng, timestamp, accuracy} points captured during walk';
COMMENT ON COLUMN walks.status IS 'active=paused/completed=cancelled';



