-- ==========================================
-- STEP 1: Get your actual IDs
-- ==========================================

-- Get your user ID (run this first)
SELECT id as user_id, email FROM auth.users ORDER BY created_at DESC LIMIT 5;

-- Get your pet IDs (use the user_id from above)
-- Replace 'YOUR_USER_ID_FROM_ABOVE' with the actual ID
SELECT id as pet_id, name, type FROM pets 
WHERE user_id = 'YOUR_USER_ID_FROM_ABOVE';

-- ==========================================
-- STEP 2: Insert activities with REAL IDs
-- ==========================================

-- Copy and replace the IDs below with your actual user_id and pet_id

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
    'REPLACE_WITH_YOUR_USER_ID',  -- Your actual user ID from step 1
    'REPLACE_WITH_YOUR_PET_ID',   -- Your actual pet ID from step 1
    'walk',
    'Morning Walk',
    'Beautiful morning walk in the park! 🐕',
    25,
    1.2,
    true,
    'Central Park'
);

-- Example: Feed activity
INSERT INTO activities (
    user_id, 
    pet_id, 
    activity_type, 
    title, 
    description,
    is_public
) VALUES (
    'REPLACE_WITH_YOUR_USER_ID',
    'REPLACE_WITH_YOUR_PET_ID',
    'feed',
    'Lunch Time',
    'Ate all his kibble - now time for treats! 🍖',
    true
);

-- Example: Photo activity
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
    'REPLACE_WITH_YOUR_USER_ID',
    'REPLACE_WITH_YOUR_PET_ID',
    'photo',
    'Adorable Sleeping Photo',
    'Caught him sleeping like this - too cute not to share! 😴',
    'https://images.unsplash.com/photo-1548199973-03cce0bbc87b',
    'image',
    true
);

-- Example: Play activity
INSERT INTO activities (
    user_id, 
    pet_id, 
    activity_type, 
    title, 
    description,
    duration_minutes,
    is_public
) VALUES (
    'REPLACE_WITH_YOUR_USER_ID',
    'REPLACE_WITH_YOUR_PET_ID',
    'play',
    'Fetch in the Yard',
    'Running around like crazy! So much energy! 🎾',
    15,
    true
);

-- Example: Health activity
INSERT INTO activities (
    user_id, 
    pet_id, 
    activity_type, 
    title, 
    description,
    duration_minutes,
    is_public
) VALUES (
    'REPLACE_WITH_YOUR_USER_ID',
    'REPLACE_WITH_YOUR_PET_ID',
    'health',
    'Vet Checkup',
    'Annual checkup went great! Everything looks perfect ✨',
    30,
    true
);

-- Example: Milestone activity
INSERT INTO activities (
    user_id, 
    pet_id, 
    activity_type, 
    title, 
    description,
    is_public
) VALUES (
    'REPLACE_WITH_YOUR_USER_ID',
    'REPLACE_WITH_YOUR_PET_ID',
    'milestone',
    'First Day Home!',
    'Welcome home buddy! 🎉 Can''t believe it''s been 1 year already!',
    true
);

-- ==========================================
-- STEP 3: Verify your activities
-- ==========================================

-- See all activities for a specific user
-- Replace with your actual user_id
SELECT 
    id,
    activity_type,
    title,
    description,
    created_at,
    (SELECT name FROM pets WHERE pets.id = activities.pet_id) as pet_name
FROM activities 
WHERE user_id = 'REPLACE_WITH_YOUR_USER_ID'
ORDER BY created_at DESC;

