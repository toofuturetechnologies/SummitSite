# Summit Platform - All Supabase Migrations

Complete list of all database migrations needed for Summit Platform deployment.

## Deployment Instructions

### Option 1: Via Supabase Dashboard (Easiest)

1. Login to https://supabase.com/dashboard
2. Select your project: `summit-site-seven`
3. Go to **SQL Editor** → **New Query**
4. Copy-paste each migration SQL below
5. Click **Run** for each one
6. Verify no errors appear

### Option 2: Via CLI

```bash
supabase db push
```

### Order of Deployment

Run migrations in this order:
1. **001_initial_schema.sql** - Core tables
2. **002_add_payment_fields.sql** - Payment tracking
3. **003_add_stripe_connect.sql** - Stripe Connect
4. **004_add_reviews.sql** - Reviews system
5. **005_add_ugc_videos.sql** - UGC video system
6. **006_update_reviews_for_ugc.sql** - Update reviews for UGC
7. **007_add_ugc_referral_system_FIXED.sql** - Referral system
8. **008_add_guide_reviews_of_customers.sql** - Guide reviews (reverse)
9. **009_add_tiktok_to_reviews.sql** - TikTok embedding

---

## Migration 001: Initial Schema

**File**: `supabase/migrations/001_initial_schema.sql`

Core database structure (profiles, guides, trips, trip_dates, media, bookings, etc.)

```sql
-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- PROFILES (extends Supabase auth.users)
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  avatar_url TEXT,
  user_type TEXT NOT NULL CHECK (user_type IN ('traveler', 'guide', 'admin')),
  phone TEXT,
  location TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Auto-create profile on user signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (id, full_name, email, user_type)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', 'New User'),
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'user_type', 'traveler')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- [See full file for complete schema including:
--  GUIDES, TRIPS, TRIP_DATES, MEDIA, BOOKINGS, etc.]
```

**Status**: ✅ Already deployed

---

## Migration 002: Add Payment Fields

**File**: `supabase/migrations/002_add_payment_fields.sql`

Adds Stripe payment tracking to bookings.

```sql
ALTER TABLE bookings
ADD COLUMN stripe_payment_intent_id TEXT,
ADD COLUMN payment_status TEXT DEFAULT 'pending',
ADD COLUMN amount_paid DECIMAL(10,2),
ADD COLUMN paid_at TIMESTAMPTZ;
```

**Status**: ✅ Already deployed

---

## Migration 003: Add Stripe Connect

**File**: `supabase/migrations/003_add_stripe_connect.sql`

Adds Stripe Connect fields for guide payouts.

```sql
ALTER TABLE guides
ADD COLUMN stripe_account_id TEXT,
ADD COLUMN stripe_connected BOOLEAN DEFAULT FALSE,
ADD COLUMN stripe_onboarding_url TEXT,
ADD COLUMN stripe_charges_enabled BOOLEAN DEFAULT FALSE;
```

**Status**: ✅ Already deployed

---

## Migration 004: Add Reviews

**File**: `supabase/migrations/004_add_reviews.sql`

Customer review system.

```sql
CREATE TABLE reviews (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  booking_id UUID UNIQUE NOT NULL REFERENCES bookings(id) ON DELETE CASCADE,
  trip_id UUID NOT NULL REFERENCES trips(id) ON DELETE CASCADE,
  guide_id UUID NOT NULL REFERENCES guides(id) ON DELETE CASCADE,
  customer_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  rating INT NOT NULL CHECK (rating >= 1 AND rating <= 5),
  title TEXT NOT NULL,
  comment TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create index
CREATE INDEX idx_reviews_guide_id ON reviews(guide_id);
CREATE INDEX idx_reviews_trip_id ON reviews(trip_id);

-- Enable RLS
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;

-- Allow anyone to read reviews
CREATE POLICY "reviews_public_read" ON reviews
  FOR SELECT USING (true);

-- Update guide rating trigger
CREATE OR REPLACE FUNCTION update_guide_rating()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE guides
  SET 
    rating = (SELECT ROUND(AVG(rating)::numeric, 2) FROM reviews WHERE guide_id = NEW.guide_id),
    review_count = (SELECT COUNT(*) FROM reviews WHERE guide_id = NEW.guide_id)
  WHERE id = NEW.guide_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_guide_rating
AFTER INSERT OR UPDATE ON reviews
FOR EACH ROW
EXECUTE FUNCTION update_guide_rating();
```

