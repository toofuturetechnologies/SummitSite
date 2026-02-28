-- Migration 011: Add Admin Panel Infrastructure
-- Adds: admin roles, activity logging, disputes, reports, suspensions
-- Created: 2026-02-28

-- 1. Add admin_role and admin_since to profiles
ALTER TABLE profiles 
ADD COLUMN admin_role TEXT DEFAULT NULL CHECK (admin_role IN ('moderator', 'admin', 'super_admin')),
ADD COLUMN admin_since TIMESTAMP DEFAULT NULL;

-- 2. Create admin_activity_logs table
CREATE TABLE IF NOT EXISTS admin_activity_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_id UUID NOT NULL REFERENCES profiles(id) ON DELETE RESTRICT,
  action TEXT NOT NULL,
  target_type TEXT NOT NULL,
  target_id UUID NOT NULL,
  details JSONB DEFAULT NULL,
  notes TEXT DEFAULT NULL,
  ip_address TEXT DEFAULT NULL,
  created_at TIMESTAMP DEFAULT now()
);

-- 3. Create disputes table
CREATE TABLE IF NOT EXISTS disputes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id UUID UNIQUE NOT NULL REFERENCES bookings(id) ON DELETE RESTRICT,
  initiator_id UUID NOT NULL REFERENCES profiles(id) ON DELETE RESTRICT,
  reason TEXT NOT NULL CHECK (reason IN ('quality', 'no_show', 'unsafe', 'refund_request', 'other')),
  description TEXT NOT NULL,
  status TEXT DEFAULT 'open' CHECK (status IN ('open', 'in_review', 'resolved', 'closed')),
  resolution TEXT DEFAULT NULL CHECK (resolution IN (NULL, 'approved', 'denied')),
  admin_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  admin_notes TEXT DEFAULT NULL,
  refund_amount DECIMAL DEFAULT NULL,
  refund_transaction_id TEXT DEFAULT NULL,
  created_at TIMESTAMP DEFAULT now(),
  resolved_at TIMESTAMP DEFAULT NULL
);

-- 4. Create content_reports table
CREATE TABLE IF NOT EXISTS content_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ugc_id UUID REFERENCES ugc_videos(id) ON DELETE CASCADE,
  trip_id UUID REFERENCES trips(id) ON DELETE CASCADE,
  reporter_id UUID NOT NULL REFERENCES profiles(id) ON DELETE RESTRICT,
  reason TEXT NOT NULL CHECK (reason IN ('inappropriate', 'misinformation', 'spam', 'copyright', 'other')),
  description TEXT NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'reviewed', 'resolved')),
  action_taken TEXT DEFAULT NULL CHECK (action_taken IN (NULL, 'none', 'warning', 'removed', 'suspended')),
  moderator_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  moderator_notes TEXT DEFAULT NULL,
  created_at TIMESTAMP DEFAULT now(),
  reviewed_at TIMESTAMP DEFAULT NULL
);

-- 5. Create suspension_history table
CREATE TABLE IF NOT EXISTS suspension_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE RESTRICT,
  reason TEXT NOT NULL,
  suspended_by UUID NOT NULL REFERENCES profiles(id) ON DELETE RESTRICT,
  suspended_at TIMESTAMP DEFAULT now(),
  expires_at TIMESTAMP DEFAULT NULL,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'appealed', 'lifted')),
  appeal_reason TEXT DEFAULT NULL,
  appeal_notes TEXT DEFAULT NULL,
  lifted_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  lifted_at TIMESTAMP DEFAULT NULL
);

-- Create indexes for performance
CREATE INDEX idx_admin_activity_logs_admin_id ON admin_activity_logs(admin_id);
CREATE INDEX idx_admin_activity_logs_target ON admin_activity_logs(target_type, target_id);
CREATE INDEX idx_admin_activity_logs_created ON admin_activity_logs(created_at DESC);
CREATE INDEX idx_disputes_status ON disputes(status);
CREATE INDEX idx_disputes_booking_id ON disputes(booking_id);
CREATE INDEX idx_disputes_created ON disputes(created_at DESC);
CREATE INDEX idx_content_reports_status ON content_reports(status);
CREATE INDEX idx_content_reports_ugc ON content_reports(ugc_id);
CREATE INDEX idx_content_reports_trip ON content_reports(trip_id);
CREATE INDEX idx_content_reports_created ON content_reports(created_at DESC);
CREATE INDEX idx_suspension_history_user ON suspension_history(user_id);
CREATE INDEX idx_suspension_history_status ON suspension_history(status);
CREATE INDEX idx_suspension_history_active ON suspension_history(user_id, status) WHERE status = 'active';

-- Create view for active suspensions (convenience)
CREATE OR REPLACE VIEW active_suspensions AS
SELECT 
  sh.id,
  sh.user_id,
  sh.reason,
  sh.suspended_at,
  sh.expires_at,
  sh.suspended_by,
  p.name as suspended_by_name,
  (sh.expires_at IS NULL OR sh.expires_at > now()) as is_permanent,
  (sh.expires_at > now()) as is_active_temp
FROM suspension_history sh
LEFT JOIN profiles p ON sh.suspended_by = p.id
WHERE sh.status = 'active' AND (sh.expires_at IS NULL OR sh.expires_at > now());

