-- First, get your user ID and pet IDs
-- Run these queries to get the actual IDs you need

-- Get your user ID
SELECT id, email FROM auth.users WHERE email = 'your-email@example.com';

-- Or just get all users if you're testing
SELECT id, email FROM auth.users;

-- Get your pet ID
SELECT id, name FROM pets WHERE user_id = 'your-user-id-here';

-- Get all pets for a user (replace with actual user ID)
SELECT id, name, type, breed FROM pets WHERE user_id = (SELECT id FROM auth.users LIMIT 1);

-- After you get these IDs, replace them in the insert queries below



