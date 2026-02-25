-- Update reviews table to support UGC and non-booking reviews
ALTER TABLE reviews
ADD COLUMN IF NOT EXISTS review_type VARCHAR(20) DEFAULT 'trip', -- 'trip' or 'guide'
ADD COLUMN IF NOT EXISTS reviewer_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
ALTER COLUMN booking_id DROP NOT NULL;

-- Drop existing unique constraint if it exists
ALTER TABLE reviews
DROP CONSTRAINT IF EXISTS reviews_booking_id_key;

-- Add new index for reviewer_id
CREATE INDEX IF NOT EXISTS idx_reviews_reviewer_id ON reviews(reviewer_id);
CREATE INDEX IF NOT EXISTS idx_reviews_review_type ON reviews(review_type);

-- Update existing reviews to have review_type = 'trip'
UPDATE reviews SET review_type = 'trip' WHERE review_type IS NULL;

-- Add comment as an alias for body (for consistency with ReviewForm)
ALTER TABLE reviews
RENAME COLUMN comment TO body;

-- Update trigger to handle new structure
CREATE OR REPLACE FUNCTION update_guide_rating()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE guides
  SET 
    avg_rating = (SELECT ROUND(AVG(rating)::numeric, 2) FROM reviews WHERE guide_id = NEW.guide_id),
    review_count = (SELECT COUNT(*) FROM reviews WHERE guide_id = NEW.guide_id)
  WHERE id = NEW.guide_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Recreate trigger
DROP TRIGGER IF EXISTS trigger_update_guide_rating ON reviews;
CREATE TRIGGER trigger_update_guide_rating
AFTER INSERT OR UPDATE ON reviews
FOR EACH ROW
EXECUTE FUNCTION update_guide_rating();

-- Add RLS policies for reviews
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;

-- Allow anyone to read published reviews
CREATE POLICY "reviews_published_readable" ON reviews
  FOR SELECT
  USING (true);

-- Allow users to read/write their own reviews
CREATE POLICY "reviews_own_crud" ON reviews
  FOR ALL
  USING (auth.uid() = reviewer_id OR auth.uid() IN (
    SELECT user_id FROM profiles WHERE id = reviewer_id
  ));
