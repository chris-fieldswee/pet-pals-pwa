# Quick Start: Add Mock Data to Your Pet

## Step-by-Step Instructions

### Step 1: Open Supabase SQL Editor
1. Go to https://supabase.com/dashboard
2. Select your project
3. Click **SQL Editor** in the left sidebar
4. Click **New Query**

### Step 2: Run the Profile Data Script
1. Open the file: `supabase/queries/update_pet_mock_data.sql`
2. Copy **ALL** the contents (the entire script)
3. Paste it into the Supabase SQL Editor
4. Click **Run** (or press Ctrl/Cmd + Enter)

The script will automatically:
- Find your first pet
- Update it with comprehensive profile data
- Return the pet ID and name to confirm

**Expected Output:**
```
 id                                   | name  | breed
--------------------------------------+-------+------------------
 abc123-def456-...                    | Buddy | Golden Retriever
```

### Step 3: (Optional) Add Health Data
1. First, make sure you've run the migration: `create_health_overview_feature.sql`
2. Open the file: `supabase/queries/add_mock_health_data.sql`
3. Copy and paste into SQL Editor
4. Click **Run**

### Step 4: Verify in Your App
1. Go to your app and navigate to the pet dashboard
2. Check the Profile Page - all sections should have data
3. Check Health Overview - should show records, vitals, and alerts

## Troubleshooting

**If you get "permission denied" error:**
- Make sure you're logged into Supabase Dashboard
- The SQL Editor uses your authenticated session

**If you have multiple pets and want to update a specific one:**
- First, find your pet ID:
  ```sql
  SELECT id, name FROM pets WHERE user_id = auth.uid();
  ```
- Then update the script to use that specific ID (see Option 2 in the SQL file)

**If the profile fields don't show:**
- Make sure you've run `add_pet_profile_fields.sql` migration first

## Quick Check Query

Run this to see your pet's data:
```sql
SELECT 
  name, 
  breed, 
  gender, 
  weight_lbs, 
  activity_level, 
  personality 
FROM pets 
WHERE user_id = auth.uid();
```

