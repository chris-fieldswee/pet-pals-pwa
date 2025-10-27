# Setup Walk Feature - Database Instructions

## Overview
This guide provides instructions to set up the database schema for the Pet Walking feature, including standard walks and guided audio walks.

## Database Tables Created

### 1. **guided_walks** Table
Library of available guided walk content with audio guides.

**Key Columns:**
- `id` - Unique identifier
- `title` - Walk title (e.g., "Loose Leash Basics")
- `subtitle` - Short description
- `duration` - Length in minutes
- `category` - Walk category (e.g., "Leash Training", "Energy Burners")
- `level` - Difficulty (Easy, Intermediate, Advanced)
- `trainer_name`, `trainer_bio`, `trainer_image_url` - Trainer info
- `hero_image_url` - Main image
- `audio_url` - Link to audio guide file
- `practice_tags` - Array of skills practiced
- `is_featured` - Feature on homepage
- `is_free` - Free vs premium

### 2. **walks** Table
Tracks individual walk sessions (standard and guided).

**Key Columns:**
- `id` - Unique identifier
- `pet_id` - Reference to pets table
- `guided_walk_id` - NULL for standard walks, reference for guided
- `walk_type` - "standard" or "guided"
- `start_time`, `end_time` - Walk timing
- `duration_seconds` - Total duration
- `distance_meters`, `distance_miles` - Distance metrics
- `average_pace` - Calculated pace
- `calories_burned` - Estimated calories
- `route_data` - JSONB array of GPS points `[{lat, lng, timestamp}]`
- `weather_condition`, `temperature_celsius` - Weather data
- `music_provider` - "spotify" or "apple_music"
- `playlist_name` - Current playlist
- `status` - "active", "completed", "paused", "cancelled"
- `notes` - User notes

### 3. **user_saved_walks** Table
Tracks saved/downloaded guided walks for offline use.

**Key Columns:**
- `id` - Unique identifier
- `user_id` - Reference to user
- `guided_walk_id` - Reference to guided walk
- `status` - "saved", "downloaded", or "completed"
- `saved_at`, `completed_at` - Timestamps

## Setup Instructions

### Step 1: Run the Migration

```bash
# Using Supabase CLI
supabase db push

# Or via Supabase Dashboard
# 1. Go to your project dashboard
# 2. Navigate to SQL Editor
# 3. Copy the contents of supabase/migrations/create_walk_feature.sql
# 4. Run the SQL
```

### Step 2: Verify Tables

Check that all tables were created successfully:

```sql
-- Verify tables exist
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('guided_walks', 'walks', 'user_saved_walks');

-- Check sample guided walks were inserted
SELECT title, category, duration FROM guided_walks;
```

### Step 3: Test RLS Policies

Verify Row Level Security is working:

```sql
-- Should return walk count
SELECT COUNT(*) FROM walks WHERE user_id = auth.uid();

-- Should return guided walks (public)
SELECT COUNT(*) FROM guided_walks;
```

## Seed Data Included

The migration includes 6 sample guided walks across 3 categories:

### Get Started Collection (2 walks)
- "First Walk" (10 min)
- "Puppy's Day Out" (15 min)

### Leash Training 101 (2 walks)
- "Loose Leash Basics" (20 min) - Featured
- "Handling Distractions" (25 min)

### Energy Burners (2 walks)
- "Speedy Sessions" (15 min)
- "Long Haul" (45 min)

## Helper Functions

### `calculate_walk_distance(route_data JSONB)`
Calculates total distance from GPS route points using the Haversine formula.

**Usage:**
```sql
SELECT calculate_walk_distance(route_data) 
FROM walks 
WHERE id = 'walk-id';
```

### `get_user_walk_stats(p_user_id UUID)`
Returns comprehensive walking statistics for a user.

**Usage:**
```sql
SELECT * FROM get_user_walk_stats(auth.uid());
```

**Returns:**
- `total_walks` - Total completed walks
- `total_distance_miles` - Total distance
- `total_duration_minutes` - Total time
- `average_pace` - Average pace
- `this_week_walks` - Walks this week
- `this_month_walks` - Walks this month

## Adding More Guided Walks

To add more guided walks to the library:

```sql
INSERT INTO guided_walks (
    title, subtitle, description, duration, category, level, 
    trainer_name, trainer_bio, practice_tags, hero_image_url, is_featured
) VALUES (
    'Your Walk Title',
    'Short subtitle',
    'Detailed description...',
    30, -- duration in minutes
    'Category Name', -- e.g., "Leash Training"
    'Intermediate', -- Easy, Intermediate, Advanced
    'Trainer Name',
    'Trainer bio...',
    ARRAY['Tag1', 'Tag2', 'Tag3'],
    'https://example.com/image.jpg',
    false -- is_featured
);
```

## Storage for Audio Files

The `guided_walks.audio_url` column should point to files stored in Supabase Storage.

**Recommendation:**
Create a storage bucket for guided walk audio:

1. Go to Storage in Supabase Dashboard
2. Create bucket: `guided-walk-audio`
3. Set public policy (for accessibility)
4. Upload audio files (MP3 format recommended)
5. Update `audio_url` in guided_walks table with file URLs

## Storage Bucket for Walk Route Data

For storing walk route snapshots (optional):

1. Create bucket: `walk-routes`
2. Store route snapshots as JSON files
3. Reference in walks table

## Testing the Feature

### Test Walk Creation

```sql
-- Create a test walk
INSERT INTO walks (
    pet_id, user_id, walk_type, start_time, status
) VALUES (
    (SELECT id FROM pets LIMIT 1),
    auth.uid(),
    'standard',
    NOW(),
    'active'
);
```

### Test Guided Walk Selection

```sql
-- Get featured guided walks
SELECT * FROM guided_walks WHERE is_featured = true;

-- Get walks by category
SELECT * FROM guided_walks WHERE category = 'Leash Training';
```

### Test Saved Walks

```sql
-- Save a guided walk
INSERT INTO user_saved_walks (user_id, guided_walk_id, status)
VALUES (
    auth.uid(),
    (SELECT id FROM guided_walks LIMIT 1),
    'saved'
);

-- Get user's saved walks
SELECT gw.*, usw.status, usw.saved_at
FROM user_saved_walks usw
JOIN guided_walks gw ON usw.guided_walk_id = gw.id
WHERE usw.user_id = auth.uid();
```

## Next Steps

1. ✅ Run the migration
2. ✅ Verify tables and seed data
3. ✅ Test RLS policies
4. Set up Supabase Storage for audio files
5. Configure walk tracking permissions
6. Implement GPS tracking functionality
7. Add music integration endpoints

## Additional Considerations

### Audio File Requirements
- Format: MP3 (recommended) or M4A
- Bitrate: 128kbps or higher
- Duration: 10-45 minutes
- File size: Keep under 25MB for mobile

### GPS Tracking
- Capture location every 5-10 seconds
- Store as JSONB array in `route_data`
- Include timestamp with each point
- Consider privacy for route data

### Performance
- The `route_data` JSONB column can grow large for long walks
- Consider archiving or compressing old walk data
- Index `start_time` for efficient date range queries

