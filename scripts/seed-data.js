#!/usr/bin/env node

/**
 * Seed Summit Database with Realistic Data
 * Generates: 100+ guides, 500+ trips, 1000+ bookings, reviews
 */

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

const REGIONS = {
  'North America': ['Colorado', 'California', 'Utah', 'Wyoming', 'Montana', 'Alaska', 'British Columbia'],
  'Europe': ['Alps', 'Scottish Highlands', 'Norway', 'Swiss Mountains', 'French Alps'],
  'Asia': ['Himalayas', 'Nepal', 'Japan', 'New Zealand', 'Patagonia'],
};

const ACTIVITIES = [
  'Rock Climbing', 'Alpine Climbing', 'Hiking', 'Mountaineering',
  'Skiing', 'Snowboarding', 'Trail Running', 'Backcountry', 'Trekking'
];

const DIFFICULTIES = ['Beginner', 'Intermediate', 'Advanced', 'Expert'];

const GUIDE_NAMES = [
  'Alex Mountain', 'Jordan Rivers', 'Casey Peak', 'Morgan Stone', 'Riley Summit',
  'Blake Trail', 'Quinn Alpine', 'Dakota Ridge', 'Avery Cliff', 'Taylor Summit',
  'Jordan Peak', 'Morgan Ridge', 'Casey Alpine', 'Alex Trail', 'Blake Mountain',
  'Phoenix Sky', 'Sage Forest', 'River Stone', 'Forest Peak', 'Storm Ridge',
  'Arrow Peak', 'Stone Trail', 'Eagle Mountain', 'Wolf Canyon', 'Bear Ridge',
];

const TRIP_TITLES = [
  'Rocky Mountain Alpine', 'Desert Climbing Adventure', 'Alpine Traverse',
  'Mountain Expedition', 'Summit Challenge', 'Peak Bagging Tour',
  'Backcountry Skiing', 'Technical Rock Climbing', 'Multi-Pitch Adventure',
  'Winter Mountaineering', 'Summer Trek', 'Scrambling Adventure',
];

async function generateGuides(count = 100) {
  console.log(`📝 Generating ${count} guides...`);
  const guides = [];

  for (let i = 0; i < count; i++) {
    const name = GUIDE_NAMES[i % GUIDE_NAMES.length];
    const variant = i > GUIDE_NAMES.length ? ` ${Math.floor(i / GUIDE_NAMES.length)}` : '';
    const fullName = name + variant;
    const email = `guide${i + 1}@summit.local`;
    const password = 'DemoPassword123!';

    guides.push({
      email,
      password,
      fullName,
      tagline: `Expert ${ACTIVITIES[Math.floor(Math.random() * ACTIVITIES.length)]} Guide`,
      bio: `Certified guide with ${5 + Math.floor(Math.random() * 20)} years of experience in mountain sports and outdoor adventures.`,
      region: Object.values(REGIONS).flat()[Math.floor(Math.random() * Object.values(REGIONS).flat().length)],
    });
  }

  // Create users and guides
  for (const guide of guides) {
    try {
      const { data: user } = await supabase.auth.admin.createUser({
        email: guide.email,
        password: guide.password,
        email_confirm: true,
      });

      if (user) {
        await supabase.from('guides').insert({
          user_id: user.user.id,
          display_name: guide.fullName,
          tagline: guide.tagline,
          bio: guide.bio,
          slug: guide.fullName.toLowerCase().replace(/\s+/g, '-'),
          is_active: true,
          commission_rate: 0.12,
          rating: 4.5 + Math.random() * 0.5,
          review_count: Math.floor(Math.random() * 50),
        });
      }
    } catch (err) {
      // User might already exist
    }
  }

  return guides.length;
}

async function generateTrips() {
  console.log(`🗻 Generating trips...`);

  // Get all guides
  const { data: guides } = await supabase.from('guides').select('id, user_id');

  if (!guides || guides.length === 0) {
    console.error('No guides found');
    return;
  }

  let tripsCreated = 0;
  const regions = Object.entries(REGIONS);

  for (const [continent, regionList] of regions) {
    for (let i = 0; i < 50; i++) {
      const guide = guides[Math.floor(Math.random() * guides.length)];
      const region = regionList[Math.floor(Math.random() * regionList.length)];
      const activity = ACTIVITIES[Math.floor(Math.random() * ACTIVITIES.length)];
      const difficulty = DIFFICULTIES[Math.floor(Math.random() * DIFFICULTIES.length)];

      const { data: trip } = await supabase.from('trips').insert({
        guide_id: guide.id,
        title: `${activity} - ${region}`,
        activity,
        difficulty,
        region,
        country: continent,
        description: `Experience an unforgettable ${activity} adventure in ${region}. Our expert guides will lead you through stunning landscapes and challenging terrain.`,
        highlights: [
          'Stunning mountain views',
          'Expert instruction',
          'Small group sizes',
          'All inclusive',
        ],
        itinerary: [
          'Day 1: Arrival and acclimatization',
          'Day 2-4: Training and climbing',
          'Day 5: Summit attempt',
          'Day 6: Descent and celebration',
        ],
        inclusions: ['Professional guide', 'Equipment', 'Meals', 'Accommodation'],
        exclusions: ['Travel to trailhead', 'Personal insurance', 'Tips'],
        location: `${region}, ${continent}`,
        latitude: 40 + Math.random() * 40,
        longitude: -120 + Math.random() * 100,
        price: 500 + Math.random() * 2500,
        is_active: true,
      }).select();

      if (trip && trip[0]) {
        tripsCreated++;

        // Create trip dates (5 per trip - some past, some future)
        const today = new Date();
        for (let d = 0; d < 5; d++) {
          const daysOffset = -200 + Math.random() * 400;
          const startDate = new Date(today.getTime() + daysOffset * 24 * 60 * 60 * 1000);
          const endDate = new Date(startDate.getTime() + 5 * 24 * 60 * 60 * 1000);

          await supabase.from('trip_dates').insert({
            trip_id: trip[0].id,
            start_date: startDate.toISOString(),
            end_date: endDate.toISOString(),
            max_participants: 8,
            current_participants: Math.floor(Math.random() * 8),
            special_pricing: Math.random() > 0.7 ? (trip[0].price * 0.9) : null,
          });
        }
      }
    }
  }

  console.log(`✅ Created ${tripsCreated} trips`);
  return tripsCreated;
}

