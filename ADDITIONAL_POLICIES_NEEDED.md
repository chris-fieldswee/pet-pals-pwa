# Additional Storage Policies Needed

You currently have:
- ✅ INSERT policy (upload)
- ✅ SELECT policy (read)

You need to add:
- UPDATE policy (replace photo)
- DELETE policy (remove photo)

## Add These Policies

Run this in your Supabase SQL Editor:

```sql
-- UPDATE: Allow users to update/replace their photos
CREATE POLICY "Users can update pet photos"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'pet-photos')
WITH CHECK (bucket_id = 'pet-photos');

-- DELETE: Allow users to delete their photos
CREATE POLICY "Users can delete pet photos"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'pet-photos');
```

## After Adding

You should have **4 total policies**:
1. ✅ INSERT - Users can upload pet photos
2. ✅ SELECT - Users can read pet photos
3. ✅ UPDATE - Users can update pet photos
4. ✅ DELETE - Users can delete pet photos

## Verify in Dashboard

Go to: **Storage** → **pet-photos** → **Policies**

You should see all 4 policies listed there.

## Complete Policy Summary

**Operation** | **Policy** | **Purpose**
-------------|-----------|------------
INSERT | Users can upload pet photos | Upload new photos
SELECT | Users can read pet photos | View/access photos
UPDATE | Users can update pet photos | Replace existing photos
DELETE | Users can delete pet photos | Remove photos

