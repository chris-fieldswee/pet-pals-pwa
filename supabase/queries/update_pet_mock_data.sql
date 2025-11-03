-- SQL Script to Add Mock Data for Pet Profile
-- This will update your pet with comprehensive profile information
-- 
-- INSTRUCTIONS:
-- 1. Replace 'YOUR_PET_ID_HERE' with your actual pet ID
--    (You can find it by running: SELECT id, name FROM pets WHERE user_id = auth.uid();)
-- 2. Or use the query below that automatically updates your first pet
-- 3. Run this in Supabase SQL Editor

-- Option 1: Update your first pet automatically
UPDATE pets
SET
  -- Basic Information
  breed = 'Golden Retriever',
  date_of_birth = '2020-06-15',
  gender = 'Male',
  color_or_markings = 'Golden with white chest patch',
  
  -- Personality & Behavior
  personality = 'Friendly, energetic, loves to play fetch and swim. Very social with people and other dogs.',
  favorite_activities = 'Playing fetch, Swimming, Going to dog parks, Learning new tricks',
  activity_level = 'High',
  walk_frequency = 'Daily',
  socialization = 'Well-socialized',
  living_environment = 'House with yard',
  
  -- Physical Information
  weight_lbs = 65.5,
  spayed_or_neutered = true,
  microchip_number = '982000123456789',
  
  -- Health Information
  health_concerns = 'None currently. Regular checkups show excellent health.',
  allergies = 'No known allergies',
  current_medications = 'Heartgard Plus (monthly), NexGard (monthly)',
  vaccinations = 'DHPP (up to date), Rabies (up to date), Bordatella (up to date)',
  flea_tick_prevention = true,
  heartworm_prevention = true,
  dental_care_routine = true,
  
  -- Diet Information
  diet_type = 'Dry kibble with wet food mix',
  feeding_schedule = 'Twice daily - 7:30 AM and 6:00 PM',
  
  -- Veterinary Information
  veterinarian_name = 'Dr. Sarah Johnson',
  clinic_name = 'Paws & Claws Animal Hospital',
  vet_phone = '(555) 123-4567',
  vet_address = '123 Main Street, Anytown, ST 12345',
  
  -- Emergency Contact
  emergency_contact_name = 'John Smith',
  emergency_contact_phone = '(555) 987-6543',
  
  -- Insurance
  pet_insurance = 'Healthy Paws - Policy #HP-2024-789456'
WHERE 
  user_id = auth.uid()
  AND id = (
    SELECT id FROM pets 
    WHERE user_id = auth.uid() 
    ORDER BY created_at ASC 
    LIMIT 1
  )
RETURNING id, name, breed;

-- Option 2: Update a specific pet by ID
-- Uncomment and replace 'YOUR_PET_ID_HERE' with your pet's ID
/*
UPDATE pets
SET
  breed = 'Golden Retriever',
  date_of_birth = '2020-06-15',
  gender = 'Male',
  color_or_markings = 'Golden with white chest patch',
  personality = 'Friendly, energetic, loves to play fetch and swim. Very social with people and other dogs.',
  favorite_activities = 'Playing fetch, Swimming, Going to dog parks, Learning new tricks',
  activity_level = 'High',
  walk_frequency = 'Daily',
  socialization = 'Well-socialized',
  living_environment = 'House with yard',
  weight_lbs = 65.5,
  spayed_or_neutered = true,
  microchip_number = '982000123456789',
  health_concerns = 'None currently. Regular checkups show excellent health.',
  allergies = 'No known allergies',
  current_medications = 'Heartgard Plus (monthly), NexGard (monthly)',
  vaccinations = 'DHPP (up to date), Rabies (up to date), Bordatella (up to date)',
  flea_tick_prevention = true,
  heartworm_prevention = true,
  dental_care_routine = true,
  diet_type = 'Dry kibble with wet food mix',
  feeding_schedule = 'Twice daily - 7:30 AM and 6:00 PM',
  veterinarian_name = 'Dr. Sarah Johnson',
  clinic_name = 'Paws & Claws Animal Hospital',
  vet_phone = '(555) 123-4567',
  vet_address = '123 Main Street, Anytown, ST 12345',
  emergency_contact_name = 'John Smith',
  emergency_contact_phone = '(555) 987-6543',
  pet_insurance = 'Healthy Paws - Policy #HP-2024-789456'
WHERE 
  id = 'YOUR_PET_ID_HERE'
  AND user_id = auth.uid()
RETURNING id, name, breed;
*/

-- To verify the update worked, run:
-- SELECT name, breed, gender, weight_lbs, activity_level, personality FROM pets WHERE user_id = auth.uid();

