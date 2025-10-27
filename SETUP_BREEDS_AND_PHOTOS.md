# Setup: Breeds and Photo Upload

## What's Been Added

### 1. ✅ Breed Selection Dropdown
- Replaced text input with breed dropdown
- Shows breed options based on dog/cat selection
- Database-driven breed list

### 2. ✅ Improved Date Picker
- Day, Month, Year selectors (easier to use than calendar)
- Grid layout with separate dropdowns
- 30 years range (current year - 30)
- Full month names for better UX

### 3. ✅ Photo Upload
- Image upload functionality
- Preview after upload
- 5MB file size limit
- File validation

## Supabase Setup Required

### Step 1: Run the Migration

Run this SQL in your Supabase SQL Editor:

```sql
-- Already created in supabase/migrations/add_breeds_table.sql
-- Copy the contents and run it in Supabase SQL Editor
```

This will:
- Create the `breeds` table
- Insert 30 dog breeds
- Insert 30 cat breeds
- Enable RLS

### Step 2: Enable Storage Bucket

1. Go to **Supabase Dashboard** → **Storage**
2. Create a new bucket called `pet-photos`
3. Set it as **Public**
4. Add RLS policy:

```sql
-- Allow authenticated users to upload photos
CREATE POLICY "Users can upload pet photos"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'pet-photos');

-- Allow users to read their own photos
CREATE POLICY "Users can read pet photos"
ON storage.objects FOR SELECT
TO authenticated
USING (bucket_id = 'pet-photos');
```

### Step 3: Update RLS for Storage

Go to **Storage** → **pet-photos** → **Policies**

Add these policies:

**Policy 1: Upload**
- Policy name: "Allow authenticated uploads"
- Allowed operation: INSERT
- Target roles: authenticated
- USING expression: true

**Policy 2: Read**
- Policy name: "Allow public reads"
- Allowed operation: SELECT
- Target roles: anon, authenticated
- USING expression: true

## Testing

1. Run the migration SQL
2. Create the storage bucket
3. Add the policies
4. Test adding a pet in the app
5. Verify breed dropdown works
6. Verify date pickers work
7. Upload a photo and verify it displays

## Database Schema

### New Table: breeds
```
id: UUID
name: VARCHAR(100)
type: pet_type (enum: 'dog' | 'cat')
created_at: TIMESTAMP
```

### Updated: pets table
The `pets` table now properly uses:
- `breed` field (from breeds table name)
- `birth_date` field (formatted as YYYY-MM-DD)
- `photo_url` field (from Supabase Storage)

## Usage

### In AddPetStep2:
- **Breed**: Dropdown with all available breeds for the selected pet type
- **Birthday**: Three separate selectors for Day/Month/Year
- **Photo**: Click to upload, preview shows after upload

The UI automatically:
- Loads breeds when pet type is selected
- Validates photo size
- Stores photo in Supabase Storage
- Displays uploaded photo

