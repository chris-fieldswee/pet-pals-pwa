-- Complete Storage Policies for pet-photos bucket
-- Run this in Supabase SQL Editor after creating the bucket

-- UPDATE Policy: Allow users to update their own photos
CREATE POLICY "Users can update pet photos"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'pet-photos')
WITH CHECK (bucket_id = 'pet-photos');

-- DELETE Policy: Allow users to delete their own photos
CREATE POLICY "Users can delete pet photos"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'pet-photos');

-- Optional: If you already have the INSERT and SELECT policies,
-- these two are the remaining ones you need.

-- To see all current policies:
-- SELECT * FROM pg_policies WHERE tablename = 'objects' AND schemaname = 'storage';

