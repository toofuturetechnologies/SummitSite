-- Check the actual schema of the reviews table
SELECT column_name, data_type, is_nullable
FROM information_schema.columns 
WHERE table_name = 'reviews'
ORDER BY ordinal_position;

-- Also check if table exists
SELECT EXISTS (
  SELECT 1 FROM information_schema.tables 
  WHERE table_name = 'reviews'
) as reviews_table_exists;