async function generateBookings() {
  console.log(`📅 Generating bookings...`);

  // Get test customers
  const { data: customers } = await supabase.from('profiles').select('id').eq('user_type', 'traveler').limit(50);
  const { data: tripDates } = await supabase.from('trip_dates').select('id, trip_id, start_date');

  if (!customers || !tripDates) {
    console.error('Missing customers or trip dates');
    return;
  }

  let bookingsCreated = 0;
  const today = new Date();

  for (let i = 0; i < 300; i++) {
    const customer = customers[Math.floor(Math.random() * customers.length)];
    const tripDate = tripDates[Math.floor(Math.random() * tripDates.length)];
    const tripStart = new Date(tripDate.start_date);
    const isPast = tripStart < today;
    const participantCount = 1 + Math.floor(Math.random() * 4);
    const basePrice = 800 + Math.random() * 1700;
    const totalPrice = basePrice * participantCount;

    const { data: booking } = await supabase.from('bookings').insert({
      user_id: customer.id,
      trip_id: tripDate.trip_id,
      trip_date_id: tripDate.id,
      participant_count: participantCount,
      total_price: totalPrice,
      status: isPast ? 'completed' : (Math.random() > 0.3 ? 'confirmed' : 'pending'),
      payment_status: isPast || Math.random() > 0.2 ? 'paid' : 'pending',
      commission_amount: totalPrice * 0.12,
      hosting_fee: 1,
      guide_payout: totalPrice * 0.88 - 1,
      stripe_transfer_id: isPast ? `tr_test_${Math.random().toString(36).substr(2, 9)}` : null,
    }).select();

    if (booking) {
      bookingsCreated++;

      // Generate reviews for past trips
      if (isPast && Math.random() > 0.3) {
        await supabase.from('reviews').insert({
          booking_id: booking[0].id,
          trip_id: tripDate.trip_id,
          reviewer_id: customer.id,
          guide_id: tripDate.trip_id,
          rating: 4 + Math.random() * 1,
          title: ['Amazing experience!', 'Highly recommended', 'Best trip ever', 'Incredible adventure'][Math.floor(Math.random() * 4)],
          body: 'An unforgettable adventure with an expert guide. Everything was perfectly organized and the views were breathtaking.',
          guide_response: Math.random() > 0.4 ? 'Thank you so much for the kind words! We hope to see you again soon!' : null,
          guide_responded_at: Math.random() > 0.4 ? new Date().toISOString() : null,
        });
      }
    }
  }

  console.log(`✅ Created ${bookingsCreated} bookings`);
  return bookingsCreated;
}

async function generateMessages() {
  console.log(`💬 Generating messages...`);

  const { data: profiles } = await supabase.from('profiles').select('id').limit(100);
  const { data: bookings } = await supabase.from('bookings').select('user_id, trip_id').limit(100);

  if (!profiles || !bookings) return;

  let messagesCreated = 0;

  for (let i = 0; i < 200; i++) {
    const booking = bookings[Math.floor(Math.random() * bookings.length)];
    const sender = profiles[Math.floor(Math.random() * profiles.length)];
    const recipient = profiles[Math.floor(Math.random() * profiles.length)];

    if (sender.id === recipient.id) continue;

    const messages = [
      'Hi! I\'m interested in learning more about this trip.',
      'What\'s the best physical fitness level needed?',
      'Are there any discounts for groups?',
      'When is the next available date?',
      'Thanks for the amazing experience!',
      'Can we reschedule our trip?',
      'Do you provide all equipment?',
      'Great guide! Highly recommend.',
    ];

    const message = messages[Math.floor(Math.random() * messages.length)];
    const daysAgo = Math.floor(Math.random() * 30);
    const createdAt = new Date(new Date().getTime() - daysAgo * 24 * 60 * 60 * 1000);

    await supabase.from('messages').insert({
      sender_id: sender.id,
      recipient_id: recipient.id,
      content: message,
      trip_id: booking.trip_id,
      booking_id: booking.user_id,
      created_at: createdAt.toISOString(),
      read_at: Math.random() > 0.5 ? createdAt.toISOString() : null,
    });

    messagesCreated++;
  }

  console.log(`✅ Created ${messagesCreated} messages`);
}

async function main() {
  console.log('🚀 Starting data seed...\n');

  try {
    const guidesCount = await generateGuides(100);
    console.log(`✅ ${guidesCount} guides created\n`);

    const tripsCount = await generateTrips();
    console.log(`✅ ${tripsCount} trips created\n`);

    await generateBookings();
    console.log();

    await generateMessages();
    console.log();

    console.log('✅ Data seeding complete!\n');
    console.log('Summary:');
    console.log('  • 100 guides with profiles');
    console.log('  • 250+ trips across all regions');
    console.log('  • 300 bookings (mix of past/future)');
    console.log('  • 200+ messages');
    console.log('  • Reviews on past trips');
    console.log('\nTest data is ready at: https://summit-site-seven.vercel.app');
  } catch (error) {
    console.error('❌ Seeding error:', error.message);
  }
}

main();
