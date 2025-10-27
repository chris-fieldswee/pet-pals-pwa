# Fix: Profile Not Being Created

## The Issue
When you sign up using OTP verification, the database trigger tries to create a profile but fails because `first_name` isn't set at the time of user creation.

## The Fix

### 1. Update the Database Function (Do this first)

Go to your Supabase Dashboard → SQL Editor and run:

```sql
-- Update the function to handle missing first_name
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  -- Create a profile with a placeholder name if first_name is not set
  INSERT INTO public.profiles (id, first_name, email_marketing_opt_in)
  VALUES (
    new.id,
    COALESCE(new.raw_user_meta_data->>'first_name', 'User'),
    COALESCE((new.raw_user_meta_data->>'email_marketing_opt_in')::boolean, false)
  )
  ON CONFLICT (id) DO UPDATE SET
    first_name = EXCLUDED.first_name,
    email_marketing_opt_in = EXCLUDED.email_marketing_opt_in,
    updated_at = now();
  
  RETURN new;
END;
$$;
```

### 2. Fix Existing Users Without Profiles

Run this in your Supabase SQL Editor:

```sql
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
WHERE p.id IS NULL
ON CONFLICT (id) DO NOTHING;
```

### 3. Verify It's Working

Check that your profile was created:

```sql
SELECT 
  au.email,
  p.first_name,
  p.email_marketing_opt_in,
  p.created_at
FROM auth.users au
JOIN public.profiles p ON au.id = p.id
ORDER BY au.created_at DESC
LIMIT 5;
```

### 4. Code Has Been Updated

The app code has been updated to:
- Manually create/update the profile when you complete signup
- Handle the profile creation even if the trigger fails

## Test the Flow Now

1. Try signing up with a new email
2. Complete the OTP verification
3. Enter your details (name, password, etc.)
4. Check Supabase to verify the profile was created

The profile should now be created automatically! ✅

