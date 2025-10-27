-- Fix the handle_new_user function to handle cases where first_name is not set
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  -- Only insert if first_name exists in metadata, otherwise skip
  IF new.raw_user_meta_data->>'first_name' IS NOT NULL THEN
    INSERT INTO public.profiles (id, first_name, email_marketing_opt_in)
    VALUES (
      new.id,
      new.raw_user_meta_data->>'first_name',
      COALESCE((new.raw_user_meta_data->>'email_marketing_opt_in')::boolean, false)
    )
    ON CONFLICT (id) DO UPDATE SET
      first_name = EXCLUDED.first_name,
      email_marketing_opt_in = EXCLUDED.email_marketing_opt_in,
      updated_at = now();
  ELSE
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
  END IF;
  
  RETURN new;
END;
$$;

