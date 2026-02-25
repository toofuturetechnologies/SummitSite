const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function seed() {
  console.log('Seeding database...\n');

  // Get first guide
  const { data: guides } = await supabase.from('guides').select('id').limit(1);
  const { data: customers } = await supabase.from('profiles').select('id').eq('user_type', 'traveler').limit(100);

  if (!guides || !customers) {
    console.error('Missing guides or customers');
    return;
  }

  const guideId = guides[0].id;
  const trips = [];

  // Create 50 trips
  for (let i = 0; i < 50; i++) {
    const { data: trip, error } = await supabase
      .from('trips')
      .insert({
        guide_id: guideId,
        title: `Mountain Adventure ${i + 1}`,
        activity: 'Climbing',
        difficulty: ['Beginner', 'Intermediate', 'Advanced'][i % 3],
        region: 'Colorado',
        country: 'USA',
        description: 'Amazing mountain experience',
        highlights: ['Expert guide', 'Small groups'],
        itinerary: ['Day 1-3: Climb'],
        inclusions: ['Guide', 'Meals'],
        exclusions: ['Travel'],
        location: 'Colorado',
        latitude: 40 + Math.random() * 10,
        longitude: -105 + Math.random() * 10,
        price: 1000 + Math.random() * 2000,
        is_active: true,
      })
      .select();

    if (error) {
      console.error('Trip error:', error.message);
      continue;
    }

    if (trip?.[0]) {
      trips.push(trip[0].id);
      
      // Create 3 dates
      const today = new Date();
      for (let d = 0; d < 3; d++) {
        const offset = -100 + d * 100;
        const start = new Date(today.getTime() + offset * 86400000);
        const end = new Date(start.getTime() + 4 * 86400000);

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

  console.log(`Created ${trips.length} trips\n`);

  // Get trip dates
  const { data: tripDates } = await supabase.from('trip_dates').select('*');
  console.log(`Found ${tripDates?.length} trip dates\n`);

  // Create 300 bookings
  let bookingsCreated = 0;
  for (let i = 0; i < 300; i++) {
    const customer = customers[i % customers.length];
    const tripDate = tripDates[i % tripDates.length];

    if (!tripDate) continue;

    const start = new Date(tripDate.start_date);
    const isPast = start < new Date();
    const price = 1200 + Math.random() * 1800;

    const { error } = await supabase.from('bookings').insert({
      user_id: customer.id,
      trip_id: tripDate.trip_id,
      trip_date_id: tripDate.id,
      participant_count: 1 + Math.floor(Math.random() * 3),
      total_price: price,
      status: isPast ? 'completed' : 'confirmed',
      payment_status: 'paid',
      commission_amount: price * 0.12,
      hosting_fee: 1,
      guide_payout: price * 0.87,
      stripe_transfer_id: isPast ? `tr_test_${i}` : null,
    });

    if (!error) bookingsCreated++;

    // Add review for past trips
    if (isPast && Math.random() > 0.5) {
      await supabase.from('reviews').insert({
        booking_id: i,
        trip_id: tripDate.trip_id,
        reviewer_id: customer.id,
        guide_id: tripDate.trip_id,
        rating: 4 + Math.random() * 1,
        title: 'Amazing experience!',
        body: 'Great guide and incredible scenery. Highly recommended.',
        created_at: new Date(new Date().getTime() - Math.random() * 30 * 86400000).toISOString(),
      });
    }
  }

  console.log(`Created ${bookingsCreated} bookings\n✅ Done!`);
}

seed().catch(console.error);
