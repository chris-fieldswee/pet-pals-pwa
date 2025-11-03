-- Sample queries to insert activities into the database
-- Run these after setting up users and pets

-- ==========================================
-- SAMPLE QUERIES TO INSERT ACTIVITIES
-- ==========================================

-- NOTE: Replace 'USER_ID_HERE' and 'PET_ID_HERE' with actual IDs from your database
-- You can get these by running: SELECT id FROM auth.users LIMIT 1;
-- And: SELECT id FROM pets LIMIT 1;

-- 1. Walk Activity
INSERT INTO activities (
    user_id, 
    pet_id, 
    activity_type, 
    title, 
    description, 
    duration_minutes, 
    distance_miles, 
    is_public,
    location_name
) VALUES (
    'USER_ID_HERE',
    'PET_ID_HERE',
    'walk',
    'Morning Walk',
    'Beautiful morning walk in the park! 🐕',
    25,
    1.2,
    true,
    'Central Park'
);

-- 2. Feeding Activity
INSERT INTO activities (
    user_id, 
    pet_id, 
    activity_type, 
    title, 
    description,
    is_public
) VALUES (
    'USER_ID_HERE',
    'PET_ID_HERE',
    'feed',
    'Lunch Time',
    'Ate all his kibble - now time for treats! 🍖',
    true
);

-- 3. Play Activity
INSERT INTO activities (
    user_id, 
    pet_id, 
    activity_type, 
    title, 
    description,
    duration_minutes,
    is_public
) VALUES (
    'USER_ID_HERE',
    'PET_ID_HERE',
    'play',
    'Fetch in the Yard',
    'Running around like crazy! So much energy! 🎾',
    15,
    true
);

-- 4. Photo Activity with media
INSERT INTO activities (
    user_id, 
    pet_id, 
    activity_type, 
    title, 
    description,
    media_url,
    media_type,
    is_public
) VALUES (
    'USER_ID_HERE',
    'PET_ID_HERE',
    'photo',
    'Adorable Sleeping Photo',
    'Caught him sleeping like this - too cute not to share! 😴',
    'https://images.unsplash.com/photo-1548199973-03cce0bbc87b',
    'image',
    true
);

-- 5. Milestone Activity
INSERT INTO activities (
    user_id, 
    pet_id, 
    activity_type, 
    title, 
    description,
    is_public
) VALUES (
    'USER_ID_HERE',
    'PET_ID_HERE',
    'milestone',
    'First Day Home!',
    'Welcome home buddy! 🎉 Can''t believe it''s been 1 year already!',
    true
);

-- 6. Health Activity
INSERT INTO activities (
    user_id, 
    pet_id, 
    activity_type, 
    title, 
    description,
    duration_minutes,
    is_public
) VALUES (
    'USER_ID_HERE',
    'PET_ID_HERE',
    'health',
    'Vet Checkup',
    'Annual checkup went great! Everything looks perfect ✨',
    30,
    true
);

-- ==========================================
-- QUERY TO GET ACTIVITY FEED
-- ==========================================

-- Get activity feed for a specific user
-- SELECT * FROM get_activity_feed('USER_ID_HERE', 20);

-- ==========================================
-- QUERY TO INSERT A FOLLOW RELATIONSHIP
-- ==========================================

-- User A follows User B
-- INSERT INTO follows (follower_id, following_id)
-- VALUES ('USER_A_ID', 'USER_B_ID');

-- ==========================================
-- QUERY TO LIKE AN ACTIVITY
-- ==========================================

-- Like an activity
-- INSERT INTO activity_likes (activity_id, user_id)
-- VALUES ('ACTIVITY_ID', 'USER_ID');

-- Unlike (delete the like)
-- DELETE FROM activity_likes 
-- WHERE activity_id = 'ACTIVITY_ID' AND user_id = 'USER_ID';

-- ==========================================
-- QUERY TO COMMENT ON AN ACTIVITY
-- ==========================================

-- Add a comment
-- INSERT INTO activity_comments (activity_id, user_id, content)
-- VALUES ('ACTIVITY_ID', 'USER_ID', 'Great to see you having fun!');

-- ==========================================
-- HELPFUL QUERIES
-- ==========================================

-- Get all activities for a specific pet
-- SELECT * FROM activities WHERE pet_id = 'PET_ID' ORDER BY created_at DESC;

-- Get all activities for the current user
-- SELECT * FROM activities WHERE user_id = auth.uid() ORDER BY created_at DESC;

-- Get users you follow
-- SELECT * FROM follows WHERE follower_id = auth.uid();

-- Get your followers
-- SELECT * FROM follows WHERE following_id = auth.uid();

-- Get activities with engagement stats
-- SELECT 
--     a.*,
--     COUNT(DISTINCT al.id) as likes_count,
--     COUNT(DISTINCT ac.id) as comments_count
-- FROM activities a
-- LEFT JOIN activity_likes al ON a.id = al.activity_id
-- LEFT JOIN activity_comments ac ON a.id = ac.activity_id
-- GROUP BY a.id
-- ORDER BY a.created_at DESC;



