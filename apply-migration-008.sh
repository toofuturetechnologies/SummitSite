#!/bin/bash

# Apply migration 008 to Supabase database
# This migration creates the guide_reviews_of_customers table

set -e

MIGRATION_FILE="supabase/migrations/008_add_guide_reviews_of_customers.sql"

if [ ! -f "$MIGRATION_FILE" ]; then
    echo "❌ Migration file not found: $MIGRATION_FILE"
    exit 1
fi

echo "📋 Applying migration 008..."
echo "📁 File: $MIGRATION_FILE"
echo ""
echo "⚠️  To apply this migration:"
echo "1. Log in to Supabase dashboard: https://app.supabase.com"
echo "2. Select your project"
echo "3. Go to SQL Editor"
echo "4. Click 'New query'"
echo "5. Copy the contents of $MIGRATION_FILE"
echo "6. Paste into the SQL editor"
echo "7. Click 'Run'"
echo ""
echo "Or use Supabase CLI:"
echo "  supabase db push"
echo ""
echo "✅ Migration 008 is ready to apply"
