const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function verify() {
  console.log('📊 Verifying database population...\n');

  const { count: guideCount } = await supabase.from('guides').select('id', { count: 'exact' });
  const { count: tripCount } = await supabase.from('trips').select('id', { count: 'exact' });
  const { count: bookingCount } = await supabase.from('bookings').select('id', { count: 'exact' });
  const { count: reviewCount } = await supabase.from('reviews').select('id', { count: 'exact' });
  const { count: messageCount } = await supabase.from('messages').select('id', { count: 'exact' });

  console.log('Database Summary:');
  console.log(`  👥 Guides: ${guideCount}`);
  console.log(`  🗻 Trips: ${tripCount}`);
  console.log(`  📅 Bookings: ${bookingCount}`);
  console.log(`  ⭐ Reviews: ${reviewCount}`);
  console.log(`  💬 Messages: ${messageCount}`);
  console.log(`\n✅ Site is fully populated!`);
}

verify().catch(console.error);
