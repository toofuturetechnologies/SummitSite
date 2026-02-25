#!/bin/bash

# Apply migration 007_add_ugc_referral_system.sql to Supabase

echo "🔄 Applying UGC Referral System migration to Supabase..."
echo ""
echo "⚠️  IMPORTANT: Run this SQL in your Supabase dashboard:"
echo "1. Go to https://app.supabase.com"
echo "2. Select your project"
echo "3. Go to SQL Editor"
echo "4. Create new query"
echo "5. Copy and paste the SQL below"
echo "6. Click 'Run'"
echo ""
echo "=========================================="
cat supabase/migrations/007_add_ugc_referral_system.sql
echo "=========================================="
echo ""
echo "✅ After running the SQL, all tables and policies will be ready!"
