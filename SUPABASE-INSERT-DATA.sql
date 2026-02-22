-- Summit Platform - Insert Test Data
-- Copy this ENTIRE file and paste into Supabase SQL Editor
-- https://supabase.com/dashboard/project/nqczucpdkccbkydbzytl/sql/new

INSERT INTO profiles (id, full_name, email, user_type, avatar_url)
VALUES ('11111111-1111-1111-1111-111111111111'::uuid, 'Alex Mountain', 'alex@summitguides.com', 'guide', 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop') ON CONFLICT (id) DO NOTHING;

INSERT INTO guides (user_id, slug, display_name, tagline, bio, base_location, years_experience, rating, review_count, response_rate, is_verified, is_active, specialties, languages, certifications)
VALUES ('11111111-1111-1111-1111-111111111111'::uuid, 'alex-mountain', 'Alex Mountain', 'Expert mountaineer with 15+ years of alpine experience', 'Certified IFMGA guide specializing in alpine climbing, mountaineering, and ski touring. Based in the Colorado Rockies.', 'Colorado, USA', 15, 4.9, 47, 98.5, true, true, ARRAY['mountaineering', 'alpine_climbing', 'ski_touring'], ARRAY['English', 'Spanish'], '[{"name": "IFMGA Mountain Guide", "issuer": "IFMGA", "year": 2015}, {"name": "AMGA Single Pitch Instructor", "issuer": "AMGA", "year": 2018}]'::jsonb) ON CONFLICT (user_id) DO NOTHING;

INSERT INTO trips (guide_id, title, slug, activity, difficulty, description, highlights, itinerary, inclusions, exclusions, duration_days, price_per_person, max_group_size, min_group_size, country, region, latitude, longitude, is_active, is_featured)
SELECT g.id, 'Mount Elbert Summit Experience', 'mount-elbert-summit', 'mountaineering'::activity_type, 'intermediate'::difficulty_level, 'Join us for an unforgettable summit experience on Colorado''s highest peak. This guided trip includes trail instruction, safety briefing, and scenic mountain photography opportunities.', ARRAY['Stunning 360° views at 14,440 ft elevation', 'Colorado''s highest peak', 'Learn mountaineering fundamentals', 'Professional safety instruction', 'Scenic photography opportunities'], '[{"day": 1, "title": "Trailhead to Camp", "description": "Arrive at trailhead, safety briefing, ascend to intermediate camp"}, {"day": 2, "title": "Summit Day", "description": "Early start, summit Mount Elbert, return to base camp"}]'::jsonb, ARRAY['Professional guide', 'Safety equipment', 'Route planning', 'Photography tips'], ARRAY['Meals', 'Transportation to trailhead', 'Personal climbing gear'], 2, 450.00, 6, 2, 'United States', 'Colorado', 39.1183, -106.4476, true, true FROM guides g WHERE g.slug = 'alex-mountain' ON CONFLICT (slug) DO NOTHING;

INSERT INTO trip_dates (trip_id, start_date, end_date, spots_total, spots_available, is_available)
SELECT t.id, '2026-03-15'::date, '2026-03-16'::date, 6, 6, true FROM trips t WHERE t.slug = 'mount-elbert-summit' ON CONFLICT DO NOTHING;

INSERT INTO profiles (id, full_name, email, user_type, avatar_url)
VALUES ('22222222-2222-2222-2222-222222222222'::uuid, 'Jordan Rivers', 'jordan@summitguides.com', 'guide', 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&h=400&fit=crop') ON CONFLICT (id) DO NOTHING;

INSERT INTO guides (user_id, slug, display_name, tagline, bio, base_location, years_experience, rating, review_count, response_rate, is_verified, is_active, specialties, languages, certifications)
VALUES ('22222222-2222-2222-2222-222222222222'::uuid, 'jordan-rivers', 'Jordan Rivers', 'Rock climbing specialist with 12+ years of experience', 'AMGA certified rock climbing guide. Specializes in sport climbing, traditional climbing, and single-pitch instruction.', 'Colorado, USA', 12, 4.8, 38, 99.0, true, true, ARRAY['rock_climbing', 'sport_climbing', 'alpine_climbing'], ARRAY['English', 'French'], '[{"name": "AMGA Climbing Instructor", "issuer": "AMGA", "year": 2016}]'::jsonb) ON CONFLICT (user_id) DO NOTHING;

INSERT INTO trips (guide_id, title, slug, activity, difficulty, description, highlights, itinerary, inclusions, exclusions, duration_days, price_per_person, max_group_size, min_group_size, country, region, latitude, longitude, is_active, is_featured)
SELECT g.id, 'Red Rock Canyon Rock Climbing', 'red-rock-climbing', 'rock_climbing'::activity_type, 'intermediate'::difficulty_level, 'Experience world-class rock climbing in the stunning Red Rock Canyon. Perfect for climbers looking to improve their skills and push their limits.', ARRAY['World-class climbing areas', 'Stunning desert scenery', 'Professional instruction', 'Safety equipment provided', 'Photo opportunities'], '[{"day": 1, "title": "Arrive & Warm Up", "description": "Meet guide, safety brief, warm-up climbs"}, {"day": 2, "title": "Main Climbing Day", "description": "Full day at prime climbing areas"}]'::jsonb, ARRAY['Professional guide', 'Safety equipment', 'Climbing shoes rental'], ARRAY['Meals', 'Transportation to crag', 'Personal climbing gear'], 2, 350.00, 4, 2, 'United States', 'Nevada', 36.1395, -115.4359, true, true FROM guides g WHERE g.slug = 'jordan-rivers' ON CONFLICT (slug) DO NOTHING;

SELECT 'Setup complete! Guides and trips added.' as result;
