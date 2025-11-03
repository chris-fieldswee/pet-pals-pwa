-- Safe activity insertion queries
-- Replace the IDs with your actual user_id and pet_id

-- ==========================================
-- STEP 1: Get your IDs first
-- ==========================================

-- Get your user ID
SELECT id as user_id, email FROM auth.users WHERE id = auth.uid();

-- Get your pet IDs
SELECT id as pet_id, name, type FROM pets WHERE user_id = auth.uid();

-- ==========================================
-- STEP 2: Insert activities (replace IDs)
-- ==========================================

-- Example: Insert a walk activity
-- (Replace 'actual-pet-id' with a real pet ID from the query above)
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
    auth.uid(),  -- Your user ID
    (SELECT id FROM pets WHERE user_id = auth.uid() LIMIT 1),  -- First pet
    'walk',
    'Morning Walk',
    'Beautiful morning walk in the park! 🐕',
    25,
    1.2,
    true,
    'Central Park'
);

-- Example: Insert a photo activity
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
    auth.uid(),
    (SELECT id FROM pets WHERE user_id = auth.uid() LIMIT 1),
    'photo',
    'Adorable Sleeping Photo',
    'Caught him sleeping like this - too cute not to share! 😴',
    'https://images.unsplash.com/photo-1548199973-03cce0bbc87b',
    'image',
    true
);

-- Example: Insert a feed activity
INSERT INTO activities (
    user_id, 
    pet_id, 
    activity_type, 
    title, 
    description,
    is_public
) VALUES (
    auth.uid(),
    (SELECT id FROM pets WHERE user_id = auth.uid() LIMIT 1),
    'feed',
    'Lunch Time',
    'Ate all his kibble - now time for treats! 🍖',
    true
);

-- Example: Insert a play activity
INSERT INTO activities (
    user_id, 
    pet_id, 
    activity_type, 
    title, 
    description,
    duration_minutes,
    is_public
) VALUES (
    auth.uid(),
    (SELECT id FROM pets WHERE user_id = auth.uid() LIMIT 1),
    'play',
    'Fetch in the Yard',
    'Running around like crazy! So much energy! 🎾',
    15,
    true
);

-- ==========================================
-- STEP 3: Verify your activities
-- ==========================================

-- See all your activities
SELECT 
    id,
    activity_type,
    title,
    created_at,
    (SELECT name FROM pets WHERE pets.id = activities.pet_id) as pet_name
FROM activities 
WHERE user_id = auth.uid() 
ORDER BY created_at DESC;

-- Count your activities by type
SELECT 
    activity_type,
    COUNT(*) as count
FROM activities 
WHERE user_id = auth.uid()
GROUP BY activity_type;



