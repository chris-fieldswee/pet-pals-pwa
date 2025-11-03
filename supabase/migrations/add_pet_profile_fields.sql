-- Migration: Add comprehensive pet profile fields
-- Description: Extends the pets table with detailed profile information

ALTER TABLE pets ADD COLUMN IF NOT EXISTS breed TEXT;
ALTER TABLE pets ADD COLUMN IF NOT EXISTS date_of_birth DATE;
ALTER TABLE pets ADD COLUMN IF NOT EXISTS gender TEXT CHECK (gender IN ('Male', 'Female'));
ALTER TABLE pets ADD COLUMN IF NOT EXISTS color_or_markings TEXT;
ALTER TABLE pets ADD COLUMN IF NOT EXISTS personality TEXT;
ALTER TABLE pets ADD COLUMN IF NOT EXISTS favorite_activities TEXT;
ALTER TABLE pets ADD COLUMN IF NOT EXISTS activity_level TEXT;
ALTER TABLE pets ADD COLUMN IF NOT EXISTS walk_frequency TEXT;
ALTER TABLE pets ADD COLUMN IF NOT EXISTS diet_type TEXT;
ALTER TABLE pets ADD COLUMN IF NOT EXISTS feeding_schedule TEXT;
ALTER TABLE pets ADD COLUMN IF NOT EXISTS socialization TEXT;
ALTER TABLE pets ADD COLUMN IF NOT EXISTS living_environment TEXT;
ALTER TABLE pets ADD COLUMN IF NOT EXISTS weight_lbs DECIMAL(5, 2);
ALTER TABLE pets ADD COLUMN IF NOT EXISTS spayed_or_neutered BOOLEAN;
ALTER TABLE pets ADD COLUMN IF NOT EXISTS microchip_number TEXT;
ALTER TABLE pets ADD COLUMN IF NOT EXISTS health_concerns TEXT;
ALTER TABLE pets ADD COLUMN IF NOT EXISTS allergies TEXT;
ALTER TABLE pets ADD COLUMN IF NOT EXISTS current_medications TEXT;
ALTER TABLE pets ADD COLUMN IF NOT EXISTS vaccinations TEXT;
ALTER TABLE pets ADD COLUMN IF NOT EXISTS flea_tick_prevention BOOLEAN DEFAULT false;
ALTER TABLE pets ADD COLUMN IF NOT EXISTS heartworm_prevention BOOLEAN DEFAULT false;
ALTER TABLE pets ADD COLUMN IF NOT EXISTS dental_care_routine BOOLEAN DEFAULT false;
ALTER TABLE pets ADD COLUMN IF NOT EXISTS veterinarian_name TEXT;
ALTER TABLE pets ADD COLUMN IF NOT EXISTS clinic_name TEXT;
ALTER TABLE pets ADD COLUMN IF NOT EXISTS vet_phone TEXT;
ALTER TABLE pets ADD COLUMN IF NOT EXISTS vet_address TEXT;
ALTER TABLE pets ADD COLUMN IF NOT EXISTS emergency_contact_name TEXT;
ALTER TABLE pets ADD COLUMN IF NOT EXISTS emergency_contact_phone TEXT;
ALTER TABLE pets ADD COLUMN IF NOT EXISTS pet_insurance TEXT;

-- Add indexes for common queries
CREATE INDEX IF NOT EXISTS idx_pets_breed ON pets(breed);
CREATE INDEX IF NOT EXISTS idx_pets_gender ON pets(gender);

-- Comments for documentation
COMMENT ON COLUMN pets.activity_level IS 'Activity level of the pet (Low, Moderate, High, Very High)';
COMMENT ON COLUMN pets.walk_frequency IS 'How often pet is walked (Daily, Several times a week, Weekly, Rarely)';
COMMENT ON COLUMN pets.socialization IS 'Socialization level (Well-socialized, Somewhat social, Needs improvement)';
COMMENT ON COLUMN pets.living_environment IS 'Where pet lives (House with yard, Apartment, Rural area, etc.)';



