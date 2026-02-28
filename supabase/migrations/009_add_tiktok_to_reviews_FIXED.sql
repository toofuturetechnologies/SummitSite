-- Migration 009 (FIXED): Add TikTok URL support to customer reviews
-- Allows customers to attach TikTok videos to their reviews
-- FIXED: Uses reviewer_id instead of customer_id

ALTER TABLE reviews ADD COLUMN IF NOT EXISTS tiktok_url VARCHAR(500) DEFAULT NULL;
ALTER TABLE reviews ADD COLUMN IF NOT EXISTS video_id VARCHAR(50) DEFAULT NULL;

-- Index for faster lookups of reviews with videos
CREATE INDEX IF NOT EXISTS idx_reviews_with_videos ON reviews(id) WHERE tiktok_url IS NOT NULL;

-- Ensure RLS is enabled
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;

-- Allow users to update their own reviews with TikTok URLs
-- Uses reviewer_id which is the user who wrote the review
DROP POLICY IF EXISTS "Customers can update own review with TikTok" ON reviews;

CREATE POLICY "Users can update own review with TikTok" ON reviews
  FOR UPDATE
  USING (auth.uid() = reviewer_id)
  WITH CHECK (auth.uid() = reviewer_id);

-- Schema comments for clarity
COMMENT ON COLUMN reviews.tiktok_url IS 'Full TikTok URL (e.g., https://www.tiktok.com/@creator/video/1234567890)';
COMMENT ON COLUMN reviews.video_id IS 'Extracted TikTok video ID for embedding (e.g., 1234567890)';
