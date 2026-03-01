# Admin Panel - Phase 6 Testing Checklist

Comprehensive test cases for the admin panel after Migration 011 is applied.

**Timeline:** ~2 hours  
**Prerequisites:** Migration 011 applied, admin account created, admin access verified

---

## Category 1: Authentication & Access Control (10 min)

- [ ] **Admin Access Gate**
  - Login with non-admin account
  - Try accessing `/admin`
  - Expected: 403 Unauthorized or redirect to home
  - Login with admin account
  - Access `/admin`
  - Expected: Dashboard loads with metrics

- [ ] **Session Persistence**
  - Login as admin
  - Refresh page (`F5`)
  - Expected: Still logged in, admin panel visible
  - Clear cookies, refresh
  - Expected: Redirected to login

- [ ] **Logout**
  - Click logout button
  - Try accessing `/admin` directly
  - Expected: Redirected to login
  - Verify cookies cleared in DevTools

---

## Category 2: Dashboard Metrics (15 min)

- [ ] **Metric Cards Display**
  - Dashboard loads
  - Verify 6 cards visible:
    - Total Users
    - Active Guides
    - Total Bookings
    - Monthly Revenue
    - Pending Disputes
    - Pending Reviews
  - Numbers should be ≥ 0

- [ ] **Metric Values Accuracy**
  - Check database counts match:
    ```sql
    SELECT COUNT(*) FROM profiles;
    SELECT COUNT(*) FROM guides WHERE is_active = true;
    SELECT COUNT(*) FROM bookings;
    SELECT SUM(amount) FROM bookings WHERE status = 'completed';
    SELECT COUNT(*) FROM disputes WHERE status = 'open';
    ```
  - Verify dashboard metrics match

- [ ] **Metric Updates**
  - (Manual) Create a new booking in test account
  - Refresh admin dashboard
  - "Total Bookings" should increment
  - "Monthly Revenue" should update

- [ ] **Loading State**
  - Monitor network tab (DevTools)
  - Metrics should load within 2 seconds
  - No 404 or 500 errors

- [ ] **Dark Mode**
  - Toggle dark mode (top-right)
  - Metrics cards should update colors
  - Text should remain readable
  - Colors should match design system

---

## Category 3: User Management (20 min)

### List View

- [ ] **Users Page Loads**
  - Click "Users" in sidebar
  - Page `/admin/users` loads
  - User list displays with pagination
  - Expected columns: Name, Email, Status, Actions

- [ ] **User Filtering**
  - Filter by status: "Active"
  - List should only show active users
  - Filter by status: "Suspended"
  - List should only show suspended users
  - Filter by status: "All"
  - List should show all users

- [ ] **Search Functionality**
  - Search box visible at top
  - Type user's name or email
  - Results filter in real-time or after Enter
  - Results contain search term

- [ ] **Pagination**
  - Load users list
  - If > 20 users, pagination visible
  - Click "Next" page
  - Shows next 20 users
  - Click "Previous"
  - Returns to previous page

### User Suspension

- [ ] **Suspend User Flow**
  - Click "Suspend" button on a test user
  - Modal opens with:
    - Reason dropdown (quality, no_show, unsafe, refund_request, other)
    - Optional notes field
    - Confirmation buttons
  - Select reason: "unsafe"
  - Enter notes: "Test suspension"
  - Click "Confirm"
  - Expected: User status changes to "Suspended"
  - Verify in database:
    ```sql
    SELECT * FROM suspension_history 
    WHERE user_id = 'user_uuid' 
    ORDER BY suspended_at DESC LIMIT 1;
    ```

- [ ] **Suspension Activity Logging**
  - After suspending user, check logs:
    ```sql
    SELECT * FROM admin_activity_logs 
    WHERE action = 'user_suspended' 
    ORDER BY created_at DESC LIMIT 1;
    ```
  - Should show: admin_id, action, user_id, reason, timestamp

