const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function seed() {
  console.log('🌱 Final database seeding...\n');

  const { data: guides } = await supabase.from('guides').select('id, user_id');
  const { data: trips } = await supabase.from('trips').select('id, guide_id');
  const { data: customers } = await supabase.from('profiles').select('id').eq('user_type', 'traveler');
  const { data: tripDates } = await supabase.from('trip_dates').select('*');

  console.log(`📊 ${guides.length} guides, ${trips.length} trips, ${customers.length} customers, ${tripDates.length} trip dates\n`);

  let bookingsCreated = 0;
  let reviewsCreated = 0;

  // Create 500 bookings
  for (let i = 0; i < 500; i++) {
    const customer = customers[i % customers.length];
    const tripDate = tripDates[i % tripDates.length];
    const trip = trips[i % trips.length];
    const guide = guides.find(g => g.id === trip.guide_id) || guides[0];

    const start = new Date(tripDate.start_date);
    const isPast = start < new Date();
    const price = 1500 + Math.random() * 2500;
    const count = 1 + Math.floor(Math.random() * 3);

    const { error } = await supabase.from('bookings').insert({
      user_id: customer.id,
      trip_id: trip.id,
      trip_date_id: tripDate.id,
      guide_id: guide.id,
      participant_count: count,
      total_price: price * count,
      commission_amount: Math.round(price * count * 0.12 * 100) / 100,
      guide_payout: Math.round(price * count * 0.88 * 100) / 100,
      status: isPast ? 'completed' : (Math.random() > 0.2 ? 'confirmed' : 'pending'),
      currency: 'USD',
    });

    if (!error) {
      bookingsCreated++;

      // Add review for past trips (50% of them)
      if (isPast && Math.random() > 0.5) {
        await supabase.from('reviews').insert({
          booking_id: customer.id,
          trip_id: trip.id,
          reviewer_id: customer.id,
          guide_id: guide.id,
          rating: 3.5 + Math.random() * 1.5,
          title: ['Amazing!', 'Highly recommend', 'Great experience', 'Perfect trip'][Math.floor(Math.random() * 4)],
          body: 'Outstanding guide and incredible scenery. Would definitely book again!',
          created_at: new Date(new Date().getTime() - Math.random() * 60 * 86400000).toISOString(),
        });
        reviewsCreated++;
      }
    }

    if ((i + 1) % 100 === 0) console.log(`✓ ${i + 1}/500 bookings`);
  }

  console.log(`\n✅ Created ${bookingsCreated} bookings, ${reviewsCreated} reviews`);
  console.log(`\n🎉 Database fully populated with realistic data!`);
}

seed().catch(console.error);
