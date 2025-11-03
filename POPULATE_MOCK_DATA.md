# Populate Mock Data for Pet Profile

This guide will help you add comprehensive mock data to your pet's profile and health records.

## Prerequisites

1. Make sure you've run the database migrations:
   - `add_pet_profile_fields.sql` - For profile fields
   - `create_health_overview_feature.sql` - For health tracking (if you want health data)

2. You're logged into Supabase and can access the SQL Editor

## Step 1: Add Profile Mock Data

1. Open Supabase Dashboard → SQL Editor
2. Open the file: `supabase/queries/update_pet_mock_data.sql`
3. Copy the contents into the SQL Editor
4. Run the query - it will automatically update your first pet

**What it adds:**
- Breed, gender, color/markings
- Personality, favorite activities
- Activity level, walk frequency
- Health information (vaccinations, medications, prevention)
- Diet and feeding schedule
- Veterinarian information
- Emergency contacts
- Pet insurance

## Step 2: Add Health Data (Optional)

1. Make sure you've run `create_health_overview_feature.sql` migration first
2. Open the file: `supabase/queries/add_mock_health_data.sql`
3. Copy and run in SQL Editor

**What it adds:**
- 4 Health records (vet visit, 2 vaccinations, 2 medications)
- 4 Weight measurements over 3 months (for charting)
- 3 Active alerts (vaccination due, checkup, medication refill)

## Customization

You can customize the mock data by:
- Changing breed, gender, dates, weights, etc.
- Modifying veterinarian information
- Adjusting health records and dates
- Adding more or different records

## Verify Data

After running the scripts, verify in your app:
- Pet Dashboard should show complete profile info
- Profile Page should display all sections with data
- Health Overview should show records, vitals, and alerts

## Quick SQL to Check Your Pet

```sql
-- See your pets
SELECT id, name, breed, type FROM pets WHERE user_id = auth.uid();

-- See profile data
SELECT name, breed, gender, weight_lbs, activity_level, personality 
FROM pets WHERE user_id = auth.uid();

-- See health records count
SELECT COUNT(*) FROM health_records 
WHERE pet_id IN (SELECT id FROM pets WHERE user_id = auth.uid());
```