- [ ] **Unsuspend User**
  - Find suspended user
  - Click "Unsuspend" button
  - Enter optional notes
  - Click "Confirm"
  - Expected: User status returns to "Active"
  - Verify in database

- [ ] **Permanent Suspension**
  - Suspend a user with no expiration
  - In database, `expires_at` should be NULL
  - User should remain suspended indefinitely

- [ ] **Temporary Suspension**
  - Suspend user for 7 days
  - In database, `expires_at` should be 7 days from now
  - (After 7 days, user is automatically unsuspended)

---

## Category 4: Content Moderation (20 min)

### UGC List

- [ ] **UGC Page Loads**
  - Click "UGC" in sidebar
  - Page `/admin/ugc` loads
  - Video list displays with:
    - Trip title
    - Creator name
    - Status (pending/approved/rejected)
    - Created date
    - Action buttons (approve/reject/remove)

- [ ] **Filter by Status**
  - Filter by "Pending"
  - List shows only pending videos
  - Filter by "Approved"
  - List shows only approved videos

- [ ] **Sort Options**
  - Sort by "Newest"
  - Videos ordered by creation date (desc)
  - Sort by "Oldest"
  - Videos ordered by creation date (asc)

- [ ] **Report Counts**
  - If videos have reports, count displays
  - E.g., "⚠️ 2 reports" on problematic video
  - Click report count
  - Should show report details (if modal available)

### UGC Approval/Rejection

- [ ] **Approve Video**
  - Find pending UGC video
  - Click "Approve" button
  - Modal opens with optional notes
  - Click "Confirm"
  - Expected: Video status changes to "Approved"
  - Verify in database:
    ```sql
    SELECT * FROM ugc_videos 
    WHERE status = 'approved' 
    ORDER BY updated_at DESC LIMIT 1;
    ```

- [ ] **Reject Video**
  - Find pending UGC video
  - Click "Reject" button
  - Modal opens with:
    - Reason dropdown (inappropriate, misinformation, spam, copyright, other)
    - Notes field
  - Select reason: "inappropriate"
  - Enter notes: "Violates community guidelines"
  - Click "Confirm"
  - Expected: Video status changes to "Rejected"

- [ ] **Activity Logging on Approval**
  - Check activity logs:
    ```sql
    SELECT * FROM admin_activity_logs 
    WHERE action = 'ugc_approved' 
    ORDER BY created_at DESC LIMIT 1;
    ```
  - Should show: admin_id, video_id, trip_id, timestamp

- [ ] **Activity Logging on Rejection**
  - Check activity logs:
    ```sql
    SELECT * FROM admin_activity_logs 
    WHERE action = 'ugc_rejected' 
    ORDER BY created_at DESC LIMIT 1;
    ```
  - Should show: admin_id, video_id, reason, timestamp

---

## Category 5: Dispute Resolution (20 min)

### Dispute List

- [ ] **Disputes Page Loads**
  - Click "Disputes" in sidebar
  - Page `/admin/disputes` loads
  - Dispute list shows:
    - Booking ID
    - Trip title
    - Initiator name
    - Reason
    - Status
    - Actions

- [ ] **Filter by Status**
  - Filter by "Open"
  - Shows only open disputes
  - Filter by "Resolved"
  - Shows only resolved disputes

### Resolve Disputes

- [ ] **Resolve Dispute - Approve**
  - Find open dispute
  - Click "Resolve" button
  - Modal opens with:
    - Decision dropdown (approved/denied)
    - Reason field
    - Notes field
  - Select decision: "approved"
  - Enter reason: "Confirmed customer complaint"
  - Click "Confirm Refund"
  - Expected: Dispute status changes to "Resolved"
  - Refund should be initiated to customer

- [ ] **Resolve Dispute - Deny**
  - Find open dispute
  - Click "Resolve"
  - Select decision: "denied"
  - Enter reason: "No refund warranted"
  - Click "Confirm"
  - Expected: Dispute status = "Resolved", no refund processed