**Status**: ✅ Already deployed

---

## Migration 005: Add UGC Videos

**File**: `supabase/migrations/005_add_ugc_videos.sql`

TikTok UGC video submission system (link-only storage).

```sql
-- UGC Videos table for TikTok integration (Simplified: Link-only storage)
CREATE TABLE ugc_videos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Content (minimal - just store the link)
  tiktok_url TEXT NOT NULL UNIQUE,
  tiktok_video_id TEXT NOT NULL,
  
  -- Relationships
  trip_id UUID NOT NULL REFERENCES trips(id) ON DELETE CASCADE,
  guide_id UUID NOT NULL REFERENCES guides(id) ON DELETE CASCADE,
  
  -- Creator info (for display)
  creator_name TEXT NOT NULL,
  creator_handle TEXT NOT NULL,
  creator_followers INTEGER DEFAULT 0,
  
  -- Approval workflow
  video_status TEXT DEFAULT 'pending' CHECK (video_status IN ('pending', 'approved', 'published', 'rejected')),
  guide_approval_at TIMESTAMP WITH TIME ZONE,
  rejected_reason TEXT,
  
  -- Payment tracking
  payment_amount DECIMAL(10,2) NOT NULL DEFAULT 150,
  payment_status TEXT DEFAULT 'pending' CHECK (payment_status IN ('pending', 'paid', 'failed')),
  stripe_charge_id TEXT,
  paid_at TIMESTAMP WITH TIME ZONE,
  
  -- Engagement metrics
  engagement_likes INTEGER DEFAULT 0,
  engagement_views INTEGER DEFAULT 0,
  engagement_shares INTEGER DEFAULT 0,
  last_engagement_update TIMESTAMP WITH TIME ZONE,
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  published_at TIMESTAMP WITH TIME ZONE
);

-- Indexes for performance
CREATE INDEX ugc_videos_trip_id_idx ON ugc_videos(trip_id);
CREATE INDEX ugc_videos_guide_id_idx ON ugc_videos(guide_id);
CREATE INDEX ugc_videos_status_idx ON ugc_videos(video_status);
CREATE INDEX ugc_videos_payment_status_idx ON ugc_videos(payment_status);
CREATE INDEX ugc_videos_published_at_idx ON ugc_videos(published_at DESC);

-- RLS Policies
ALTER TABLE ugc_videos ENABLE ROW LEVEL SECURITY;

-- Allow anyone to read published UGC videos
CREATE POLICY "ugc_videos_published_readable" ON ugc_videos
  FOR SELECT
  USING (video_status = 'published');

-- Guides can only manage UGC for their own trips
CREATE POLICY "ugc_videos_guide_manage" ON ugc_videos
  FOR ALL
  USING (
    auth.uid() IN (
      SELECT user_id FROM guides WHERE id = ugc_videos.guide_id
    )
  );
```

**Status**: ✅ Already deployed

---

## Migration 006: Update Reviews for UGC

**File**: `supabase/migrations/006_update_reviews_for_ugc.sql`

Updates reviews table to support UGC-linked reviews.

```sql
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
```

**Status**: ✅ Already deployed

---

## Migration 007: UGC Referral System (FIXED)

**File**: `supabase/migrations/007_add_ugc_referral_system_FIXED.sql`

Complete referral system with trip-specific validation.

