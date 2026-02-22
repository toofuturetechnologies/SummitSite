#!/usr/bin/env node

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

const supabaseUrl = 'https://nqczucpdkccbkydbzytl.supabase.co';
const anonKey = 'sb_publishable_XhonuiAxissjlevcywCymg_AeGOgyhK';

const supabase = createClient(supabaseUrl, anonKey);

async function setupDatabase() {
  console.log('🚀 Summit Database Setup\n');

  try {
    // Read the migration file
    const migrationPath = path.join(__dirname, '../supabase/migrations/001_initial_schema.sql');
    const schemaSql = fs.readFileSync(migrationPath, 'utf8');

    console.log('📋 Schema: Reading migration file...');
    console.log('✅ Migration file loaded\n');

    // Note: We can't execute raw SQL via the anon key, but we can verify tables exist
    // and insert test data via the API
    
    console.log('🔍 Checking tables...');
    
    // Check if guides table exists by trying to query it
    const { data: guidesTest, error: guidesError } = await supabase
      .from('guides')
      .select('id')
      .limit(1);

    if (guidesError && guidesError.code === 'PGRST116') {
      console.log('❌ Tables not found. You need to run the migration in Supabase SQL Editor.');
      console.log('\n📌 Steps:');
      console.log('1. Go to: https://supabase.com/dashboard/project/nqczucpdkccbkydbzytl/sql/new');
      console.log('2. Paste the contents of: supabase/migrations/001_initial_schema.sql');
      console.log('3. Click "Run"');
      console.log('4. Re-run this script\n');
      return;
    }

    if (guidesError) {
      console.log('⚠️  Query error:', guidesError.message);
      return;
    }

    console.log('✅ Tables exist\n');

    // Now insert test guide data
    console.log('📝 Inserting test data...');

    // First, create a test profile (we'll use a fixed UUID for testing)
    const testGuideId = 'f47ac10b-58cc-4372-a567-0e02b2c3d479';
    
    const { error: profileError } = await supabase
      .from('profiles')
      .upsert({
        id: testGuideId,
        full_name: 'Alex Mountain',
        email: 'alex@summitguides.com',
        user_type: 'guide',
        avatar_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop'
      }, { onConflict: 'id' });

    if (profileError && profileError.code !== '23505') {
      console.log('❌ Error creating profile:', profileError.message);
      return;
    }
    console.log('✅ Profile created\n');

    // Insert guide
    const { data: guideData, error: guideError } = await supabase
      .from('guides')
      .upsert({
        user_id: testGuideId,
        slug: 'alex-mountain',
        display_name: 'Alex Mountain',
        tagline: 'Expert mountaineer with 15+ years of alpine experience',
        bio: 'Certified IFMGA guide specializing in alpine climbing, mountaineering, and ski touring. Based in the Colorado Rockies.',
        base_location: 'Colorado, USA',
        years_experience: 15,
        rating: 4.9,
        review_count: 47,
        response_rate: 98.5,
        is_verified: true,
        is_active: true,
        specialties: ['mountaineering', 'alpine_climbing', 'ski_touring'],
        languages: ['English', 'Spanish'],
        certifications: [
          { name: 'IFMGA Mountain Guide', issuer: 'IFMGA', year: 2015 },
          { name: 'AMGA Single Pitch Instructor', issuer: 'AMGA', year: 2018 }
        ]
      }, { onConflict: 'user_id' });

    if (guideError) {
      console.log('❌ Error creating guide:', guideError.message);
      return;
    }
    console.log('✅ Test guide inserted\n');

    // Insert a test trip
    const { data: tripData, error: tripError } = await supabase
      .from('trips')
      .insert({
        guide_id: guideData[0].id,
        title: 'Mount Elbert Summit Experience',
        slug: 'mount-elbert-summit',
        activity: 'mountaineering',
        difficulty: 'intermediate',
        description: 'Join us for an unforgettable summit experience on Colorado\'s highest peak. This guided trip includes trail instruction, safety briefing, and scenic mountain photography opportunities.',
        highlights: [
          'Stunning 360° views at 14,440 ft elevation',
          'Colorado\'s highest peak',
          'Learn mountaineering fundamentals',
          'Professional safety instruction',
          'Scenic photography opportunities'
        ],
        itinerary: [
          { day: 1, title: 'Trailhead to Camp', description: 'Arrive at trailhead, safety briefing, ascend to intermediate camp' },
          { day: 2, title: 'Summit Day', description: 'Early start, summit Mount Elbert, return to base camp' }
        ],
        inclusions: ['Professional guide', 'Safety equipment', 'Route planning', 'Photography tips'],
        exclusions: ['Meals', 'Transportation to trailhead', 'Personal climbing gear'],
        duration_days: 2,
        price_per_person: 450,
        max_group_size: 6,
        min_group_size: 2,
        country: 'United States',
        region: 'Colorado',
        latitude: 39.1183,
        longitude: -106.4476,
        is_active: true,
        is_featured: true
      });

    if (tripError) {
      console.log('❌ Error creating trip:', tripError.message);
      return;
    }
    console.log('✅ Test trip inserted\n');

    console.log('🎉 Database setup complete!');
    console.log('\n📊 Summary:');
    console.log('  • Guide created: Alex Mountain (alex@summitguides.com)');
    console.log('  • Trip created: Mount Elbert Summit Experience');
    console.log('  • Status: Ready to display on guides & trips pages\n');
    console.log('Next: Deploy to Vercel and visit /guides and /trips pages\n');

  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

setupDatabase();
