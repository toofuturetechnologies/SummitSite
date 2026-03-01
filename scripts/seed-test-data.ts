/**
 * Seed Test Data Script
 * Generates realistic test data for admin panel testing
 * 
 * Usage: npx ts-node scripts/seed-test-data.ts
 */

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseKey);

interface TestUser {
  email: string;
  password: string;
  name: string;
  role: 'customer' | 'guide';
}

const TEST_USERS: TestUser[] = [
  { email: 'customer1@test.local', password: 'Test123!', name: 'Alex Johnson', role: 'customer' },
  { email: 'customer2@test.local', password: 'Test123!', name: 'Sarah Chen', role: 'customer' },
  { email: 'customer3@test.local', password: 'Test123!', name: 'Michael Brown', role: 'customer' },
  { email: 'guide1@test.local', password: 'Test123!', name: 'Guide Alex', role: 'guide' },
  { email: 'guide2@test.local', password: 'Test123!', name: 'Guide Jordan', role: 'guide' },
];

const TRIP_TEMPLATES = [
  { title: 'Beginner Mountain Trek', difficulty: 'beginner', price: 150 },
  { title: 'Intermediate Rock Climbing', difficulty: 'intermediate', price: 250 },
  { title: 'Advanced Summit Expedition', difficulty: 'advanced', price: 500 },
  { title: 'Desert Hiking Adventure', difficulty: 'beginner', price: 120 },
  { title: 'River Rafting Challenge', difficulty: 'intermediate', price: 180 },
];

