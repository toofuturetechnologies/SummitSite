-- Add Stripe Connect columns to guides table
ALTER TABLE guides
ADD COLUMN IF NOT EXISTS stripe_account_id TEXT,
ADD COLUMN IF NOT EXISTS stripe_onboarding_complete BOOLEAN DEFAULT false;

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_guides_stripe_account_id ON guides(stripe_account_id);
