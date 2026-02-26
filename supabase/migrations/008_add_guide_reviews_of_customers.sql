-- Create guide_reviews_of_customers table
-- This allows guides to leave reviews/feedback about customers after trips
-- These reviews are private to the guide and not visible to customers

CREATE TABLE IF NOT EXISTS guide_reviews_of_customers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id UUID UNIQUE NOT NULL REFERENCES bookings(id) ON DELETE CASCADE,
  guide_id UUID NOT NULL REFERENCES guides(id) ON DELETE CASCADE,
  customer_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  trip_id UUID NOT NULL REFERENCES trips(id) ON DELETE CASCADE,
  
  rating INT CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  behavior_notes TEXT, -- Observations about customer behavior on trip
  professionalism_rating INT CHECK (professionalism_rating >= 1 AND professionalism_rating <= 5),
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for faster queries
CREATE INDEX idx_guide_reviews_guide_id ON guide_reviews_of_customers(guide_id);
CREATE INDEX idx_guide_reviews_customer_id ON guide_reviews_of_customers(customer_id);
CREATE INDEX idx_guide_reviews_booking_id ON guide_reviews_of_customers(booking_id);
CREATE INDEX idx_guide_reviews_trip_id ON guide_reviews_of_customers(trip_id);

-- RLS: Only guides can see their own reviews they wrote
ALTER TABLE guide_reviews_of_customers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Guides can view their own reviews of customers"
  ON guide_reviews_of_customers
  FOR SELECT
  USING (
    auth.uid() IN (
      SELECT user_id FROM guides WHERE id = guide_id
    )
  );

CREATE POLICY "Guides can create reviews of customers from completed bookings"
  ON guide_reviews_of_customers
  FOR INSERT
  WITH CHECK (
    -- Only the guide of the trip can review the customer
    auth.uid() IN (
      SELECT g.user_id FROM guides g
      WHERE g.id = guide_id
    )
    -- Only for completed trips
    AND booking_id IN (
      SELECT id FROM bookings WHERE status = 'completed'
    )
  );

CREATE POLICY "Guides can update their own reviews"
  ON guide_reviews_of_customers
  FOR UPDATE
  USING (
    auth.uid() IN (
      SELECT user_id FROM guides WHERE id = guide_id
    )
  )
  WITH CHECK (
    auth.uid() IN (
      SELECT user_id FROM guides WHERE id = guide_id
    )
  );

-- Prevent customers from accessing guide reviews of them
-- (RLS policies above handle this by only allowing guide access)

-- Add average ratings for customers (how guides rate them on average)
ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS avg_guide_rating DECIMAL(3,2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS guide_review_count INT DEFAULT 0;

-- Update customer ratings whenever a guide review is added
CREATE OR REPLACE FUNCTION update_customer_guide_rating()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE profiles
  SET 
    avg_guide_rating = (
      SELECT ROUND(AVG(rating)::numeric, 2) 
      FROM guide_reviews_of_customers 
      WHERE customer_id = NEW.customer_id
    ),
    guide_review_count = (
      SELECT COUNT(*) 
      FROM guide_reviews_of_customers 
      WHERE customer_id = NEW.customer_id
    )
  WHERE id = NEW.customer_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_customer_guide_rating ON guide_reviews_of_customers;
CREATE TRIGGER trigger_update_customer_guide_rating
AFTER INSERT OR UPDATE ON guide_reviews_of_customers
FOR EACH ROW
EXECUTE FUNCTION update_customer_guide_rating();
