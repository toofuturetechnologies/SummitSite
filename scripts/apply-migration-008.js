#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Load environment variables
require('dotenv').config({ path: '.env.local' });

const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceRoleKey) {
  console.error('❌ Error: SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set');
  process.exit(1);
}

// Create Supabase client with service role key
const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: {
    persistSession: false,
  },
});

async function applyMigration() {
  console.log('📋 Applying migration 008...\n');

  try {
    // Read the migration file
    const migrationPath = path.join(__dirname, '../supabase/migrations/008_add_guide_reviews_of_customers.sql');
    
    if (!fs.existsSync(migrationPath)) {
      console.error(`❌ Migration file not found: ${migrationPath}`);
      process.exit(1);
    }

    const migrationSQL = fs.readFileSync(migrationPath, 'utf8');
    console.log('✅ Migration file loaded');
    console.log(`📄 File size: ${migrationSQL.length} bytes`);
    console.log('');

    // Execute the migration
    console.log('🚀 Executing SQL migration...');
    const { data, error } = await supabase.rpc('exec', {
      sql: migrationSQL,
    }).catch((err) => {
      // RPC might not exist, try alternative approach
      console.log('⚠️  RPC method not available, attempting direct execution...');
      return { error: err };
    });

    if (error) {
      // If RPC fails, we need to use a different approach
      console.log('ℹ️  Note: Direct SQL execution requires a different method.');
      console.log('');
      console.log('📝 Migration SQL is ready. You can execute it manually:');
      console.log('1. Go to: https://app.supabase.com');
      console.log('2. Select your project: nqczucpdkccbkydbzytl');
      console.log('3. Go to SQL Editor');
      console.log('4. Click "New query"');
      console.log('5. Copy and paste the migration SQL');
      console.log('6. Click "Run"');
      console.log('');
      console.log('Migration file location:');
      console.log(`  ${migrationPath}`);
      process.exit(0);
    }

    console.log('✅ Migration executed successfully!');
    console.log('');
    console.log('📊 Results:');
    console.log(JSON.stringify(data, null, 2));
    console.log('');
    console.log('✨ Guide review system is now active!');
    
  } catch (err) {
    console.error('❌ Error applying migration:', err.message);
    console.log('');
    console.log('📝 Please apply the migration manually:');
    console.log('1. Go to Supabase Dashboard');
    console.log('2. SQL Editor → New query');
    console.log('3. Copy migration file: supabase/migrations/008_add_guide_reviews_of_customers.sql');
    console.log('4. Paste and run');
    process.exit(1);
  }
}

applyMigration();