```sql
-- UGC Referral System (FIXED - handles existing bookings)
-- Adds referral tracking, codes, and payout management

-- Add referral fields to trips table
ALTER TABLE trips
ADD COLUMN IF NOT EXISTS referral_payout_percent DECIMAL(4,2) DEFAULT 1.0
CHECK (referral_payout_percent >= 0.0 AND referral_payout_percent <= 2.0);

-- Add referral fields to bookings table (WITHOUT unique constraint yet)
ALTER TABLE bookings
ADD COLUMN IF NOT EXISTS ugc_code VARCHAR(32),
ADD COLUMN IF NOT EXISTS referral_user_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS referral_payout_amount DECIMAL(10,2);

-- Generate UGC codes for existing bookings
UPDATE bookings
SET ugc_code = 'TRIP-' || SUBSTRING(trip_id::text, 1, 8) || '-' || LPAD(CAST(FLOOR(RANDOM() * 1000000) AS text), 6, '0') || '-' || SUBSTRING(MD5(RANDOM()::text), 1, 6)
WHERE ugc_code IS NULL OR ugc_code = '';

-- Now add UNIQUE constraint after all bookings have codes
ALTER TABLE bookings
ADD CONSTRAINT bookings_ugc_code_unique UNIQUE (ugc_code);

-- Make ugc_code NOT NULL now that all rows have values
ALTER TABLE bookings
ALTER COLUMN ugc_code SET NOT NULL;

-- Create referral_earnings table to track payouts
CREATE TABLE IF NOT EXISTS referral_earnings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  referrer_user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  booking_id UUID NOT NULL REFERENCES bookings(id) ON DELETE CASCADE,
  trip_id UUID NOT NULL REFERENCES trips(id) ON DELETE CASCADE,
  earnings_amount DECIMAL(10,2) NOT NULL CHECK (earnings_amount > 0),
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'paid', 'failed', 'cancelled')),
  stripe_transfer_id TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  paid_at TIMESTAMPTZ,
  UNIQUE(booking_id, referrer_user_id)
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_referral_earnings_referrer ON referral_earnings(referrer_user_id);
CREATE INDEX IF NOT EXISTS idx_referral_earnings_booking ON referral_earnings(booking_id);
CREATE INDEX IF NOT EXISTS idx_referral_earnings_status ON referral_earnings(status);
CREATE INDEX IF NOT EXISTS idx_bookings_referral ON bookings(referral_user_id);
CREATE INDEX IF NOT EXISTS idx_bookings_ugc_code ON bookings(ugc_code);

-- Enable RLS on referral_earnings
ALTER TABLE referral_earnings ENABLE ROW LEVEL SECURITY;

-- RLS Policies for referral_earnings
-- Users can view their own earnings
CREATE POLICY "Users can view their own referral earnings"
  ON referral_earnings FOR SELECT
  USING (auth.uid() IN (
    SELECT referrer_user_id FROM referral_earnings WHERE id = referral_earnings.id
  ));

-- Guides can view earnings from their trips
CREATE POLICY "Guides can view earnings from their trips"
  ON referral_earnings FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM trips t 
    WHERE t.id = referral_earnings.trip_id 
    AND t.guide_id IN (SELECT id FROM guides WHERE user_id = auth.uid())
  ));

-- System can insert earnings records
CREATE POLICY "System can create referral earnings"
  ON referral_earnings FOR INSERT
  WITH CHECK (true);
```

**Status**: ✅ Already deployed (with UGC referral system features)

---

## Migration 008: Guide Reviews of Customers

**File**: `supabase/migrations/008_add_guide_reviews_of_customers.sql`

Allows guides to leave private reviews/feedback about customers after trips.

