# Setup Required - Quick Fix Guide

You're seeing errors because some database migrations and the Edge Function haven't been set up yet. Here's how to fix them:

## 🔴 Critical: Run Database Migrations

### Step 1: Health Overview Feature (health_records table)

**Error:** `Failed to load resource: health_records 404`

1. Open Supabase Dashboard → SQL Editor
2. Open file: `supabase/migrations/create_health_overview_feature.sql`
3. Copy ALL contents
4. Paste and Run in SQL Editor

### Step 2: Health Sharing Feature (health_profile_shares table)

**Error:** `Failed to load resource: health_profile_shares 404`

1. In SQL Editor (same place)
2. Open file: `supabase/migrations/create_health_sharing_feature.sql`
3. Copy ALL contents
4. Paste and Run in SQL Editor

### Verify Both Migrations Ran

Run this query:
```sql
SELECT table_name 
FROM information_schema.tables 
WHERE table_name IN (
  'health_records', 
  'health_vitals', 
  'health_alerts', 
  'health_documents',
  'health_profile_shares',
  'health_share_access_logs'
);
```

Should return **6 rows**.

---

## ⚠️ Optional: Deploy Email Edge Function

**Error:** `CORS policy` and `Edge Function` errors

The email sending feature requires deploying an Edge Function. This is **optional** - the share feature works without it, you'll just need to copy/paste the link manually.

### Quick Deploy (5 minutes)

**Option 1: Deploy Function (Recommended)**
```bash
# Install Supabase CLI if needed
npm install -g supabase

# Login
supabase login

# Link project
supabase link --project-ref azlrneosewcrrvtghmga

# Deploy
supabase functions deploy send-health-share-email
```

**Option 2: Skip Email (Works Fine)**
- The share feature works without email
- Just copy the link and share manually
- Email is a nice-to-have, not required

---

## ✅ After Setup

1. **Refresh your browser** (Ctrl/Cmd + Shift + R)
2. **Try sharing a health profile**
3. **Should work now!**

---

## Troubleshooting

### Still Getting 404?

1. **Check tables exist:**
   ```sql
   SELECT * FROM health_records LIMIT 1;
   SELECT * FROM health_profile_shares LIMIT 1;
   ```
   If errors → migrations didn't run properly

2. **Check RLS policies:**
   - Go to Supabase Dashboard → Authentication → Policies
   - Make sure tables have policies enabled

### CORS Error Still Happening?

1. **Function not deployed yet** → That's fine, email is optional
2. **Want to deploy?** → Follow Option 1 above
3. **Don't need email?** → Just ignore the error, share link still works

---

## Priority

**MUST DO:**
- ✅ Run `create_health_overview_feature.sql`
- ✅ Run `create_health_sharing_feature.sql`

**OPTIONAL:**
- ⚠️ Deploy `send-health-share-email` function (for automatic emails)

---

After running the migrations, refresh your app and try again! 🚀

