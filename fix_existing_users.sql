-- Run this SQL in your Supabase SQL Editor to fix existing users without profiles

-- For users without profiles, create a profile
INSERT INTO public.profiles (id, first_name, email_marketing_opt_in, created_at, updated_at)
SELECT 
  au.id,
  COALESCE(au.raw_user_meta_data->>'first_name', 'User') as first_name,
  COALESCE((au.raw_user_meta_data->>'email_marketing_opt_in')::boolean, false) as email_marketing_opt_in,
  au.created_at,
  now() as updated_at
FROM auth.users au
LEFT JOIN public.profiles p ON au.id = p.id
WHERE p.id IS NULL;

-- Verify the results
SELECT 
  au.id,
  au.email,
  au.raw_user_meta_data->>'first_name' as first_name,
  p.first_name as profile_first_name,
  p.id as profile_id
FROM auth.users au
LEFT JOIN public.profiles p ON au.id = p.id;