```sql
-- Create guide_reviews_of_customers table
-- This allows guides to leave reviews/feedback about customers after trips
-- These reviews are private to the guide and not visible to customers

CREATE TABLE IF NOT EXISTS guide_reviews_of_customers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id UUID UNIQUE NOT NULL REFERENCES bookings(id) ON DELETE CASCADE,
  guide_id UUID NOT NULL REFERENCES guides(id) ON DELETE CASCADE,
  customer_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  trip_id UUID NOT NULL REFERENCES trips(id) ON DELETE CASCADE,
  
  rating INT CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  behavior_notes TEXT, -- Observations about customer behavior on trip
  professionalism_rating INT CHECK (professionalism_rating >= 1 AND professionalism_rating <= 5),
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for faster queries
CREATE INDEX idx_guide_reviews_guide_id ON guide_reviews_of_customers(guide_id);
CREATE INDEX idx_guide_reviews_customer_id ON guide_reviews_of_customers(customer_id);
CREATE INDEX idx_guide_reviews_booking_id ON guide_reviews_of_customers(booking_id);
CREATE INDEX idx_guide_reviews_trip_id ON guide_reviews_of_customers(trip_id);

-- RLS: Only guides can see their own reviews they wrote
ALTER TABLE guide_reviews_of_customers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Guides can view their own reviews of customers"
  ON guide_reviews_of_customers
  FOR SELECT
  USING (
    auth.uid() IN (
      SELECT user_id FROM guides WHERE id = guide_id
    )
  );

CREATE POLICY "Guides can create reviews of customers from completed bookings"
  ON guide_reviews_of_customers
  FOR INSERT
  WITH CHECK (
    -- Only the guide of the trip can review the customer
    auth.uid() IN (
      SELECT g.user_id FROM guides g
      WHERE g.id = guide_id
    )
    -- Only for completed trips
    AND booking_id IN (
      SELECT id FROM bookings WHERE status = 'completed'
    )
  );

CREATE POLICY "Guides can update their own reviews"
  ON guide_reviews_of_customers
  FOR UPDATE
  USING (
    auth.uid() IN (
      SELECT user_id FROM guides WHERE id = guide_id
    )
  )
  WITH CHECK (
    auth.uid() IN (
      SELECT user_id FROM guides WHERE id = guide_id
    )
  );

-- Add average ratings for customers (how guides rate them on average)
ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS avg_guide_rating DECIMAL(3,2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS guide_review_count INT DEFAULT 0;

-- Update customer ratings whenever a guide review is added
CREATE OR REPLACE FUNCTION update_customer_guide_rating()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE profiles
  SET 
    avg_guide_rating = (
      SELECT ROUND(AVG(rating)::numeric, 2) 
      FROM guide_reviews_of_customers 
      WHERE customer_id = NEW.customer_id
    ),
    guide_review_count = (
      SELECT COUNT(*) 
      FROM guide_reviews_of_customers 
      WHERE customer_id = NEW.customer_id
    )
  WHERE id = NEW.customer_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_customer_guide_rating ON guide_reviews_of_customers;
CREATE TRIGGER trigger_update_customer_guide_rating
AFTER INSERT OR UPDATE ON guide_reviews_of_customers
FOR EACH ROW
EXECUTE FUNCTION update_customer_guide_rating();
```

**Status**: ✅ Already deployed

---

## Migration 009: Add TikTok to Reviews

**File**: `supabase/migrations/009_add_tiktok_to_reviews.sql`

Allows customers to attach TikTok videos to their trip reviews.

```sql
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
```

**Status**: ✅ Ready for deployment

---

## Deployment Status Summary

| Migration | Status | Notes |
|-----------|--------|-------|
| 001 - Initial Schema | ✅ Deployed | Core tables & auth |
| 002 - Payment Fields | ✅ Deployed | Stripe payment tracking |
| 003 - Stripe Connect | ✅ Deployed | Guide payouts |
| 004 - Reviews | ✅ Deployed | Customer reviews |
| 005 - UGC Videos | ✅ Deployed | TikTok UGC system |
| 006 - Reviews Update | ✅ Deployed | UGC review support |
| 007 - Referral System | ✅ Deployed | Referral earnings |
| 008 - Guide Reviews | ✅ Deployed | Reverse reviews |
| 009 - TikTok Reviews | ✅ Ready | Customer video reviews |

---

## Verification Commands

After deploying all migrations, verify the schema:

```sql
-- Check all tables exist
SELECT table_name FROM information_schema.tables WHERE table_schema = 'public';

-- Check guides table (example)
SELECT * FROM information_schema.columns WHERE table_name = 'guides';

-- Check for indexes
SELECT tablename, indexname FROM pg_indexes WHERE schemaname = 'public';

-- Check RLS policies
SELECT * FROM pg_policies;
```

---

## Support

If you encounter issues:

1. **Check error message** - Most errors will indicate which migration failed
2. **Run one migration at a time** - Makes debugging easier
3. **Verify prerequisites** - Each migration lists its dependencies
4. **Check RLS policies** - May need to adjust auth configurations
5. **Review Supabase logs** - Go to Project Settings → Database → Logs

---

## Related Documentation

- **UGC System**: `TIKTOK-REVIEWS-IMPLEMENTATION.md`
- **Referral System**: `UGC-REFERRAL-SYSTEM-IMPLEMENTATION.md`
- **Guide Reviews**: `FEATURE-COMPLETION-GUIDE-REVIEWS.md`
- **Dark Mode**: `REDESIGN-COMPLETE.md`
