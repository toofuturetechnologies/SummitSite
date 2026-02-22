-- Summit Platform - Test Data Setup
-- Run this in Supabase SQL Editor: https://supabase.com/dashboard/project/nqczucpdkccbkydbzytl/sql/new
-- =====================================================

-- Step 1: Create test guide user via auth (requires Supabase UI, can't do via SQL)
-- This must be done manually in Supabase > Authentication > Users > Add User
-- Email: alex@summitguides.com
-- Password: (any password)
-- Confirm email

-- Step 2: After creating auth user, run these SQL commands:

-- Get the UUID of the newly created user and insert profile
-- Replace 'YOUR_USER_ID_HERE' with the actual user ID from auth.users
INSERT INTO profiles (id, full_name, email, user_type, avatar_url)
VALUES (
  'YOUR_USER_ID_HERE',
  'Alex Mountain',
  'alex@summitguides.com',
  'guide',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop'
) ON CONFLICT (id) DO UPDATE SET updated_at = NOW();

-- Create guide profile
INSERT INTO guides (user_id, slug, display_name, tagline, bio, base_location, years_experience, rating, review_count, response_rate, is_verified, is_active, specialties, languages, certifications)
SELECT 
  id,
  'alex-mountain',
  'Alex Mountain',
  'Expert mountaineer with 15+ years of alpine experience',
  'Certified IFMGA guide specializing in alpine climbing, mountaineering, and ski touring. Based in the Colorado Rockies.',
  'Colorado, USA',
  15,
  4.9,
  47,
  98.5,
  true,
  true,
  ARRAY['mountaineering', 'alpine_climbing', 'ski_touring'],
  ARRAY['English', 'Spanish'],
  '[{"name": "IFMGA Mountain Guide", "issuer": "IFMGA", "year": 2015}, {"name": "AMGA Single Pitch Instructor", "issuer": "AMGA", "year": 2018}]'::jsonb
FROM profiles 
WHERE email = 'alex@summitguides.com'
ON CONFLICT (user_id) DO UPDATE SET updated_at = NOW();

-- Create test trip
INSERT INTO trips (guide_id, title, slug, activity, difficulty, description, highlights, itinerary, inclusions, exclusions, duration_days, price_per_person, max_group_size, min_group_size, country, region, latitude, longitude, is_active, is_featured)
SELECT
  g.id,
  'Mount Elbert Summit Experience',
  'mount-elbert-summit',
  'mountaineering'::activity_type,
  'intermediate'::difficulty_level,
  'Join us for an unforgettable summit experience on Colorado''s highest peak. This guided trip includes trail instruction, safety briefing, and scenic mountain photography opportunities.',
  ARRAY['Stunning 360° views at 14,440 ft elevation', 'Colorado''s highest peak', 'Learn mountaineering fundamentals', 'Professional safety instruction', 'Scenic photography opportunities'],
  '[{"day": 1, "title": "Trailhead to Camp", "description": "Arrive at trailhead, safety briefing, ascend to intermediate camp"}, {"day": 2, "title": "Summit Day", "description": "Early start, summit Mount Elbert, return to base camp"}]'::jsonb,
  ARRAY['Professional guide', 'Safety equipment', 'Route planning', 'Photography tips'],
  ARRAY['Meals', 'Transportation to trailhead', 'Personal climbing gear'],
  2,
  450.00,
  6,
  2,
  'United States',
  'Colorado',
  39.1183,
  -106.4476,
  true,
  true
FROM guides g
WHERE g.slug = 'alex-mountain'
ON CONFLICT (slug) DO UPDATE SET updated_at = NOW();

-- Add trip availability dates
INSERT INTO trip_dates (trip_id, start_date, end_date, spots_total, spots_available, is_available)
SELECT
  t.id,
  '2026-03-15'::date,
  '2026-03-16'::date,
  6,
  6,
  true
FROM trips t
WHERE t.slug = 'mount-elbert-summit';

-- Verify data was created
SELECT 'Profiles' as table_name, COUNT(*) as count FROM profiles
UNION ALL
SELECT 'Guides' as table_name, COUNT(*) as count FROM guides
UNION ALL
SELECT 'Trips' as table_name, COUNT(*) as count FROM trips
UNION ALL
SELECT 'Trip Dates' as table_name, COUNT(*) as count FROM trip_dates;
