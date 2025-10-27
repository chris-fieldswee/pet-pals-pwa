-- Add preferences columns to profiles table
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS track_activities BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS manage_health BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS discover_activities BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS training_guidance BOOLEAN DEFAULT false;

-- Add updated_at trigger if not exists
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Add trigger for profiles updated_at if not exists
DROP TRIGGER IF EXISTS update_profiles_updated_at ON public.profiles;
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

