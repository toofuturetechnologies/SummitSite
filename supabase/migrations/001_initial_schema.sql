-- Summit Platform Database Schema
-- Run this in Supabase SQL Editor or via CLI migrations
-- =====================================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- PROFILES (extends Supabase auth.users)
-- =====================================================
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

-- =====================================================
-- GUIDES (guide-specific data)
-- =====================================================
CREATE TABLE guides (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  slug TEXT UNIQUE NOT NULL,
  display_name TEXT NOT NULL,
  bio TEXT,
  tagline TEXT,
  profile_video_url TEXT,
  certifications JSONB DEFAULT '[]',
  -- Example: [{"name": "AMGA Rock Guide", "issuer": "AMGA", "year": 2020}]
  languages TEXT[] DEFAULT '{}',
  specialties TEXT[] DEFAULT '{}',
  -- Example: ['mountaineering', 'rock_climbing', 'ski_touring']
  base_location TEXT,
  years_experience INTEGER,
  rating DECIMAL(3,2) DEFAULT 0.00,
  review_count INTEGER DEFAULT 0,
  response_rate DECIMAL(5,2) DEFAULT 100.00,
  is_verified BOOLEAN DEFAULT FALSE,
  is_active BOOLEAN DEFAULT TRUE,
  stripe_account_id TEXT,
  stripe_onboarding_complete BOOLEAN DEFAULT FALSE,
  commission_rate DECIMAL(5,4) DEFAULT 0.1200, -- 12% default
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id)
);

-- =====================================================
-- TRIPS (listings created by guides)
-- =====================================================
CREATE TYPE activity_type AS ENUM (
  'mountaineering', 'rock_climbing', 'ice_climbing', 'ski_touring',
  'backcountry_skiing', 'hiking', 'via_ferrata', 'alpine_climbing',
  'glacier_travel', 'canyoneering', 'other'
);

CREATE TYPE difficulty_level AS ENUM (
  'beginner', 'intermediate', 'advanced', 'expert'
);

