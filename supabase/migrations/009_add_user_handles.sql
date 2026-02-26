-- Add user handles (like @username on social media)
-- Handles are unique, indexed, and used for referral lookups

-- Add handle column to profiles table
ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS handle VARCHAR(50) UNIQUE,
ADD COLUMN IF NOT EXISTS handle_created_at TIMESTAMPTZ;

-- Create index for handle lookup performance
CREATE INDEX IF NOT EXISTS idx_profiles_handle ON profiles(handle);

-- Generate handles for existing users who don't have one
-- Format: @firstname-lastname or @firstname-lastname-random if duplicate
DO $$
DECLARE
  profile_record RECORD;
  base_handle VARCHAR(50);
  final_handle VARCHAR(50);
  counter INT := 0;
BEGIN
  FOR profile_record IN 
    SELECT id, full_name FROM profiles WHERE handle IS NULL
  LOOP
    -- Create base handle from full_name
    base_handle := '@' || LOWER(REGEXP_REPLACE(profile_record.full_name, '\s+', '-', 'g'));
    base_handle := SUBSTRING(base_handle FROM 1 FOR 50); -- Max 50 chars
    
    final_handle := base_handle;
    counter := 0;
    
    -- Check if handle exists, append number if needed
    WHILE EXISTS (SELECT 1 FROM profiles WHERE handle = final_handle) LOOP
      counter := counter + 1;
      final_handle := base_handle || '-' || counter::TEXT;
      final_handle := SUBSTRING(final_handle FROM 1 FOR 50);
    END LOOP;
    
    -- Update the profile with generated handle
    UPDATE profiles 
    SET handle = final_handle, handle_created_at = NOW()
    WHERE id = profile_record.id;
  END LOOP;
END $$;

-- Make handle NOT NULL after populating
ALTER TABLE profiles
ALTER COLUMN handle SET NOT NULL;

-- Add constraint to validate handle format (alphanumeric, hyphens, underscores)
ALTER TABLE profiles
ADD CONSTRAINT handle_format_check CHECK (
  handle ~ '^@[a-zA-Z0-9_-]{2,49}$'
);

-- Verification query
SELECT 
  id,
  email,
  full_name,
  handle,
  handle_created_at
FROM profiles
WHERE email IN ('alex.mountain@example.com', 'jane.traveler@example.com', 'john.explorer@example.com')
ORDER BY email;
