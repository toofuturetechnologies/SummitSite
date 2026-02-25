#!/usr/bin/env node
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

const ACTIVITIES = ['Rock Climbing', 'Alpine Climbing', 'Hiking', 'Mountaineering', 'Skiing', 'Trekking', 'Backcountry'];
const DIFFICULTIES = ['Beginner', 'Intermediate', 'Advanced', 'Expert'];
const REGIONS = ['Colorado', 'Utah', 'Wyoming', 'California', 'Alaska', 'New Zealand', 'Patagonia', 'Nepal', 'Swiss Alps'];

async function bulkSeed() {
  console.log('🚀 Bulk seeding database...\n');

  try {
    // Get all guides
    const { data: guides } = await supabase.from('guides').select('id');
    const { data: customers } = await supabase.from('profiles').select('id').eq('user_type', 'traveler');

    console.log(`Found ${guides?.length} guides, ${customers?.length} customers\n`);

    // Create 500 trips
    const trips = [];
    console.log('Creating 500 trips...');
    
    for (let i = 0; i < 500; i++) {
      const guide = guides[Math.floor(Math.random() * guides.length)];
      const region = REGIONS[Math.floor(Math.random() * REGIONS.length)];
      const activity = ACTIVITIES[Math.floor(Math.random() * ACTIVITIES.length)];
      const difficulty = DIFFICULTIES[Math.floor(Math.random() * DIFFICULTIES.length)];

      const { data: trip } = await supabase.from('trips').insert({
        guide_id: guide.id,
        title: `${activity} - ${region}`,
        activity,
        difficulty,
        region,
        country: 'Global',
        description: `Join us for an amazing ${activity} experience in ${region}.`,
        highlights: ['Expert guides', 'Small groups', 'All inclusive'],
        itinerary: ['Day 1: Start', 'Day 2-5: Adventure', 'Day 6: End'],
        inclusions: ['Guide', 'Meals'],
        exclusions: ['Travel'],
        location: region,
        latitude: 40 + Math.random() * 30,
        longitude: -120 + Math.random() * 60,
        price: 800 + Math.random() * 2000,
        is_active: true,
      }).select();

      if (trip?.[0]) {
        trips.push(trip[0].id);
        
        // Create 2 dates per trip
        const today = new Date();
        for (let d = 0; d < 2; d++) {
          const offset = -150 + Math.random() * 300;
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
      
      if ((i + 1) % 100 === 0) console.log(`  ✓ ${i + 1}/500`);
    }

    console.log(`✅ Created ${trips.length} trips\n`);

    // Create 1000 bookings
    console.log('Creating 1000 bookings...');
    const { data: tripDates } = await supabase.from('trip_dates').select('*');

    for (let i = 0; i < 1000; i++) {
      const customer = customers[Math.floor(Math.random() * customers.length)];
      const tripDate = tripDates[Math.floor(Math.random() * tripDates.length)];
      const start = new Date(tripDate.start_date);
      const isPast = start < new Date();
      const price = 1000 + Math.random() * 2000;
      const count = 1 + Math.floor(Math.random() * 3);

      await supabase.from('bookings').insert({
        user_id: customer.id,
        trip_id: tripDate.trip_id,
        trip_date_id: tripDate.id,
        participant_count: count,
        total_price: price * count,
        status: isPast ? 'completed' : (Math.random() > 0.3 ? 'confirmed' : 'pending'),
        payment_status: 'paid',
        commission_amount: price * count * 0.12,
        hosting_fee: 1,
        guide_payout: price * count * 0.87,
        stripe_transfer_id: isPast ? `tr_${Math.random().toString(36).substr(2, 9)}` : null,
      });

      // Add review for 50% of past trips
      if (isPast && Math.random() > 0.5) {
        await supabase.from('reviews').insert({
          booking_id: i,
          trip_id: tripDate.trip_id,
          reviewer_id: customer.id,
          guide_id: tripDate.trip_id,
          rating: 3.5 + Math.random() * 1.5,
          title: ['Great!', 'Amazing!', 'Highly recommend', 'Perfect trip'][Math.floor(Math.random() * 4)],
          body: 'Outstanding experience with professional guides.',
          created_at: new Date().toISOString(),
        });
      }

      if ((i + 1) % 100 === 0) console.log(`  ✓ ${i + 1}/1000`);
    }

    console.log(`✅ Created 1000 bookings\n`);
    console.log('✅ Database fully populated!');
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

bulkSeed();