CREATE TABLE trips (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  guide_id UUID NOT NULL REFERENCES guides(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  activity activity_type NOT NULL,
  difficulty difficulty_level NOT NULL,
  description TEXT NOT NULL,
  highlights TEXT[], -- bullet points
  itinerary JSONB, -- [{day: 1, title: "...", description: "..."}]
  inclusions TEXT[] DEFAULT '{}',
  exclusions TEXT[] DEFAULT '{}',
  gear_list TEXT[] DEFAULT '{}',
  meeting_point TEXT,
  duration_days INTEGER NOT NULL CHECK (duration_days > 0),
  price_per_person DECIMAL(10,2) NOT NULL CHECK (price_per_person > 0),
  currency TEXT DEFAULT 'USD',
  max_group_size INTEGER NOT NULL DEFAULT 6,
  min_group_size INTEGER DEFAULT 1,
  -- Location
  country TEXT NOT NULL,
  region TEXT NOT NULL,
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  -- Status
  is_instant_book BOOLEAN DEFAULT FALSE,
  is_active BOOLEAN DEFAULT TRUE,
  is_featured BOOLEAN DEFAULT FALSE,
  -- Stats
  view_count INTEGER DEFAULT 0,
  booking_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- TRIP DATES (availability for trips)
-- =====================================================
CREATE TABLE trip_dates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  trip_id UUID NOT NULL REFERENCES trips(id) ON DELETE CASCADE,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  spots_total INTEGER NOT NULL,
  spots_available INTEGER NOT NULL,
  price_override DECIMAL(10,2), -- null = use trip price
  is_available BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  CHECK (end_date >= start_date),
  CHECK (spots_available >= 0),
  CHECK (spots_available <= spots_total)
);

-- =====================================================
-- MEDIA (photos/videos for trips and guides)
-- =====================================================
CREATE TABLE media (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  entity_type TEXT NOT NULL CHECK (entity_type IN ('trip', 'guide', 'review')),
  entity_id UUID NOT NULL,
  url TEXT NOT NULL,
  thumbnail_url TEXT,
  media_type TEXT NOT NULL CHECK (media_type IN ('image', 'video')),
  display_order INTEGER DEFAULT 0,
  alt_text TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_media_entity ON media(entity_type, entity_id);

-- =====================================================
-- BOOKINGS
-- =====================================================
CREATE TYPE booking_status AS ENUM (
  'pending', 'confirmed', 'completed', 'cancelled', 'refunded', 'disputed'
);

CREATE TABLE bookings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  trip_id UUID NOT NULL REFERENCES trips(id),
  trip_date_id UUID NOT NULL REFERENCES trip_dates(id),
  user_id UUID NOT NULL REFERENCES profiles(id),
  guide_id UUID NOT NULL REFERENCES guides(id),
  status booking_status DEFAULT 'pending',
  participant_count INTEGER NOT NULL DEFAULT 1,
  total_price DECIMAL(10,2) NOT NULL,
  commission_amount DECIMAL(10,2) NOT NULL,
  guide_payout DECIMAL(10,2) NOT NULL,
  currency TEXT DEFAULT 'USD',
  special_requests TEXT,
  -- Stripe
  stripe_payment_intent_id TEXT,
  stripe_transfer_id TEXT,
  -- Timestamps
  confirmed_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  cancelled_at TIMESTAMPTZ,
  cancellation_reason TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- REVIEWS
-- =====================================================
CREATE TABLE reviews (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  booking_id UUID UNIQUE NOT NULL REFERENCES bookings(id),
  trip_id UUID NOT NULL REFERENCES trips(id),
  guide_id UUID NOT NULL REFERENCES guides(id),
  reviewer_id UUID NOT NULL REFERENCES profiles(id),
  rating INTEGER NOT NULL CHECK (rating BETWEEN 1 AND 5),
  title TEXT,
  body TEXT NOT NULL,
  guide_response TEXT,
  guide_responded_at TIMESTAMPTZ,
  is_featured BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Update guide rating when review is added
CREATE OR REPLACE FUNCTION update_guide_rating()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE guides
  SET 
    rating = (SELECT AVG(rating)::DECIMAL(3,2) FROM reviews WHERE guide_id = NEW.guide_id),
    review_count = (SELECT COUNT(*) FROM reviews WHERE guide_id = NEW.guide_id)
  WHERE id = NEW.guide_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER on_review_created
  AFTER INSERT ON reviews
  FOR EACH ROW EXECUTE FUNCTION update_guide_rating();

-- =====================================================
-- MESSAGES (booking-related chat)
-- =====================================================
CREATE TABLE messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  booking_id UUID REFERENCES bookings(id) ON DELETE CASCADE,
  -- For pre-booking inquiries, booking_id is null
  trip_id UUID REFERENCES trips(id),
  sender_id UUID NOT NULL REFERENCES profiles(id),
  recipient_id UUID NOT NULL REFERENCES profiles(id),
  content TEXT NOT NULL,
  read_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_messages_booking ON messages(booking_id);
CREATE INDEX idx_messages_recipient ON messages(recipient_id, read_at);

-- =====================================================
-- INDEXES
-- =====================================================
CREATE INDEX idx_guides_user ON guides(user_id);
CREATE INDEX idx_guides_active ON guides(is_active) WHERE is_active = true;
CREATE INDEX idx_guides_verified ON guides(is_verified) WHERE is_verified = true;
CREATE INDEX idx_guides_slug ON guides(slug);

CREATE INDEX idx_trips_guide ON trips(guide_id);
CREATE INDEX idx_trips_activity ON trips(activity);
CREATE INDEX idx_trips_difficulty ON trips(difficulty);
CREATE INDEX idx_trips_region ON trips(country, region);
CREATE INDEX idx_trips_price ON trips(price_per_person);
CREATE INDEX idx_trips_active ON trips(is_active) WHERE is_active = true;
CREATE INDEX idx_trips_slug ON trips(slug);

CREATE INDEX idx_trip_dates_trip ON trip_dates(trip_id);
CREATE INDEX idx_trip_dates_available ON trip_dates(start_date, is_available) 
  WHERE is_available = true;

CREATE INDEX idx_bookings_user ON bookings(user_id);
CREATE INDEX idx_bookings_guide ON bookings(guide_id);
CREATE INDEX idx_bookings_status ON bookings(status);

CREATE INDEX idx_reviews_guide ON reviews(guide_id);
CREATE INDEX idx_reviews_trip ON reviews(trip_id);

-- Full-text search on trips
CREATE INDEX idx_trips_fts ON trips 
  USING GIN(to_tsvector('english', title || ' ' || COALESCE(description, '')));

-- =====================================================
-- ROW LEVEL SECURITY (RLS)
-- =====================================================
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE guides ENABLE ROW LEVEL SECURITY;
ALTER TABLE trips ENABLE ROW LEVEL SECURITY;
ALTER TABLE trip_dates ENABLE ROW LEVEL SECURITY;
ALTER TABLE media ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

-- Profiles
CREATE POLICY "Public profiles are viewable by everyone"
  ON profiles FOR SELECT USING (true);

CREATE POLICY "Users can update their own profile"
  ON profiles FOR UPDATE USING (auth.uid() = id);

-- Guides
CREATE POLICY "Active guides are viewable by everyone"
  ON guides FOR SELECT USING (is_active = true);

CREATE POLICY "Guides can update their own profile"
  ON guides FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can create their guide profile"
  ON guides FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Trips
CREATE POLICY "Active trips are viewable by everyone"
  ON trips FOR SELECT USING (is_active = true);

CREATE POLICY "Guides can manage their own trips"
  ON trips FOR ALL USING (
    EXISTS (SELECT 1 FROM guides WHERE id = trips.guide_id AND user_id = auth.uid())
  );

-- Trip dates
CREATE POLICY "Trip dates are viewable by everyone"
  ON trip_dates FOR SELECT USING (true);

CREATE POLICY "Guides can manage their trip dates"
  ON trip_dates FOR ALL USING (
    EXISTS (
      SELECT 1 FROM trips t 
      JOIN guides g ON t.guide_id = g.id 
      WHERE t.id = trip_dates.trip_id AND g.user_id = auth.uid()
    )
  );

-- Media
CREATE POLICY "Media is viewable by everyone"
  ON media FOR SELECT USING (true);

CREATE POLICY "Users can manage their own media"
  ON media FOR ALL USING (
    (entity_type = 'guide' AND EXISTS (
      SELECT 1 FROM guides WHERE id = media.entity_id AND user_id = auth.uid()
    ))
    OR
    (entity_type = 'trip' AND EXISTS (
      SELECT 1 FROM trips t 
      JOIN guides g ON t.guide_id = g.id 
      WHERE t.id = media.entity_id AND g.user_id = auth.uid()
    ))
    OR
    (entity_type = 'review' AND EXISTS (
      SELECT 1 FROM reviews r WHERE r.id = media.entity_id AND r.reviewer_id = auth.uid()
    ))
  );

-- Bookings
CREATE POLICY "Users can view their own bookings"
  ON bookings FOR SELECT USING (
    auth.uid() = user_id 
    OR EXISTS (SELECT 1 FROM guides WHERE id = bookings.guide_id AND user_id = auth.uid())
  );

CREATE POLICY "Authenticated users can create bookings"
  ON bookings FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Booking participants can update bookings"
  ON bookings FOR UPDATE USING (
    auth.uid() = user_id 
    OR EXISTS (SELECT 1 FROM guides WHERE id = bookings.guide_id AND user_id = auth.uid())
  );

-- Reviews
CREATE POLICY "Reviews are viewable by everyone"
  ON reviews FOR SELECT USING (true);

CREATE POLICY "Users can create reviews for their completed bookings"
  ON reviews FOR INSERT WITH CHECK (
    auth.uid() = reviewer_id
    AND EXISTS (
      SELECT 1 FROM bookings 
      WHERE id = reviews.booking_id 
      AND user_id = auth.uid() 
      AND status = 'completed'
    )
  );

CREATE POLICY "Guides can respond to their reviews"
  ON reviews FOR UPDATE USING (
    EXISTS (SELECT 1 FROM guides WHERE id = reviews.guide_id AND user_id = auth.uid())
  );

-- Messages
CREATE POLICY "Users can view their own messages"
  ON messages FOR SELECT USING (
    auth.uid() = sender_id OR auth.uid() = recipient_id
  );

CREATE POLICY "Authenticated users can send messages"
  ON messages FOR INSERT WITH CHECK (auth.uid() = sender_id);

CREATE POLICY "Recipients can mark messages as read"
  ON messages FOR UPDATE USING (auth.uid() = recipient_id);

-- =====================================================
-- UPDATED_AT TRIGGER
-- =====================================================
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_guides_updated_at
  BEFORE UPDATE ON guides
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_trips_updated_at
  BEFORE UPDATE ON trips
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_bookings_updated_at
  BEFORE UPDATE ON bookings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
