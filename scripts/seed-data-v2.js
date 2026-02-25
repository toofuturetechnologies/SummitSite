#!/usr/bin/env node

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

const ACTIVITIES = ['Rock Climbing', 'Alpine Climbing', 'Hiking', 'Mountaineering', 'Skiing', 'Trekking'];
const DIFFICULTIES = ['Beginner', 'Intermediate', 'Advanced', 'Expert'];
const REGIONS = ['Colorado', 'Utah', 'Wyoming', 'California', 'Alaska', 'New Zealand', 'Patagonia'];
const COUNTRIES = ['USA', 'USA', 'USA', 'USA', 'USA', 'New Zealand', 'Argentina'];

async function seedData() {
  console.log('🌱 Seeding database...\n');

  try {
    // Get guides
    const { data: guides } = await supabase.from('guides').select('id').limit(50);
    console.log(`📊 Found ${guides?.length || 0} guides`);

    if (!guides || guides.length === 0) {
      console.error('❌ No guides found');
      return;
    }

    let tripsCreated = 0;
    let bookingsCreated = 0;

    // Create trips for each guide
    for (const guide of guides.slice(0, 20)) {
      for (let i = 0; i < 15; i++) {
        const region = REGIONS[Math.floor(Math.random() * REGIONS.length)];
        const activity = ACTIVITIES[Math.floor(Math.random() * ACTIVITIES.length)];
        const difficulty = DIFFICULTIES[Math.floor(Math.random() * DIFFICULTIES.length)];

        const { data: trip, error: tripError } = await supabase
          .from('trips')
          .insert({
            guide_id: guide.id,
            title: `${activity} Expedition - ${region}`,
            activity,
            difficulty,
            region,
            country: COUNTRIES[REGIONS.indexOf(region)],
            description: `Professional ${activity} adventure with certified guides`,
            highlights: ['Expert instruction', 'Small groups', 'All inclusive'],
            itinerary: ['Day 1-2: Training', 'Day 3-5: Climbing', 'Day 6: Descent'],
            inclusions: ['Guide', 'Equipment', 'Meals'],
            exclusions: ['Travel', 'Insurance'],
            location: region,
            latitude: 40 + Math.random() * 30,
            longitude: -120 + Math.random() * 60,
            price: 800 + Math.random() * 2000,
            is_active: true,
          })
          .select();

        if (tripError) {
          console.error('Trip error:', tripError);
          continue;
        }

        if (!trip || !trip[0]) continue;
        tripsCreated++;

        // Create dates for each trip
        const today = new Date();
        for (let d = 0; d < 3; d++) {
          const offset = -100 + Math.random() * 200;
          const start = new Date(today.getTime() + offset * 86400000);
          const end = new Date(start.getTime() + 5 * 86400000);

          await supabase.from('trip_dates').insert({
            trip_id: trip[0].id,
            start_date: start.toISOString(),
            end_date: end.toISOString(),
            max_participants: 8,
            current_participants: Math.floor(Math.random() * 6),
          });
        }
      }
    }

    console.log(`✅ Created ${tripsCreated} trips\n`);

    // Create bookings
    const { data: customers } = await supabase.from('profiles').select('id').eq('user_type', 'traveler').limit(100);
    const { data: allTripDates } = await supabase.from('trip_dates').select('*').limit(200);

    if (customers && allTripDates) {
      for (let i = 0; i < 200; i++) {
        const customer = customers[Math.floor(Math.random() * customers.length)];
        const tripDate = allTripDates[Math.floor(Math.random() * allTripDates.length)];
        const start = new Date(tripDate.start_date);
        const isPast = start < new Date();
        const price = 1000 + Math.random() * 2000;
        const count = 1 + Math.floor(Math.random() * 3);

        const { error: bookError } = await supabase.from('bookings').insert({
          user_id: customer.id,
          trip_id: tripDate.trip_id,
          trip_date_id: tripDate.id,
          participant_count: count,
          total_price: price * count,
          status: isPast ? 'completed' : 'confirmed',
          payment_status: 'paid',
          commission_amount: price * count * 0.12,
          hosting_fee: 1,
          guide_payout: price * count * 0.87,
        });

        if (!bookError) bookingsCreated++;

        // Add review if past trip
        if (isPast && Math.random() > 0.4) {
          await supabase.from('reviews').insert({
            booking_id: customer.id,
            trip_id: tripDate.trip_id,
            reviewer_id: customer.id,
            guide_id: tripDate.trip_id,
            rating: 4 + Math.random(),
            title: 'Amazing trip!',
            body: 'Incredible experience with fantastic views and expert guidance.',
            created_at: new Date().toISOString(),
          });
        }
      }
    }

    console.log(`✅ Created ${bookingsCreated} bookings`);
    console.log('\n✅ Database populated successfully!');
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

seedData();