-- Grant permissions (if using row-level security)
-- Admin users should be able to see all data in these tables
-- Regular users can only see their own data (enforced via RLS policies)

-- RLS Policies for admin tables
ALTER TABLE admin_activity_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE disputes ENABLE ROW LEVEL SECURITY;
ALTER TABLE content_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE suspension_history ENABLE ROW LEVEL SECURITY;

-- Admin can see all activity logs (admin_id = user or admin = true)
CREATE POLICY "admins_can_view_activity_logs" ON admin_activity_logs
  FOR SELECT USING (
    auth.uid() IN (SELECT id FROM profiles WHERE admin_role IS NOT NULL)
  );

-- Admins can see all disputes
CREATE POLICY "admins_can_view_disputes" ON disputes
  FOR SELECT USING (
    auth.uid() IN (SELECT id FROM profiles WHERE admin_role IS NOT NULL)
  );

-- Users can see their own disputes
CREATE POLICY "users_can_view_own_disputes" ON disputes
  FOR SELECT USING (
    auth.uid() = initiator_id OR 
    auth.uid() IN (SELECT user_id FROM bookings WHERE id = booking_id)
  );

-- Admins can see all reports
CREATE POLICY "admins_can_view_reports" ON content_reports
  FOR SELECT USING (
    auth.uid() IN (SELECT id FROM profiles WHERE admin_role IS NOT NULL)
  );

-- Users can see their own reports
CREATE POLICY "users_can_view_own_reports" ON content_reports
  FOR SELECT USING (
    auth.uid() = reporter_id
  );

-- Admins can see all suspension history
CREATE POLICY "admins_can_view_suspensions" ON suspension_history
  FOR SELECT USING (
    auth.uid() IN (SELECT id FROM profiles WHERE admin_role IS NOT NULL)
  );

-- Users can see their own suspension history
CREATE POLICY "users_can_view_own_suspensions" ON suspension_history
  FOR SELECT USING (
    auth.uid() = user_id
  );

-- ==================
-- Helper Functions
-- ==================

-- Function to log admin activity
CREATE OR REPLACE FUNCTION log_admin_activity(
  p_admin_id UUID,
  p_action TEXT,
  p_target_type TEXT,
  p_target_id UUID,
  p_details JSONB DEFAULT NULL,
  p_notes TEXT DEFAULT NULL
) RETURNS UUID AS $$
DECLARE
  v_log_id UUID;
BEGIN
  INSERT INTO admin_activity_logs (admin_id, action, target_type, target_id, details, notes)
  VALUES (p_admin_id, p_action, p_target_type, p_target_id, p_details, p_notes)
  RETURNING id INTO v_log_id;
  
  RETURN v_log_id;
END;
$$ LANGUAGE plpgsql;

-- Function to suspend user
CREATE OR REPLACE FUNCTION suspend_user(
  p_user_id UUID,
  p_reason TEXT,
  p_suspended_by UUID,
  p_expires_at TIMESTAMP DEFAULT NULL
) RETURNS UUID AS $$
DECLARE
  v_record_id UUID;
BEGIN
  INSERT INTO suspension_history (user_id, reason, suspended_by, expires_at)
  VALUES (p_user_id, p_reason, p_suspended_by, p_expires_at)
  RETURNING id INTO v_record_id;
  
  -- Log activity
  PERFORM log_admin_activity(
    p_suspended_by,
    'user_suspended',
    'user',
    p_user_id,
    jsonb_build_object('reason', p_reason, 'expires_at', p_expires_at),
    NULL
  );
  
  RETURN v_record_id;
END;
$$ LANGUAGE plpgsql;

-- Function to lift suspension
CREATE OR REPLACE FUNCTION lift_suspension(
  p_user_id UUID,
  p_lifted_by UUID,
  p_notes TEXT DEFAULT NULL
) RETURNS VOID AS $$
BEGIN
  UPDATE suspension_history
  SET status = 'lifted', lifted_by = p_lifted_by, lifted_at = now()
  WHERE user_id = p_user_id AND status = 'active';
  
  -- Log activity
  PERFORM log_admin_activity(
    p_lifted_by,
    'user_unsuspended',
    'user',
    p_user_id,
    NULL,
    p_notes
  );
END;
$$ LANGUAGE plpgsql;

-- Function to check if user is suspended
CREATE OR REPLACE FUNCTION is_user_suspended(p_user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM active_suspensions WHERE user_id = p_user_id
  );
END;
$$ LANGUAGE plpgsql;

-- ==================
-- Comments
-- ==================
COMMENT ON TABLE admin_activity_logs IS 'Audit trail of all admin actions';
COMMENT ON TABLE disputes IS 'Disputes/refund requests from customers';
COMMENT ON TABLE content_reports IS 'Reports of inappropriate content from users';
COMMENT ON TABLE suspension_history IS 'History of user suspensions';
COMMENT ON FUNCTION log_admin_activity IS 'Logs an admin action to audit trail';
COMMENT ON FUNCTION suspend_user IS 'Suspends a user and logs the action';
COMMENT ON FUNCTION lift_suspension IS 'Lifts a user suspension';
COMMENT ON FUNCTION is_user_suspended IS 'Checks if user is currently suspended';