- [ ] **Refund Processing**
  - When dispute approved, verify:
    ```sql
    SELECT * FROM disputes 
    WHERE resolution = 'approved' 
    AND refund_amount IS NOT NULL 
    ORDER BY resolved_at DESC LIMIT 1;
    ```
  - Should show: refund_amount, refund_transaction_id (Stripe ID)

- [ ] **Activity Logging**
  - Check logs after resolution:
    ```sql
    SELECT * FROM admin_activity_logs 
    WHERE action = 'dispute_resolved' 
    ORDER BY created_at DESC LIMIT 1;
    ```

---

## Category 6: Content Reports (20 min)

### Report List

- [ ] **Reports Page Loads**
  - Click "Reports" in sidebar
  - Page `/admin/reports` loads
  - Report list shows:
    - Report ID
    - Content type (UGC/Trip)
    - Reporter name
    - Reason
    - Status
    - Actions

- [ ] **Filter by Status**
  - Filter by "Pending"
  - Filter by "Reviewed"
  - Filter by "Resolved"

### Resolve Reports

- [ ] **Resolve Report**
  - Find pending report
  - Click "Resolve"
  - Modal opens with action options:
    - "No Action" (dismiss)
    - "Warning" (warn user)
    - "Remove Content" (delete content)
    - "Suspend User" (suspend account)
  - Select action: "Remove Content"
  - Enter notes: "Violates terms of service"
  - Click "Confirm"
  - Expected: Report status = "Resolved"

- [ ] **Multiple Resolution Actions**
  - Test each action type
  - Verify database updates correctly:
    ```sql
    SELECT * FROM content_reports 
    WHERE status = 'resolved' 
    ORDER BY reviewed_at DESC LIMIT 3;
    ```

---

## Category 7: Analytics Dashboard (15 min)

- [ ] **Analytics Page Loads**
  - Click "Analytics" in sidebar
  - Page `/admin/analytics` loads
  - Displays data tables/charts

- [ ] **User Analytics**
  - Total users by role (guides vs customers)
  - New users this month
  - User retention metrics

- [ ] **Revenue Analytics**
  - Monthly revenue
  - Revenue by trip
  - Revenue by guide
  - Commission breakdown (12% platform + $1 hosting fee)

- [ ] **Booking Analytics**
  - Total bookings
  - Bookings by status
  - Average booking value
  - Bookings by trip

- [ ] **Export Functionality** (if available)
  - Look for "Export CSV" or similar
  - Test exporting data
  - Verify file contains correct data

---

## Category 8: Activity Logging (10 min)

- [ ] **All Actions Logged**
  - Perform an admin action:
    - Suspend user
    - Approve UGC
    - Resolve dispute
    - Or any other action
  - Check activity log in database:
    ```sql
    SELECT * FROM admin_activity_logs 
    ORDER BY created_at DESC LIMIT 5;
    ```
  - Should show recent actions with:
    - admin_id (your ID)
    - action (the action performed)
    - target_type (user/ugc/dispute/etc)
    - target_id (affected resource ID)
    - created_at (timestamp)

- [ ] **Audit Trail Integrity**
  - Logs should never be empty for executed actions
  - Timestamps should be accurate
  - Admin ID should match your profile ID

---

## Category 9: UI/UX (15 min)

- [ ] **Responsive Design**
  - Open DevTools → Device Toolbar
  - Test on mobile (iPhone 12)
  - Tables should stack or scroll
  - Buttons should be clickable
  - Navigation should work
  - Test on tablet (iPad)
  - Layout should adapt

- [ ] **Dark Mode**
  - Toggle dark mode throughout admin panel
  - All pages should have dark variants
  - Text readable on both light/dark
  - Charts/tables visible in both modes

