-- SQL Script to Add Mock Health Data for Pet
-- This adds sample health records, vitals, and alerts to showcase the health features
--
-- INSTRUCTIONS:
-- 1. This automatically finds your first pet and adds mock data
-- 2. Run this in Supabase SQL Editor after running the health overview migration
-- 3. The script will create records for the first pet belonging to the current user

-- First, get the pet ID (replace with actual pet ID if needed)
DO $$
DECLARE
  v_pet_id UUID;
  v_user_id UUID;
  v_record_id UUID;
BEGIN
  -- Get current user's first pet
  SELECT p.id, p.user_id INTO v_pet_id, v_user_id
  FROM pets p
  WHERE p.user_id = auth.uid()
  ORDER BY p.created_at ASC
  LIMIT 1;

  IF v_pet_id IS NULL THEN
    RAISE NOTICE 'No pet found for current user';
    RETURN;
  END IF;

  RAISE NOTICE 'Adding mock health data for pet ID: %', v_pet_id;

  -- Add mock health records
  INSERT INTO health_records (pet_id, user_id, record_type, title, description, date, veterinarian_name, clinic_name, diagnosis, treatment_notes, cost)
  VALUES
    (v_pet_id, v_user_id, 'vet_visit', 'Annual Checkup', 'Annual wellness examination - overall health excellent', '2024-10-15', 'Dr. Sarah Johnson', 'Paws & Claws Animal Hospital', 'Healthy - no issues', 'Continue current diet and exercise routine. Next checkup in 6 months.', 85.00)
  RETURNING id INTO v_record_id;

  INSERT INTO health_records (pet_id, user_id, record_type, title, description, date, vaccine_type, veterinarian_name)
  VALUES
    (v_pet_id, v_user_id, 'vaccination', 'Rabies Vaccine', 'Annual rabies vaccination', '2024-10-15', 'Rabies', 'Dr. Sarah Johnson'),
    (v_pet_id, v_user_id, 'vaccination', 'DHPP Booster', 'Annual DHPP vaccination booster', '2024-10-15', 'DHPP', 'Dr. Sarah Johnson'),
    (v_pet_id, v_user_id, 'medication', 'Heartgard Plus Started', 'Started monthly heartworm prevention', '2024-09-01', 'Heartgard Plus', NULL),
    (v_pet_id, v_user_id, 'medication', 'NexGard Started', 'Started monthly flea and tick prevention', '2024-09-01', 'NexGard', NULL);

  -- Add mock weight vitals (tracking over last 3 months)
  INSERT INTO health_vitals (pet_id, user_id, vital_type, value, unit, measured_at)
  VALUES
    (v_pet_id, v_user_id, 'weight', 64.2, 'lbs', NOW() - INTERVAL '90 days'),
    (v_pet_id, v_user_id, 'weight', 64.8, 'lbs', NOW() - INTERVAL '60 days'),
    (v_pet_id, v_user_id, 'weight', 65.1, 'lbs', NOW() - INTERVAL '30 days'),
    (v_pet_id, v_user_id, 'weight', 65.5, 'lbs', NOW() - INTERVAL '7 days');

  -- Add mock alerts
  INSERT INTO health_alerts (pet_id, user_id, alert_type, title, description, due_date, priority, status)
  VALUES
    (v_pet_id, v_user_id, 'vaccination_due', 'Bordatella Vaccine Due', 'Annual Bordatella vaccination due soon', CURRENT_DATE + INTERVAL '14 days', 'medium', 'active'),
    (v_pet_id, v_user_id, 'checkup_due', '6 Month Checkup', 'Follow-up checkup with Dr. Johnson', CURRENT_DATE + INTERVAL '120 days', 'low', 'active'),
    (v_pet_id, v_user_id, 'medication_refill', 'Heartgard Plus Refill', 'Monthly heartworm prevention refill needed', CURRENT_DATE + INTERVAL '5 days', 'medium', 'active');

  RAISE NOTICE 'Mock health data added successfully!';
  
END $$;

-- Verify the data was added
SELECT 
  'Health Records' as data_type,
  COUNT(*) as count
FROM health_records
WHERE pet_id IN (SELECT id FROM pets WHERE user_id = auth.uid())

UNION ALL

SELECT 
  'Health Vitals' as data_type,
  COUNT(*) as count
FROM health_vitals
WHERE pet_id IN (SELECT id FROM pets WHERE user_id = auth.uid())

UNION ALL

SELECT 
  'Health Alerts' as data_type,
  COUNT(*) as count
FROM health_alerts
WHERE pet_id IN (SELECT id FROM pets WHERE user_id = auth.uid())
  AND status = 'active';

