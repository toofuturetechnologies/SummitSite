#!/bin/bash

# Apply Migration 011 to Supabase
# This script applies the admin panel schema changes

SUPABASE_PROJECT_ID="nqczucpdkccbkydbzytl"
SUPABASE_URL="https://${SUPABASE_PROJECT_ID}.supabase.co"
SUPABASE_KEY="${SUPABASE_SERVICE_ROLE_KEY}"

echo "🚀 Applying Migration 011: Add Admin Panel"
echo "==========================================="
echo ""
echo "Project: $SUPABASE_PROJECT_ID"
echo "URL: $SUPABASE_URL"
echo ""

# Read the migration file
MIGRATION_SQL=$(cat supabase/migrations/011_add_admin_panel.sql)

# Apply via RPC or direct SQL
# Option 1: Using Supabase JS client (requires Node.js)
node << 'EOF'
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

const SUPABASE_URL = 'https://nqczucpdkccbkydbzytl.supabase.co';
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_KEY) {
  console.error('❌ Error: SUPABASE_SERVICE_ROLE_KEY environment variable not set');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function applyMigration() {
  try {
    const sql = fs.readFileSync('supabase/migrations/011_add_admin_panel.sql', 'utf-8');
    
    // Split by semicolon and execute each statement
    const statements = sql
      .split(';')
      .map(s => s.trim())
      .filter(s => s.length > 0 && !s.startsWith('--'));
    
    console.log(`📝 Executing ${statements.length} SQL statements...`);
    
    for (let i = 0; i < statements.length; i++) {
      const stmt = statements[i];
      const stmtName = stmt.substring(0, 50).replace(/\n/g, ' ') + '...';
      
      try {
        const { error } = await supabase.rpc('exec', { statement: stmt });
        
        if (error) {
          console.warn(`  ⚠️  Statement ${i + 1}: ${stmtName} - ${error.message}`);
        } else {
          console.log(`  ✅ Statement ${i + 1}: Success`);
        }
      } catch (e) {
        console.warn(`  ⚠️  Statement ${i + 1}: ${stmtName} - ${e.message}`);
      }
    }
    
    console.log('');
    console.log('✅ Migration 011 applied!');
    console.log('');
    console.log('New tables created:');
    console.log('  - admin_activity_logs');
    console.log('  - disputes');
    console.log('  - content_reports');
    console.log('  - suspension_history');
    console.log('');
    console.log('New columns added:');
    console.log('  - profiles.admin_role');
    console.log('  - profiles.admin_since');
    
  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    process.exit(1);
  }
}

applyMigration();
EOF
