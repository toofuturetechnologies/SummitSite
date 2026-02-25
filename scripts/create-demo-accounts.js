#!/usr/bin/env node

/**
 * Create Demo Guide and Customer Accounts for Testing
 * 
 * This script creates test accounts in Supabase and sets up:
 * - 1 demo guide (Alex Mountain)
 * - 2 demo customers (Jane Traveler, John Explorer)
 * 
 * Usage:
 *   node scripts/create-demo-accounts.js
 */

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
  console.error('❌ Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);

const demoAccounts = {
  guide: {
    email: 'alex.mountain@example.com',
    password: 'DemoPassword123!',
    displayName: 'Alex Mountain',
    tagline: 'Expert mountaineer & rock climber',
    bio: 'Certified AMGA guide with 15+ years experience in alpine climbing.',
    userType: 'guide',
  },
  customer1: {
    email: 'jane.traveler@example.com',
    password: 'DemoPassword123!',
    displayName: 'Jane Traveler',
    userType: 'traveler',
  },
  customer2: {
    email: 'john.explorer@example.com',
    password: 'DemoPassword123!',
    displayName: 'John Explorer',
    userType: 'traveler',
  },
};

async function createDemoAccounts() {
  console.log('🎭 Creating Demo Accounts for Testing');
  console.log('=====================================\n');

  const createdAccounts = {};

  // Create accounts
  for (const [role, data] of Object.entries(demoAccounts)) {
    console.log(`Creating ${role}...`);

    try {
      // Create auth user
      const { data: authData, error: authError } = await supabase.auth.admin.createUser({
        email: data.email,
        password: data.password,
        email_confirm: true,
        user_metadata: {
          full_name: data.displayName,
          user_type: data.userType,
        },
      });

      if (authError) {
        if (authError.message.includes('already registered')) {
          console.log(`   ⚠️  Already exists, skipping...`);
          
          // Get existing user
          const { data: existingUsers } = await supabase
            .from('profiles')
            .select('id')
            .eq('email', data.email)
            .single();

          if (existingUsers) {
            createdAccounts[role] = { id: existingUsers.id, email: data.email };
          }
          continue;
        }
        throw authError;
      }

      const userId = authData.user.id;
      createdAccounts[role] = { id: userId, email: data.email };

      console.log(`   ✅ Created: ${data.email}`);
      console.log(`   ID: ${userId}`);

      // Create profile (should auto-create via trigger, but ensure it exists)
      const { error: profileError } = await supabase
        .from('profiles')
        .upsert({
          id: userId,
          full_name: data.displayName,
          email: data.email,
          user_type: data.userType,
        });

      if (profileError && !profileError.message.includes('duplicate')) {
        console.error(`   ⚠️  Profile error: ${profileError.message}`);
      }

      // If guide, create guide record
      if (data.userType === 'guide') {
        const { error: guideError } = await supabase
          .from('guides')
          .upsert({
            user_id: userId,
            display_name: data.displayName,
            tagline: data.tagline,
            bio: data.bio,
            slug: data.displayName.toLowerCase().replace(/\s+/g, '-'),
            is_active: true,
            commission_rate: 0.12,
          });

        if (guideError && !guideError.message.includes('duplicate')) {
          console.error(`   ⚠️  Guide error: ${guideError.message}`);
        } else {
          console.log(`   ✅ Guide profile created`);
        }
      }

      console.log('');
    } catch (error) {
      console.error(`   ❌ Error: ${error.message}\n`);
    }
  }

  // Print summary
  console.log('========================================');
  console.log('✅ Demo Accounts Ready for Testing');
  console.log('========================================\n');

  console.log('📋 TEST CREDENTIALS:\n');

  console.log('🏔️  GUIDE (Alex Mountain):');
  console.log(`   Email:    ${demoAccounts.guide.email}`);
  console.log(`   Password: ${demoAccounts.guide.password}`);
  console.log(`   ID:       ${createdAccounts.guide?.id || 'CREATED'}`);
  console.log('');

  console.log('👤 CUSTOMER 1 (Jane Traveler):');
  console.log(`   Email:    ${demoAccounts.customer1.email}`);
  console.log(`   Password: ${demoAccounts.customer1.password}`);
  console.log(`   ID:       ${createdAccounts.customer1?.id || 'CREATED'}`);
  console.log('');

  console.log('👤 CUSTOMER 2 (John Explorer):');
  console.log(`   Email:    ${demoAccounts.customer2.email}`);
  console.log(`   Password: ${demoAccounts.customer2.password}`);
  console.log(`   ID:       ${createdAccounts.customer2?.id || 'CREATED'}`);
  console.log('');

  console.log('🎯 TESTING FLOWS:\n');

  console.log('1️⃣  MESSAGING:');
  console.log('   • Log in as Jane Traveler');
  console.log('   • Go to trip detail page');
  console.log('   • Click "Message Guide"');
  console.log('   • Send a message');
  console.log('   • Switch to Alex Mountain account');
  console.log('   • Check messages dashboard - should see Jane\'s message');
  console.log('   • Reply to Jane');
  console.log('');

  console.log('2️⃣  STRIPE CONNECT:');
  console.log('   • Log in as Alex Mountain (guide)');
  console.log('   • Go to Dashboard → Stripe Payouts');
  console.log('   • Click "Connect Bank Account"');
  console.log('   • (Use Stripe test account for testing)');
  console.log('');

  console.log('3️⃣  BOOKING & REVIEW:');
  console.log('   • Create a test trip as Alex');
  console.log('   • Book as Jane Traveler');
  console.log('   • Complete booking (payment)');
  console.log('   • Mark as completed');
  console.log('   • Leave a review as Jane');
  console.log('   • Check Alex\'s trip page - rating should update');
  console.log('   • Alex responds to the review');
  console.log('');

  console.log('💡 TIPS:');
  console.log('   • Use browser dev tools → Application → Local Storage to clear auth');
  console.log('   • Open two browser windows for side-by-side testing');
  console.log('   • Check Supabase dashboard for real-time data updates');
  console.log('');
}

createDemoAccounts().catch(console.error);
