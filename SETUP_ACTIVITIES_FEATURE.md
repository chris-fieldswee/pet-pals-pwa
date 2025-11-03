# Setup Activities Feed Feature - Database Instructions

## Overview
This guide sets up the activities feed feature where users can share their pet activities and follow other users to see their activities.

## Database Schema

### 1. **follows** Table
Tracks user following relationships for the social feed.

**Key Columns:**
- `follower_id` - User who is following
- `following_id` - User being followed
- Unique constraint prevents duplicate follows

### 2. **activities** Table
Stores user pet activities shared in the feed.

**Key Columns:**
- `user_id` - Owner of the activity
- `pet_id` - Pet this activity is for
- `activity_type` - Type: 'walk', 'feed', 'play', 'health', 'photo', 'milestone'
- `title`, `description` - Activity details
- `duration_minutes`, `distance_miles`, `calories_burned` - Metrics
- `media_url`, `media_type` - Photo/video (optional)
- `location_name` - Where the activity happened
- `walk_id` - Reference to walks table (for walk activities)
- `is_public` - Privacy setting (true = visible to all, false = followers only)
- `share_location` - Whether to share location
- `likes_count`, `comments_count` - Engagement metrics

### 3. **activity_likes** Table
Tracks likes on activities.

**Key Columns:**
- `activity_id` - Activity being liked
- `user_id` - User who liked it
- Unique constraint prevents double-likes

### 4. **activity_comments** Table
Stores comments on activities.

**Key Columns:**
- `activity_id` - Activity being commented on
- `user_id` - Comment author
- `content` - Comment text

## Setup Instructions

### Step 1: Run the Migration

```bash
# Using Supabase CLI
supabase db push

# Or via Supabase Dashboard
# 1. Go to your project dashboard
# 2. Navigate to SQL Editor
# 3. Copy the contents of supabase/migrations/create_activities_feature.sql
# 4. Run the SQL
```

### Step 2: Insert Sample Activities

After running the migration, insert some sample activities:

```sql
-- First, get a user ID and pet ID
SELECT id FROM auth.users LIMIT 1;
SELECT id FROM pets LIMIT 1;

-- Then insert activities (replace IDs)
INSERT INTO activities (
    user_id, pet_id, activity_type, title, description, duration_minutes, distance_miles, is_public, location_name
) VALUES (
    'your-user-id-here',
    'your-pet-id-here',
    'walk',
    'Morning Walk',
    'Beautiful morning walk in the park! 🐕',
    25,
    1.2,
    true,
    'Central Park'
);
```

### Step 3: Verify Tables

```sql
-- Check tables exist
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('follows', 'activities', 'activity_likes', 'activity_comments');

-- Check RLS policies
SELECT tablename, policyname 
FROM pg_policies 
WHERE schemaname = 'public'
AND tablename IN ('follows', 'activities', 'activity_likes', 'activity_comments');
```

## Helper Functions

### `get_activity_feed(p_user_id UUID, p_limit INTEGER DEFAULT 20)`
Returns a personalized activity feed for a user, including:
- Their own activities
- Activities from users they follow
- Public activities

**Returns:**
- Activity details
- User info (name, avatar)
- Pet info (name, photo)
- Engagement metrics
- Whether current user has liked it
- Whether it's their own activity

**Usage:**
```sql
SELECT * FROM get_activity_feed(auth.uid(), 20);
```

## Sample Activities Query

Use the queries in `supabase/queries/insert_sample_activities.sql` as templates:

```sql
-- Insert a walk activity
INSERT INTO activities (user_id, pet_id, activity_type, title, description, duration_minutes, distance_miles, is_public)
VALUES (auth.uid(), 'pet-id', 'walk', 'Evening Walk', 'Nice walk before dinner', 30, 1.5, true);

-- Insert a photo activity
INSERT INTO activities (user_id, pet_id, activity_type, title, description, media_url, media_type, is_public)
VALUES (auth.uid(), 'pet-id', 'photo', 'Cute Photo', 'Looking adorable', 'https://image-url.com', 'image', true);

-- Insert a feed activity
INSERT INTO activities (user_id, pet_id, activity_type, title, description, is_public)
VALUES (auth.uid(), 'pet-id', 'feed', 'Dinner', 'Ate everything in record time!', true);
```

## Activity Types

1. **walk** - Walking activities (link to walks table)
2. **feed** - Feeding activities
3. **play** - Playtime activities
4. **health** - Health checkups, vet visits
5. **photo** - Photo posts
6. **milestone** - Special moments, birthdays, achievements

## Privacy Model

Activities have two privacy settings:

1. **`is_public = true`** - Visible to everyone
2. **`is_public = false`** - Only visible to followers

The feed logic includes:
- User's own activities
- Activities from users they follow
- Public activities from others

## Engagement

### Likes
```sql
-- Like an activity
INSERT INTO activity_likes (activity_id, user_id)
VALUES ('activity-id', auth.uid());

-- Unlike
DELETE FROM activity_likes 
WHERE activity_id = 'activity-id' AND user_id = auth.uid();
```

### Comments
```sql
-- Add a comment
INSERT INTO activity_comments (activity_id, user_id, content)
VALUES ('activity-id', auth.uid(), 'Great photo!');

-- Get comments for an activity
SELECT * FROM activity_comments 
WHERE activity_id = 'activity-id' 
ORDER BY created_at ASC;
```

## Follow/Unfollow

```sql
-- Follow a user
INSERT INTO follows (follower_id, following_id)
VALUES (auth.uid(), 'user-to-follow-id');

-- Unfollow
DELETE FROM follows 
WHERE follower_id = auth.uid() 
AND following_id = 'user-to-unfollow-id';

-- Get users you follow
SELECT 
    p.id, p.first_name, p.avatar_url, 
    pp.name as pet_name, pp.photo_url as pet_photo
FROM follows f
JOIN profiles p ON f.following_id = p.id
LEFT JOIN pets pp ON pp.user_id = p.id AND pp.is_default = true
WHERE f.follower_id = auth.uid();

-- Get your followers
SELECT 
    p.id, p.first_name, p.avatar_url, 
    pp.name as pet_name, pp.photo_url as pet_photo
FROM follows f
JOIN profiles p ON f.follower_id = p.id
LEFT JOIN pets pp ON pp.user_id = p.id AND pp.is_default = true
WHERE f.following_id = auth.uid();
```

## Implementation Notes

### Auto-Updating Counts
The database includes triggers that automatically update:
- `likes_count` when users like/unlike activities
- `comments_count` when users comment on activities

### Performance
- Indexes on frequently queried columns
- Efficient feed query using the helper function
- RLS policies ensure data privacy

### Media Storage
For media URLs, you can store:
- URLs from Supabase Storage
- External URLs (Imgur, etc.)
- Base64 encoded images (not recommended for large files)

Consider creating a storage bucket:
```sql
-- In Supabase Dashboard > Storage
-- Create bucket: activity-media
-- Set policy: public-read for viewable content
```

## Testing

After setup, test with these queries:

```sql
-- Get sample activities
SELECT * FROM activities ORDER BY created_at DESC LIMIT 10;

-- Get activity feed
SELECT * FROM get_activity_feed(auth.uid(), 10);

-- Test a like
INSERT INTO activity_likes (activity_id, user_id)
SELECT id, auth.uid() FROM activities LIMIT 1;
```

## Next Steps

1. ✅ Run the migration
2. ✅ Insert sample activities
3. ✅ Test the feed query
4. Build the Activity Feed UI component
5. Implement follow/unfollow functionality
6. Add like and comment features
7. Implement media upload for activities



