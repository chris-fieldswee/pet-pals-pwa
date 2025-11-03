# Run Health Sharing Migration - Quick Guide

## The Problem
You're getting a 404 error because the `health_profile_shares` table doesn't exist in your database yet.

## The Solution (2 Minutes)

### Step 1: Open Supabase Dashboard
1. Go to https://supabase.com/dashboard
2. Select your project
3. Click **SQL Editor** in the left sidebar
4. Click **New Query**

### Step 2: Copy and Run the Migration
1. Open this file in your code editor: 
   ```
   supabase/migrations/create_health_sharing_feature.sql
   ```
2. Select **ALL** the code (Ctrl/Cmd + A)
3. Copy it (Ctrl/Cmd + C)
4. Paste it into the Supabase SQL Editor
5. Click the **Run** button (or press F5)

### Step 3: Verify It Worked
You should see a success message. To double-check, run this query:

```sql
SELECT table_name 
FROM information_schema.tables 
WHERE table_name IN ('health_profile_shares', 'health_share_access_logs');
```

You should see **2 rows** returned.

### Step 4: Refresh Your App
1. Refresh your browser
2. Try sharing a health profile again
3. It should work now! ✅

---

## What This Migration Creates

- ✅ `health_profile_shares` table - stores share configurations
- ✅ `health_share_access_logs` table - tracks access attempts  
- ✅ Helper functions for token generation
- ✅ Row Level Security (RLS) policies
- ✅ Indexes for performance

---

## Troubleshooting

### "Permission denied" Error?
- Make sure you're logged into Supabase Dashboard
- Check you have admin access to the project

### Still Getting 404 After Running?
1. Check the SQL Editor for any error messages
2. Verify the tables were created:
   ```sql
   \dt health_profile_shares
   ```
3. Make sure you copied the ENTIRE migration file
4. Try refreshing your browser cache (Ctrl/Cmd + Shift + R)

### Need Help?
- Check the migration file for syntax errors
- Look at Supabase Dashboard → Database → Tables to see if tables exist
- Check the browser console for more detailed error messages

