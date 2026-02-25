-- UGC Referral System
-- Adds referral tracking, codes, and payout management

-- Add referral fields to trips table
ALTER TABLE trips
ADD COLUMN IF NOT EXISTS referral_payout_percent DECIMAL(4,2) DEFAULT 1.0
CHECK (referral_payout_percent >= 0.0 AND referral_payout_percent <= 2.0);

-- Add referral fields to bookings table
ALTER TABLE bookings
ADD COLUMN IF NOT EXISTS ugc_code VARCHAR(32) UNIQUE NOT NULL DEFAULT '',
ADD COLUMN IF NOT EXISTS referral_user_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS referral_payout_amount DECIMAL(10,2);

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

-- Create ugc_videos table if it doesn't exist (simplified for new system)
CREATE TABLE IF NOT EXISTS ugc_videos (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  trip_id UUID NOT NULL REFERENCES trips(id) ON DELETE CASCADE,
  guide_id UUID NOT NULL REFERENCES guides(id) ON DELETE CASCADE,
  creator_user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  booking_id UUID REFERENCES bookings(id) ON DELETE SET NULL,
  ugc_code VARCHAR(32) NOT NULL,
  tiktok_url TEXT NOT NULL,
  tiktok_video_id VARCHAR(50),
  video_status TEXT DEFAULT 'pending' CHECK (video_status IN ('pending', 'published', 'rejected')),
  payment_status TEXT DEFAULT 'unpaid' CHECK (payment_status IN ('unpaid', 'paid', 'failed')),
  stripe_charge_id TEXT,
  engagement_likes INTEGER DEFAULT 0,
  engagement_views INTEGER DEFAULT 0,
  engagement_shares INTEGER DEFAULT 0,
  last_engagement_update TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  published_at TIMESTAMPTZ,
  UNIQUE(ugc_code, trip_id),
  FOREIGN KEY (ugc_code) REFERENCES bookings(ugc_code)
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_referral_earnings_referrer ON referral_earnings(referrer_user_id);
CREATE INDEX IF NOT EXISTS idx_referral_earnings_booking ON referral_earnings(booking_id);
CREATE INDEX IF NOT EXISTS idx_referral_earnings_status ON referral_earnings(status);
CREATE INDEX IF NOT EXISTS idx_ugc_videos_creator ON ugc_videos(creator_user_id);
CREATE INDEX IF NOT EXISTS idx_ugc_videos_trip ON ugc_videos(trip_id);
CREATE INDEX IF NOT EXISTS idx_ugc_videos_code ON ugc_videos(ugc_code);
CREATE INDEX IF NOT EXISTS idx_bookings_referral ON bookings(referral_user_id);
CREATE INDEX IF NOT EXISTS idx_bookings_ugc_code ON bookings(ugc_code);

-- Enable RLS on new tables
ALTER TABLE referral_earnings ENABLE ROW LEVEL SECURITY;
ALTER TABLE ugc_videos ENABLE ROW LEVEL SECURITY;

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

-- RLS Policies for ugc_videos
-- Public can view published videos
CREATE POLICY "Published UGC videos are public"
  ON ugc_videos FOR SELECT
  USING (video_status = 'published');

-- Creators can view their own submissions
CREATE POLICY "Creators can view their own UGC"
  ON ugc_videos FOR SELECT
  USING (auth.uid() IN (
    SELECT creator_user_id FROM ugc_videos WHERE id = ugc_videos.id
  ));

-- Guides can view UGC for their trips
CREATE POLICY "Guides can view UGC for their trips"
  ON ugc_videos FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM trips t 
    WHERE t.id = ugc_videos.trip_id 
    AND t.guide_id IN (SELECT id FROM guides WHERE user_id = auth.uid())
  ));

-- Creators can submit UGC
CREATE POLICY "Creators can submit UGC videos"
  ON ugc_videos FOR INSERT
  WITH CHECK (auth.uid() = creator_user_id);

-- Guides can approve/reject UGC
CREATE POLICY "Guides can approve/reject UGC for their trips"
  ON ugc_videos FOR UPDATE
  USING (EXISTS (
    SELECT 1 FROM trips t 
    WHERE t.id = ugc_videos.trip_id 
    AND t.guide_id IN (SELECT id FROM guides WHERE user_id = auth.uid())
  ));