async function seedTestData() {
  console.log('🌱 Seeding test data...\n');

  try {
    // 1. Create test users
    console.log('📝 Creating test users...');
    const userIds: Record<string, string> = {};

    for (const user of TEST_USERS) {
      try {
        // Create auth user
        const { data: authData, error: authError } = await supabase.auth.admin.createUser({
          email: user.email,
          password: user.password,
          email_confirm: true,
        });

        if (authError) {
          console.log(`  ⚠️  User ${user.email} already exists or error: ${authError.message}`);
          continue;
        }

        userIds[user.email] = authData.user.id;

        // Create profile
        const { error: profileError } = await supabase.from('profiles').insert({
          id: authData.user.id,
          email: user.email,
          name: user.name,
          is_guide: user.role === 'guide',
          admin_role: null,
        });

        if (profileError) throw profileError;

        console.log(`  ✓ Created user: ${user.email}`);

        // Create guide record if applicable
        if (user.role === 'guide') {
          const { error: guideError } = await supabase.from('guides').insert({
            user_id: authData.user.id,
            is_active: true,
            years_experience: Math.floor(Math.random() * 15) + 1,
            certifications: ['IFMGA', 'CPR'],
          });

          if (guideError) console.warn('  ⚠️  Could not create guide record');
        }
      } catch (err) {
        console.error(`  ✗ Error creating user ${user.email}:`, err);
      }
    }

    // 2. Create test trips
    console.log('\n🏔️  Creating test trips...');
    const tripIds: string[] = [];
    const guideEmail = TEST_USERS.find(u => u.role === 'guide')?.email;
    const guideId = guideEmail ? userIds[guideEmail] : Object.values(userIds)[0];

    for (let i = 0; i < TRIP_TEMPLATES.length; i++) {
      const trip = TRIP_TEMPLATES[i];
      const { data: tripData, error: tripError } = await supabase
        .from('trips')
        .insert({
          user_id: guideId,
          title: trip.title,
          description: `Amazing ${trip.title} experience. Perfect for ${trip.difficulty} adventurers.`,
          difficulty: trip.difficulty,
          price: trip.price,
          location: ['Colorado', 'Utah', 'California', 'Montana', 'Wyoming'][i % 5],
          duration_hours: 4 + i * 2,
          max_participants: 6,
          is_active: true,
        })
        .select()
        .single();

      if (tripError) {
        console.error(`  ✗ Error creating trip:`, tripError);
        continue;
      }

      tripIds.push(tripData.id);
      console.log(`  ✓ Created trip: ${trip.title}`);
    }

    // 3. Create test bookings
    console.log('\n📅 Creating test bookings...');
    const customerEmails = TEST_USERS.filter(u => u.role === 'customer').map(u => u.email);
    const bookingIds: string[] = [];

    for (let i = 0; i < 10; i++) {
      const tripId = tripIds[i % tripIds.length];
      const customerId = userIds[customerEmails[i % customerEmails.length]];

      const statuses = ['pending', 'confirmed', 'completed'];
      const status = statuses[i % statuses.length];

      const { data: bookingData, error: bookingError } = await supabase
        .from('bookings')
        .insert({
          trip_id: tripId,
          user_id: customerId,
          booking_date: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
          trip_date: new Date(Date.now() + Math.random() * 90 * 24 * 60 * 60 * 1000).toISOString(),
          participants: Math.floor(Math.random() * 5) + 1,
          amount: 150 + Math.random() * 400,
          status: status as any,
          payment_status: 'paid',
        })
        .select()
        .single();

      if (bookingError) {
        console.error(`  ✗ Error creating booking:`, bookingError);
        continue;
      }

      bookingIds.push(bookingData.id);
      console.log(`  ✓ Created booking: ${bookingData.id} (${status})`);
    }

    // 4. Create test disputes
    console.log('\n⚖️  Creating test disputes...');
    const reasons = ['quality', 'no_show', 'unsafe', 'refund_request'];

    for (let i = 0; i < 3; i++) {
      const bookingId = bookingIds[i % bookingIds.length];
      const { data: booking, error: bookingErr } = await supabase
        .from('bookings')
        .select('user_id, amount')
        .eq('id', bookingId)
        .single();

      if (bookingErr || !booking) continue;

      const { error: disputeError } = await supabase.from('disputes').insert({
        booking_id: bookingId,
        initiator_id: booking.user_id,
        reason: reasons[i % reasons.length],
        description: `Test dispute for booking ${bookingId}`,
        status: i === 0 ? 'open' : 'resolved',
        resolution: i === 0 ? null : i % 2 === 0 ? 'approved' : 'denied',
      });

      if (disputeError) {
        console.error(`  ✗ Error creating dispute:`, disputeError);
        continue;
      }

      console.log(`  ✓ Created dispute for booking ${bookingId}`);
    }

    // 5. Create test reviews
    console.log('\n⭐ Creating test reviews...');
    for (let i = 0; i < 5; i++) {
      const bookingId = bookingIds[i % bookingIds.length];

      const { error: reviewError } = await supabase.from('guide_reviews').insert({
        booking_id: bookingId,
        reviewer_id: userIds[customerEmails[i % customerEmails.length]],
        rating: 3 + Math.floor(Math.random() * 3),
        comment: `Great experience! ${['Very professional guide', 'Amazing views', 'Well organized', 'Highly recommend'][i % 4]}`,
      });

      if (reviewError) {
        console.error(`  ✗ Error creating review:`, reviewError);
        continue;
      }

      console.log(`  ✓ Created review for booking ${bookingId}`);
    }

    // 6. Create test UGC videos
    console.log('\n🎬 Creating test UGC videos...');
    for (let i = 0; i < 5; i++) {
      const tripId = tripIds[i % tripIds.length];
      const customerId = userIds[customerEmails[i % customerEmails.length]];

      const { error: ugcError } = await supabase.from('ugc_videos').insert({
        trip_id: tripId,
        creator_user_id: customerId,
        tiktok_url: `https://www.tiktok.com/@testcreator/video/${1000000000 + i}`,
        tiktok_video_id: `video_${i}`,
        status: ['pending', 'approved', 'rejected'][i % 3],
        created_at: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
      });

      if (ugcError) {
        console.error(`  ✗ Error creating UGC:`, ugcError);
        continue;
      }

      console.log(`  ✓ Created UGC video for trip ${tripId}`);
    }

    // 7. Create test content reports
    console.log('\n📋 Creating test content reports...');
    for (let i = 0; i < 3; i++) {
      const reportReasons = ['inappropriate', 'misinformation', 'spam', 'copyright'];
      const customerId = userIds[customerEmails[i % customerEmails.length]];

      const { error: reportError } = await supabase.from('content_reports').insert({
        ugc_id: null,
        trip_id: tripIds[i % tripIds.length],
        reporter_id: customerId,
        reason: reportReasons[i % reportReasons.length],
        description: `Test report: suspicious activity`,
        status: i === 0 ? 'pending' : 'resolved',
        action_taken: i === 0 ? null : 'warning',
      });

      if (reportError) {
        console.error(`  ✗ Error creating report:`, reportError);
        continue;
      }

      console.log(`  ✓ Created content report`);
    }

    console.log('\n✅ Test data seeding complete!');
    console.log('\n📊 Test Users:');
    console.log('   Customers:');
    customerEmails.forEach(email => console.log(`     - ${email} / Test123!`));
    console.log('   Guides:');
    TEST_USERS.filter(u => u.role === 'guide').forEach(user => {
      console.log(`     - ${user.email} / Test123!`);
    });

    console.log('\n💡 Use these credentials to test the admin panel');
    console.log('   Note: Only users with admin_role = "admin" can access /admin\n');

  } catch (err) {
    console.error('❌ Seeding failed:', err);
    process.exit(1);
  }
}

seedTestData();
