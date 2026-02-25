-- UGC Videos table for TikTok integration
CREATE TABLE ugc_videos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  trip_id UUID NOT NULL REFERENCES trips(id) ON DELETE CASCADE,
  guide_id UUID NOT NULL REFERENCES guides(id) ON DELETE CASCADE,
  creator_id TEXT NOT NULL, -- External creator ID (TikTok username or email)
  creator_name TEXT NOT NULL,
  creator_handle TEXT NOT NULL,
  creator_followers INTEGER DEFAULT 0,
  tiktok_url TEXT NOT NULL UNIQUE,
  tiktok_video_id TEXT NOT NULL UNIQUE,
  embed_code TEXT, -- HTML embed code from EmbedSocial
  thumbnail_url TEXT,
  video_status TEXT DEFAULT 'pending' CHECK (video_status IN ('pending', 'approved', 'published', 'rejected')),
  engagement_likes INTEGER DEFAULT 0,
  engagement_views INTEGER DEFAULT 0,
  engagement_shares INTEGER DEFAULT 0,
  engagement_comments INTEGER DEFAULT 0,
  engagement_rate DECIMAL(5,2) DEFAULT 0, -- Calculated percentage
  payment_amount DECIMAL(10,2) NOT NULL DEFAULT 150,
  payment_status TEXT DEFAULT 'pending' CHECK (payment_status IN ('pending', 'paid', 'failed')),
  stripe_charge_id TEXT,
  rejected_reason TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  published_at TIMESTAMP WITH TIME ZONE,
  last_engagement_update TIMESTAMP WITH TIME ZONE,
  metadata JSONB DEFAULT '{}', -- Store additional data (campaign, season, etc)
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for performance
CREATE INDEX ugc_videos_trip_id_idx ON ugc_videos(trip_id);
CREATE INDEX ugc_videos_guide_id_idx ON ugc_videos(guide_id);
CREATE INDEX ugc_videos_status_idx ON ugc_videos(video_status);
CREATE INDEX ugc_videos_payment_status_idx ON ugc_videos(payment_status);
CREATE INDEX ugc_videos_creator_idx ON ugc_videos(creator_id);
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

-- Admins can see all UGC videos
CREATE POLICY "ugc_videos_admin_all" ON ugc_videos
  FOR ALL
  USING (
    auth.jwt() ->> 'email' LIKE '%@admin.summitadventures.com'
  );

-- Creator feedback table (optional, for tracking submissions)
CREATE TABLE ugc_submissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  trip_id UUID NOT NULL REFERENCES trips(id) ON DELETE CASCADE,
  creator_email TEXT NOT NULL,
  creator_name TEXT NOT NULL,
  creator_handle TEXT NOT NULL,
  submission_url TEXT NOT NULL,
  submission_status TEXT DEFAULT 'pending',
  feedback_from_guide TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX ugc_submissions_trip_id_idx ON ugc_submissions(trip_id);
CREATE INDEX ugc_submissions_status_idx ON ugc_submissions(submission_status);

-- Creator payment tracking
CREATE TABLE ugc_creator_payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  creator_id TEXT NOT NULL,
  creator_name TEXT NOT NULL,
  creator_email TEXT NOT NULL,
  total_amount DECIMAL(10,2) DEFAULT 0,
  payment_status TEXT DEFAULT 'pending',
  stripe_payout_id TEXT,
  stripe_account_id TEXT,
  videos_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  paid_at TIMESTAMP WITH TIME ZONE,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX ugc_creator_payments_creator_idx ON ugc_creator_payments(creator_id);
CREATE INDEX ugc_creator_payments_status_idx ON ugc_creator_payments(payment_status);

-- Analytics view (aggregates UGC performance)
CREATE VIEW ugc_analytics AS
SELECT
  t.id AS trip_id,
  t.title AS trip_title,
  g.display_name AS guide_name,
  COUNT(u.id) AS total_videos,
  COUNT(CASE WHEN u.video_status = 'published' THEN 1 END) AS published_videos,
  SUM(u.engagement_views) AS total_views,
  SUM(u.engagement_likes) AS total_likes,
  SUM(u.engagement_shares) AS total_shares,
  ROUND(AVG(u.engagement_rate), 2) AS avg_engagement_rate,
  SUM(u.payment_amount) AS total_spend,
  COUNT(CASE WHEN u.payment_status = 'paid' THEN 1 END) AS paid_count,
  MAX(u.published_at) AS latest_publication,
  ROUND(SUM(u.engagement_views)::NUMERIC / NULLIF(SUM(u.payment_amount), 0), 0) AS cost_per_view
FROM ugc_videos u
INNER JOIN trips t ON u.trip_id = t.id
INNER JOIN guides g ON u.guide_id = g.id
GROUP BY t.id, t.title, g.display_name;

-- Create table grants for public access to aggregates
GRANT SELECT ON ugc_analytics TO anon;
GRANT SELECT ON ugc_analytics TO authenticated;
