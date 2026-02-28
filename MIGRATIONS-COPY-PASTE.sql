-- ============================================================================
-- SUMMIT PLATFORM - ALL MIGRATIONS (COPY-PASTE READY)
-- Run these in order in Supabase SQL Editor
-- ============================================================================
-- For each migration, copy the SQL between the markers and paste into 
-- Supabase SQL Editor, then click RUN

-- ============================================================================
-- MIGRATION 001: INITIAL SCHEMA (Already Deployed ✅)
-- ============================================================================
-- Status: ✅ Already deployed - Skip this

-- ============================================================================
-- MIGRATION 002: ADD PAYMENT FIELDS (Already Deployed ✅)
-- ============================================================================
-- Status: ✅ Already deployed - Skip this

-- ============================================================================
-- MIGRATION 003: ADD STRIPE CONNECT (Already Deployed ✅)
-- ============================================================================
-- Status: ✅ Already deployed - Skip this

-- ============================================================================
-- MIGRATION 004: ADD REVIEWS (Already Deployed ✅)
-- ============================================================================
-- Status: ✅ Already deployed - Skip this

-- ============================================================================
-- MIGRATION 005: ADD UGC VIDEOS (Already Deployed ✅)
-- ============================================================================
-- Status: ✅ Already deployed - Skip this

-- ============================================================================
-- MIGRATION 006: UPDATE REVIEWS FOR UGC (Already Deployed ✅)
-- ============================================================================
-- Status: ✅ Already deployed - Skip this

-- ============================================================================
-- MIGRATION 007: UGC REFERRAL SYSTEM (Already Deployed ✅)
-- ============================================================================
-- Status: ✅ Already deployed - Skip this

-- ============================================================================
-- MIGRATION 008: GUIDE REVIEWS OF CUSTOMERS (Already Deployed ✅)
-- ============================================================================
-- Status: ✅ Already deployed - Skip this

-- ============================================================================
-- MIGRATION 009: ADD TIKTOK TO REVIEWS (DEPLOY NOW 🚀)
-- ============================================================================
-- Status: 🚀 Ready for deployment - Copy and paste below

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

-- ============================================================================
-- VERIFICATION
-- ============================================================================
-- Run this to verify Migration 009 was successful:

SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'reviews' 
AND column_name IN ('tiktok_url', 'video_id');

-- Should return 2 rows with tiktok_url and video_id columns

-- ============================================================================
-- DEPLOYMENT CHECKLIST
-- ============================================================================
-- ✅ Migration 009 SQL executed
-- ⬜ Code changes merged to main branch (already done)
-- ⬜ Vercel deployment complete
-- ⬜ Test review form with TikTok URL
-- ⬜ Verify embedded video displays on trip page

-- ============================================================================
-- TROUBLESHOOTING
-- ============================================================================
-- If you get an error, check:
-- 1. reviews table exists: SELECT COUNT(*) FROM reviews;
-- 2. Column doesn't already exist: \d reviews
-- 3. RLS is enabled: SELECT relrowsecurity FROM pg_class WHERE relname = 'reviews';
-- 4. Check Supabase logs for detailed error

-- ============================================================================
-- ROLLBACK (If needed)
-- ============================================================================
-- DROP COLUMN IF EXISTS (uncomment if you need to rollback):
-- ALTER TABLE reviews DROP COLUMN IF EXISTS tiktok_url;
-- ALTER TABLE reviews DROP COLUMN IF EXISTS video_id;
-- DROP INDEX IF EXISTS idx_reviews_with_videos;
-- DROP POLICY IF EXISTS "Customers can update own review with TikTok" ON reviews;

-- ============================================================================
-- NEXT STEPS AFTER DEPLOYMENT
-- ============================================================================
-- 1. Update /app/bookings/review/page.tsx to use ReviewFormWithTikTok
-- 2. Update review API endpoint to accept tiktok_url and video_id
-- 3. Update trip detail page to display TikTokReviewEmbed
-- 4. Test end-to-end with a real TikTok URL
-- 5. Push final commit to main
-- 6. Vercel auto-deploys

-- ============================================================================
-- TEST DATA (Optional)
-- ============================================================================
-- To test, you can manually insert a review with TikTok URL:

-- First, get a booking ID:
-- SELECT id FROM bookings LIMIT 1;

-- Then insert a review (replace booking_id and customer_id with real values):
-- INSERT INTO reviews (
--   booking_id, trip_id, guide_id, customer_id, 
--   rating, title, body,
--   tiktok_url, video_id
-- ) VALUES (
--   'your-booking-id',
--   'your-trip-id', 
--   'your-guide-id',
--   'your-customer-id',
--   5, 'Amazing experience!', 'Great trip with amazing guide.',
--   'https://www.tiktok.com/@adventurers/video/7332445024832916747',
--   '7332445024832916747'
-- );

-- Then query to verify:
-- SELECT id, rating, title, tiktok_url, video_id 
-- FROM reviews 
-- WHERE tiktok_url IS NOT NULL;
