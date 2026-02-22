-- Add missing payment fields to bookings table
ALTER TABLE bookings
ADD COLUMN IF NOT EXISTS hosting_fee DECIMAL(10,2) DEFAULT 1.00,
ADD COLUMN IF NOT EXISTS payment_status TEXT DEFAULT 'unpaid' CHECK (payment_status IN ('unpaid', 'paid', 'refunded', 'failed'));
