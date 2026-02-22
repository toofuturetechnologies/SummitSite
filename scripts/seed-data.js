/**
 * Sample data seeder for Supabase
 * Run: node scripts/seed-data.js
 * This populates guides and trips based on Explore-Share patterns
 */

const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

const sampleGuides = [
  {
    id: '550e8400-e29b-41d4-a716-446655440001',
    name: 'John Martinez',
    bio: 'Certified mountain guide with 15+ years of experience. Specializing in alpine expeditions and technical climbing.',
    specialties: ['Mountaineering', 'Rock Climbing', 'Ski Touring'],
    rating: 4.9,
    review_count: 127,
    is_verified: true,
    avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=John',
  },
  {
    id: '550e8400-e29b-41d4-a716-446655440002',
    name: 'Sarah Thompson',
    bio: 'Adventure travel specialist. Love sharing the beauty of remote mountain regions with adventurers.',
    specialties: ['Hiking', 'Trekking', 'Cultural Tours'],
    rating: 4.8,
    review_count: 89,
    is_verified: true,
    avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah',
  },
  {
    id: '550e8400-e29b-41d4-a716-446655440003',
    name: 'Carlos Rodriguez',
    bio: 'Professional backcountry skier and mountain guide. Based in the Andes.',
    specialties: ['Ski Touring', 'Backcountry Skiing', 'Mountaineering'],
    rating: 4.7,
    review_count: 156,
    is_verified: true,
    avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Carlos',
  },
];

const sampleTrips = [
  {
    id: '660e8400-e29b-41d4-a716-446655440001',
    guide_id: '550e8400-e29b-41d4-a716-446655440001',
    title: 'Kilimanjaro Summit Expedition',
    description: '6-day guided expedition to Africa\'s highest peak. Technical climbing on glaciers with stunning sunrise views.',
    price_per_person: 2500,
    currency: 'USD',
    duration_days: 6,
    difficulty: 'advanced',
    max_participants: 8,
    country: 'Tanzania',
    region: 'Mount Kilimanjaro',
    image_url: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=500&h=300&fit=crop',
  },
  {
    id: '660e8400-e29b-41d4-a716-446655440002',
    guide_id: '550e8400-e29b-41d4-a716-446655440002',
    title: 'Machu Picchu Trek',
    description: '4-day hike along the Inca Trail to Machu Picchu. Explore ancient ruins and learn about Incan history.',
    price_per_person: 1800,
    currency: 'USD',
    duration_days: 4,
    difficulty: 'intermediate',
    max_participants: 12,
    country: 'Peru',
    region: 'Cusco Region',
    image_url: 'https://images.unsplash.com/photo-1587595431973-160e0d94ff67?w=500&h=300&fit=crop',
  },
  {
    id: '660e8400-e29b-41d4-a716-446655440003',
    guide_id: '550e8400-e29b-41d4-a716-446655440003',
    title: 'Patagonia Ice Trekking',
    description: '5-day adventure on Perito Moreno Glacier. Guided ice climbing and glacier exploration in Patagonia.',
    price_per_person: 3200,
    currency: 'USD',
    duration_days: 5,
    difficulty: 'advanced',
    max_participants: 6,
    country: 'Argentina',
    region: 'Los Glaciares National Park',
    image_url: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=500&h=300&fit=crop',
  },
];

async function seedData() {
  try {
    console.log('🌱 Seeding Summit database...\n');

    // Insert guides
    console.log('📍 Inserting guides...');
    for (const guide of sampleGuides) {
      const { data, error } = await supabase
        .from('guides')
        .insert([guide])
        .select();

      if (error) {
        if (error.code === '23505') {
          console.log(`  ⚠️  Guide ${guide.name} already exists`);
        } else {
          console.error(`  ✗ Error inserting guide: ${error.message}`);
        }
      } else {
        console.log(`  ✓ ${guide.name}`);
      }
    }

    console.log('\n🏔️  Inserting trips...');
    for (const trip of sampleTrips) {
      const { data, error } = await supabase
        .from('trips')
        .insert([trip])
        .select();

      if (error) {
        if (error.code === '23505') {
          console.log(`  ⚠️  Trip ${trip.title} already exists`);
        } else {
          console.error(`  ✗ Error inserting trip: ${error.message}`);
        }
      } else {
        console.log(`  ✓ ${trip.title}`);
      }
    }

    console.log('\n✅ Database seeding complete!');
    console.log('Visit /trips and /guides to see your data.\n');

  } catch (error) {
    console.error('Fatal error:', error.message);
    process.exit(1);
  }
}

seedData();
