-- Create breeds table with dog and cat breeds
CREATE TABLE IF NOT EXISTS public.breeds (
  id UUID NOT NULL DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL,
  type public.pet_type NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  PRIMARY KEY (id)
);

-- Enable Row Level Security
ALTER TABLE public.breeds ENABLE ROW LEVEL SECURITY;

-- RLS Policy - everyone can view breeds
CREATE POLICY "Anyone can view breeds"
  ON public.breeds
  FOR SELECT
  USING (true);

-- Create index for faster lookups
CREATE INDEX idx_breeds_type ON public.breeds(type);

-- Insert dog breeds
INSERT INTO public.breeds (name, type) VALUES
('Labrador Retriever', 'dog'),
('German Shepherd', 'dog'),
('Golden Retriever', 'dog'),
('French Bulldog', 'dog'),
('Bulldog', 'dog'),
('Poodle', 'dog'),
('Beagle', 'dog'),
('Rottweiler', 'dog'),
('German Shorthaired Pointer', 'dog'),
('Dachshund', 'dog'),
('Yorkshire Terrier', 'dog'),
('Boxer', 'dog'),
('Siberian Husky', 'dog'),
('Great Dane', 'dog'),
('Doberman Pinscher', 'dog'),
('Miniature Schnauzer', 'dog'),
('Cavalier King Charles Spaniel', 'dog'),
('Shih Tzu', 'dog'),
('Australian Shepherd', 'dog'),
('Border Collie', 'dog'),
('Bernese Mountain Dog', 'dog'),
('Pomeranian', 'dog'),
('Cocker Spaniel', 'dog'),
('Basset Hound', 'dog'),
('English Springer Spaniel', 'dog'),
('Chihuahua', 'dog'),
('Maltese', 'dog'),
('Boston Terrier', 'dog'),
('Havanese', 'dog'),
('Australian Cattle Dog', 'dog');

-- Insert cat breeds
INSERT INTO public.breeds (name, type) VALUES
('Persian', 'cat'),
('Maine Coon', 'cat'),
('British Shorthair', 'cat'),
('Ragdoll', 'cat'),
('Bengal', 'cat'),
('Abyssinian', 'cat'),
('Scottish Fold', 'cat'),
('Siamese', 'cat'),
('American Shorthair', 'cat'),
('Russian Blue', 'cat'),
('Norwegian Forest Cat', 'cat'),
('Sphynx', 'cat'),
('Oriental Shorthair', 'cat'),
('Turkish Angora', 'cat'),
('Devon Rex', 'cat'),
('Burmese', 'cat'),
('Himalayan', 'cat'),
('Cornish Rex', 'cat'),
('Manx', 'cat'),
('Japanese Bobtail', 'cat'),
('Tonkinese', 'cat'),
('Chartreux', 'cat'),
('Somali', 'cat'),
('Egyptian Mau', 'cat'),
('American Curl', 'cat'),
('Birman', 'cat'),
('Savannah', 'cat'),
('Turkish Van', 'cat'),
('European Shorthair', 'cat'),
('Mixed/Unknown', 'cat'),
('Mixed/Unknown', 'dog');



