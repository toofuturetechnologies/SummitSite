const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function seed() {
  console.log('🌱 Seeding Summit database...\n');

  try {
    const { data: guides } = await supabase.from('guides').select('id').limit(50);
    const { data: customers } = await supabase.from('profiles').select('id').eq('user_type', 'traveler').limit(100);

    if (!guides || !customers || guides.length === 0) {
      console.error('❌ Need guides and customers first');
      return;
    }

    console.log(`📊 Found ${guides.length} guides, ${customers.length} customers\n`);

    let tripsCreated = 0;
    let datesCreated = 0;
    let bookingsCreated = 0;

    // Create 100 trips
    const activities = ['rock_climbing', 'alpine_climbing', 'hiking', 'mountaineering', 'skiing', 'trekking'];
    const difficulties = ['beginner', 'intermediate', 'advanced', 'expert'];
    const regions = ['Colorado', 'Utah', 'California', 'Alaska', 'Nepal', 'Patagonia'];

    for (let i = 0; i < 100; i++) {
      const guide = guides[Math.floor(Math.random() * guides.length)];
      const activity = activities[Math.floor(Math.random() * activities.length)];
      const difficulty = difficulties[Math.floor(Math.random() * difficulties.length)];
      const region = regions[Math.floor(Math.random() * regions.length)];
      const price = 1000 + Math.floor(Math.random() * 3000);
      const duration = 3 + Math.floor(Math.random() * 7);

      const slug = `${activity}-${region.toLowerCase()}-${i}`;

      const { data: trip, error } = await supabase
        .from('trips')
        .insert({
          guide_id: guide.id,
          title: `${activity.replace('_', ' ')} in ${region}`,
          slug,
          activity,
          difficulty,
          description: `Professional ${activity} adventure with expert guides`,
          highlights: ['Expert instruction', 'Small groups', 'All meals included'],
          itinerary: {days: [{day: 1, title: 'Start'}, {day: duration, title: 'Summit'}]},
          inclusions: ['Guide', 'Meals', 'Equipment'],
          exclusions: ['Travel to trailhead', 'Personal insurance'],
          gear_list: ['Climbing shoes', 'Harness', 'Rope'],
          meeting_point: region,
          duration_days: duration,
          price_per_person: price,
          country: 'Global',
          region,
          latitude: 40 + Math.random() * 30,
          longitude: -120 + Math.random() * 80,
          max_group_size: 8,
          is_active: true,
        })
        .select();

      if (error || !trip || !trip[0]) {
        console.error(`Trip ${i}: ${error?.message}`);
        continue;
      }

      tripsCreated++;

      // Create 3 trip dates per trip
      const today = new Date();
      for (let d = 0; d < 3; d++) {
        const offset = -90 + d * 90;
        const start = new Date(today.getTime() + offset * 86400000);
        const end = new Date(start.getTime() + (duration - 1) * 86400000);
        const spots = 6 + Math.floor(Math.random() * 3);

        const { error: dError } = await supabase.from('trip_dates').insert({
          trip_id: trip[0].id,
          start_date: start.toISOString().split('T')[0],
          end_date: end.toISOString().split('T')[0],
          spots_total: spots,
          spots_available: Math.floor(Math.random() * spots),
        });

        if (!dError) datesCreated++;
      }

      if ((i + 1) % 20 === 0) console.log(`✓ ${i + 1}/100 trips`);
    }

    console.log(`\n✅ Created ${tripsCreated} trips, ${datesCreated} dates\n`);

    // Create bookings
    const { data: tripDates } = await supabase.from('trip_dates').select('*');

    for (let i = 0; i < 300; i++) {
      const customer = customers[i % customers.length];
      const tripDate = tripDates[Math.floor(Math.random() * tripDates.length)];

      if (!tripDate) continue;

      const start = new Date(tripDate.start_date);
      const isPast = start < new Date();

      const { error } = await supabase.from('bookings').insert({
        user_id: customer.id,
        trip_id: tripDate.trip_id,
        trip_date_id: tripDate.id,
        participant_count: 1 + Math.floor(Math.random() * 3),
        total_price: 2000 + Math.random() * 3000,
        status: isPast ? 'completed' : 'confirmed',
        payment_status: 'paid',
      });

      if (!error) bookingsCreated++;

      if ((i + 1) % 100 === 0) console.log(`✓ ${i + 1}/300 bookings`);
    }

    console.log(`\n✅ Created ${bookingsCreated} bookings`);
    console.log(`\n🎉 Database fully populated!`);
  } catch (error) {
    console.error('❌', error.message);
  }
}

seed();