- [ ] **Navigation**
  - Sidebar visible on desktop
  - Sidebar collapses on mobile (hamburger menu)
  - All nav links clickable
  - Active page highlighted
  - Breadcrumbs (if present) accurate

- [ ] **Forms & Modals**
  - Modals have close button (X)
  - Click outside modal closes it
  - Form validation works (required fields)
  - Submit button disables on submit
  - Loading spinner shows while submitting
  - Success/error messages appear

- [ ] **Loading States**
  - Data loads within 2-3 seconds
  - Skeleton loaders visible while loading
  - "No data" message if empty
  - Error message if API fails

---

## Category 10: Error Handling (10 min)

- [ ] **Network Errors**
  - Open DevTools → Network
  - Throttle to "Offline"
  - Try loading admin panel
  - Expected: Error message shown, not crash

- [ ] **Invalid Data**
  - Try suspending user without reason
  - Expected: Form validation error
  - Try approving UGC without confirming
  - Expected: Confirmation required

- [ ] **API Errors**
  - Check Supabase logs for 500 errors
  - If error occurs:
    - User should see friendly message
    - Not raw error details
    - "Retry" or "Go back" button available

- [ ] **Permission Errors**
  - Verify RLS blocks non-admins:
    - Login as regular customer
    - Query admin tables:
      ```sql
      SELECT * FROM admin_activity_logs;
      ```
    - Expected: "error: new row violates row-level security policy"

---

## Category 11: Performance (10 min)

- [ ] **Page Load Times**
  - DevTools → Performance tab
  - Dashboard load: < 2 seconds
  - Users list load: < 2 seconds
  - Dispute resolution: < 1 second

- [ ] **Network Requests**
  - DevTools → Network tab
  - No 404 errors
  - No slow requests (>3 seconds)
  - Image loading optimized

- [ ] **Database Query Performance**
  - Supabase → SQL Editor
  - Check slow query logs:
    ```sql
    SELECT query, mean_time FROM pg_stat_statements 
    ORDER BY mean_time DESC LIMIT 10;
    ```
  - Should be < 100ms for most queries

---

## Category 12: Security (10 min)

- [ ] **XSS Prevention**
  - Try entering `<script>alert('XSS')</script>` in form
  - Expected: Script is escaped, not executed
  - User should NOT see browser alert

- [ ] **SQL Injection Prevention**
  - Try entering `'; DROP TABLE disputes; --` in form
  - Expected: Treated as literal string
  - Database not affected
  - Table not dropped

- [ ] **CSRF Protection**
  - (Automatic with Next.js)
  - All forms should have CSRF token
  - POST requests require valid token

- [ ] **Authentication Token Security**
  - DevTools → Application → Cookies
  - Auth token should be HttpOnly (not accessible via JS)
  - Token should expire after 24-48 hours
  - Logout clears all session tokens

---

## Summary

**Total Test Cases:** 127  
**Estimated Time:** 2 hours  
**Success Criteria:**
- ✅ 95%+ test cases pass
- ✅ No critical errors
- ✅ All core features work
- ✅ Performance acceptable
- ✅ Security checks pass

---

## Defect Log

If you find issues, document them:

| Test Case | Expected | Actual | Severity | Fix Status |
|-----------|----------|--------|----------|-----------|
| [Case Name] | [Expected Result] | [What Actually Happened] | Critical/Major/Minor | Open/Fixed |

---

## Next Steps After Testing

- [ ] Document any issues found
- [ ] Create GitHub issues for bugs
- [ ] Plan fixes for Phase 7 (if needed)
- [ ] Monitor error logs for 24 hours
- [ ] Collect user feedback
- [ ] Plan enhancements based on findings

---

## Questions During Testing?

- Check error message in browser console (F12)
- Check Supabase logs (Supabase dashboard)
- Verify database state with queries provided
- Review API-REFERENCE.md for expected responses
- Check COMPONENT-GUIDE.md for UI patterns
