-- Migration 009: Add TikTok URL support to customer reviews
-- Allows customers to attach TikTok videos to their reviews

ALTER TABLE reviews ADD COLUMN IF NOT EXISTS tiktok_url VARCHAR(500) DEFAULT NULL;
ALTER TABLE reviews ADD COLUMN IF NOT EXISTS video_id VARCHAR(50) DEFAULT NULL;

-- Index for faster lookups of reviews with videos
CREATE INDEX IF NOT EXISTS idx_reviews_with_videos ON reviews(id) WHERE tiktok_url IS NOT NULL;

-- Add RLS policy to allow customers to update their own reviews with TikTok URLs
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Customers can update own review with TikTok" ON reviews
  FOR UPDATE
  USING (
    auth.uid() = customer_id
    AND (auth.jwt() ->> 'app_metadata')::json ->> 'provider' IS NOT NULL
  )
  WITH CHECK (
    auth.uid() = customer_id
    AND (auth.jwt() ->> 'app_metadata')::json ->> 'provider' IS NOT NULL
  );

-- Schema comment for clarity
COMMENT ON COLUMN reviews.tiktok_url IS 'Full TikTok URL (e.g., https://www.tiktok.com/@creator/video/1234567890)';
COMMENT ON COLUMN reviews.video_id IS 'Extracted TikTok video ID for embedding (e.g., 1234567890)';
