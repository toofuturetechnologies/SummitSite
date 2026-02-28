# Initiative 4: Admin & Moderation Panel - Execution Plan

**Effort**: 16-20 hours  
**Priority**: HIGH (needed for platform control)  
**Timeline**: Est. 2026-02-28 through 2026-03-01  
**Status**: 🚀 STARTING NOW

---

## Overview

Build a complete admin dashboard with moderation capabilities, user management, dispute resolution, and analytics. This is critical for scaling the platform safely.

---

## Phase 1: Database Schema (1-2 hours)

### Migration 011: Add Admin Roles & Activity Logging

```sql
-- 1. Add admin_role column to profiles
ALTER TABLE profiles 
ADD COLUMN admin_role TEXT DEFAULT NULL,
ADD COLUMN admin_since TIMESTAMP DEFAULT NULL;

-- Roles: NULL (user), 'moderator' (content only), 'admin' (full), 'super_admin' (system)

-- 2. Create admin_activity_logs table
CREATE TABLE admin_activity_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_id UUID NOT NULL REFERENCES profiles(id),
  action TEXT NOT NULL, -- 'user_suspended', 'content_rejected', 'dispute_resolved', etc.
  target_type TEXT NOT NULL, -- 'user', 'ugc', 'trip', 'dispute'
  target_id UUID NOT NULL,
  details JSONB DEFAULT NULL,
  notes TEXT DEFAULT NULL,
  created_at TIMESTAMP DEFAULT now()
);

-- 3. Create disputes table (for refund/quality disputes)
CREATE TABLE disputes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id UUID UNIQUE REFERENCES bookings(id),
  initiator_id UUID NOT NULL REFERENCES profiles(id), -- who opened dispute
  reason TEXT NOT NULL, -- 'quality', 'no_show', 'unsafe', 'refund_request'
  description TEXT NOT NULL,
  status TEXT DEFAULT 'open', -- 'open', 'in_review', 'resolved', 'closed'
  resolution TEXT DEFAULT NULL, -- 'approved', 'denied'
  admin_id UUID REFERENCES profiles(id), -- who handled it
  admin_notes TEXT DEFAULT NULL,
  refund_amount DECIMAL DEFAULT NULL,
  created_at TIMESTAMP DEFAULT now(),
  resolved_at TIMESTAMP DEFAULT NULL
);

-- 4. Create content_reports table (users can flag inappropriate content)
CREATE TABLE content_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ugc_id UUID REFERENCES ugc_videos(id),
  trip_id UUID REFERENCES trips(id),
  reporter_id UUID NOT NULL REFERENCES profiles(id),
  reason TEXT NOT NULL, -- 'inappropriate', 'misinformation', 'spam', 'copyright'
  description TEXT NOT NULL,
  status TEXT DEFAULT 'pending', -- 'pending', 'reviewed', 'resolved'
  action_taken TEXT DEFAULT NULL, -- 'none', 'warning', 'removed', 'suspended'
  moderator_id UUID REFERENCES profiles(id),
  moderator_notes TEXT DEFAULT NULL,
  created_at TIMESTAMP DEFAULT now(),
  reviewed_at TIMESTAMP DEFAULT NULL
);

-- 5. Create suspension_history table
CREATE TABLE suspension_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id),
  reason TEXT NOT NULL,
  suspended_by UUID NOT NULL REFERENCES profiles(id),
  suspended_at TIMESTAMP DEFAULT now(),
  expires_at TIMESTAMP DEFAULT NULL, -- NULL = permanent
  status TEXT DEFAULT 'active', -- 'active', 'appealed', 'lifted'
  appeal_notes TEXT DEFAULT NULL
);

-- Create indexes for performance
CREATE INDEX idx_admin_activity_admin_id ON admin_activity_logs(admin_id);
CREATE INDEX idx_admin_activity_target ON admin_activity_logs(target_type, target_id);
CREATE INDEX idx_disputes_status ON disputes(status);
CREATE INDEX idx_reports_status ON content_reports(status);
CREATE INDEX idx_suspension_user_id ON suspension_history(user_id);
```

---

## Phase 2: API Endpoints (6-8 hours)

### Admin Auth Endpoints

**POST `/api/admin/check`**
```typescript
// Check if user is admin, return admin role
Response: { isAdmin: true, role: 'admin' }
```

### User Management Endpoints

**GET `/api/admin/users`**
```typescript
// Query params: ?page=1&limit=50&search=&role=&status=
Response: {
  users: [{
    id, name, email, profile_type, tier, rating,
    created_at, suspended, suspension_reason
  }],
  total, page, totalPages
}
```

**GET `/api/admin/users/[id]`**
```typescript
// Get full user details
Response: {
  id, name, email, bio, profile_type,
  reviews_given, reviews_received,
  total_earnings, trips_created,
  suspension_status, admin_notes
}
```

**POST `/api/admin/users/[id]/suspend`**
```typescript
// Body: { reason, expiresAt (optional for temp), notes }
// Sets suspension_history record
```

**POST `/api/admin/users/[id]/unsuspend`**
```typescript
// Lifts suspension
```

### Content Moderation Endpoints

**GET `/api/admin/ugc`**
```typescript
// Query: ?page=1&status=pending&sort=created_at
Response: {
  videos: [{
    id, trip_id, creator_name, tiktok_url, video_status,
    created_at, reports_count, pending_approval
  }],
  total, pending_count, reported_count
}
```

**GET `/api/admin/ugc/[id]`**
```typescript
// Full video details + reports
Response: {
  id, trip_id, creator_id, tiktok_url, video_status,
  reports: [{ id, reason, status, reporter_name }],
  admin_notes
}
```

**POST `/api/admin/ugc/[id]/approve`**
```typescript
// Approve video for publication
Response: { success: true, video_status: 'published' }
```

**POST `/api/admin/ugc/[id]/reject`**
```typescript
// Body: { reason, notes }
// Rejects video and notifies creator
```

**POST `/api/admin/ugc/[id]/remove`**
```typescript
// Body: { reason, notes }
// Removes published video
```

### Content Report Endpoints

**GET `/api/admin/reports`**
```typescript
// Query: ?status=pending&type=ugc&sort=created_at
Response: {
  reports: [{
    id, content_type, reason, reporter_name, status,
    created_at, pending_review
  }],
  total, pending_count
}
```

**POST `/api/admin/reports/[id]/resolve`**
```typescript
// Body: { action, notes }
// Actions: 'none', 'warning', 'remove_content', 'suspend_user'
```

### Dispute Resolution Endpoints

**GET `/api/admin/disputes`**
```typescript
// Query: ?status=open&sort=created_at
Response: {
  disputes: [{
    id, booking_id, initiator_name, reason, status,
    created_at, amount
  }],
  total, open_count
}
```

**GET `/api/admin/disputes/[id]`**
```typescript
// Full dispute details
Response: {
  id, booking_id, initiator, guide, reason,
  description, status, refund_amount,
  booking_details, messages
}
```

**POST `/api/admin/disputes/[id]/resolve`**
```typescript
// Body: { resolution: 'approved'|'denied', refund_amount, notes }
// Creates refund if approved
```

### Analytics Endpoints

**GET `/api/admin/analytics/dashboard`**
```typescript
// High-level metrics
Response: {
  total_users, active_guides, total_bookings,
  monthly_revenue, pending_disputes,
  platform_health_score
}
```

**GET `/api/admin/analytics/revenue`**
```typescript
// Query: ?period=month
Response: {
  revenue_chart: [{ date, total, commissions, refunds }],
  breakdown: { guides, creators, platform },
  top_guides: [{ name, earnings }]
}
```

### Activity Logging

Every admin action logs to `admin_activity_logs`:
- User suspended/unsuspended
- Content approved/rejected/removed
- Dispute resolved
- Content report resolved

---

## Phase 3: Frontend Pages (6-8 hours)

### Layout: `/app/admin/layout.tsx`
- Sidebar navigation
- Admin-only route guard
- Breadcrumbs
- Admin user profile

### Pages

**1. `/app/admin` - Dashboard**
- Key metrics cards (users, bookings, revenue, disputes)
- Recent activity feed
- Quick actions (pending approvals, open disputes)
- Health alerts (if any)

**2. `/app/admin/users` - User Management**
- User list table with search/filter
- Columns: name, email, role, earnings, status, joined
- Actions: view details, suspend, view earnings history
- Bulk actions: suspend multiple, export list

**3. `/app/admin/users/[id]` - User Details**
- Profile info
- Activity history (trips created, earnings, reviews)
- Suspension history
- Admin notes
- Quick actions: suspend, ban, reset password

**4. `/app/admin/ugc` - Content Moderation**
- Video grid/list with filters
- Status: pending, published, rejected, removed
- Quick preview
- Actions: approve, reject, remove
- Bulk actions: approve all, reject all

**5. `/app/admin/ugc/[id]` - UGC Details**
- Video preview (TikTok embed)
- Creator info
- Trip details
- Reports on this video
- Approval/rejection form
- Admin notes

**6. `/app/admin/reports` - Content Reports**
- Report list (pending, resolved)
- Columns: type, reason, reporter, status, date
- Filter by type (ugc, trip, user)
- Quick resolve modal

**7. `/app/admin/disputes` - Dispute Resolution**
- Open/closed disputes
- Columns: booking, initiator, reason, amount, status
- Quick details modal
- Resolution form (approve/deny refund)

**8. `/app/admin/analytics` - Analytics**
- Revenue chart (monthly trend)
- User growth chart
- Booking trends
- Top guides/creators
- Payment summary
- Refund analysis

---

## Phase 4: Components (4-6 hours)

### Reusable Components

**AdminLayout**
- Sidebar with nav
- Header with admin user profile
- Route protection

**DataTable**
- Sortable, filterable table
- Pagination
- Bulk actions
- Status badges

**StatsCard**
- Shows metric with trend
- Used on dashboard

**ApprovalModal**
- Shows content for approval
- Approve/reject buttons
- Notes field
- Preview before decision

**DisputeResolutionModal**
- Dispute details
- Refund amount field
- Resolution selector (approve/deny)
- Notes
- Submit button

**ActivityLog**
- Shows recent admin actions
- Filterable by action type
- Shows who did what, when

---

## Phase 5: Authentication & Authorization (2-3 hours)

### Admin Role Check

Create middleware that:
1. Checks user has admin role in database
2. Verifies admin role level (moderator vs admin vs super_admin)
3. Logs all admin actions with timestamp and user ID

```typescript
// app/api/middleware/admin-auth.ts
export function requireAdmin(minRole: 'moderator' | 'admin' | 'super_admin') {
  return async (request: NextRequest) => {
    const user = await getUser(request);
    const adminRole = await getAdminRole(user.id);
    
    if (!adminRole || !hasPermission(adminRole, minRole)) {
      throw new ApiError('Unauthorized', 403, 'ADMIN_ONLY');
    }
    
    return user;
  };
}
```

### Role Levels

- **moderator**: Can approve/reject content, view reports
- **admin**: Can suspend users, resolve disputes, manage content
- **super_admin**: Can promote admins, view activity logs, system settings

---

## Phase 6: Testing (2-3 hours)

### Test Cases

1. **Admin Auth**
   - ✅ Non-admin cannot access /admin
   - ✅ Admin can access /admin
   - ✅ Correct role shows correct features

2. **User Management**
   - ✅ List users with pagination
   - ✅ Search users by name/email
   - ✅ Suspend user
   - ✅ Unsuspend user
   - ✅ View user details

3. **Content Moderation**
   - ✅ List pending UGC
   - ✅ Approve UGC video
   - ✅ Reject UGC with reason
   - ✅ Remove published video
   - ✅ View creator details

4. **Disputes**
   - ✅ Create dispute (user-facing, not admin)
   - ✅ List open disputes
   - ✅ Resolve dispute (approve refund)
   - ✅ Resolve dispute (deny refund)

5. **Reports**
   - ✅ Create report (user-facing)
   - ✅ List pending reports
   - ✅ Resolve report

6. **Analytics**
   - ✅ Dashboard metrics load
   - ✅ Revenue chart shows correct data
   - ✅ User growth chart accurate

---

## Implementation Checklist

### Week 1: Core Admin Infrastructure
- [ ] Create database migration (Migration 011)
- [ ] Deploy migration to Supabase
- [ ] Create API endpoints for admin auth
- [ ] Test admin role checking

### Week 1: User Management
- [ ] Build `/api/admin/users` endpoints
- [ ] Create `/app/admin/users` page
- [ ] Create `/app/admin/users/[id]` details page
- [ ] Add suspend/unsuspend functionality
- [ ] Test user management features

### Week 1: Content Moderation
- [ ] Build `/api/admin/ugc` endpoints
- [ ] Create `/app/admin/ugc` moderation page
- [ ] Create `/app/admin/ugc/[id]` details
- [ ] Add approve/reject functionality
- [ ] Test moderation workflow

### Week 2: Disputes & Reports
- [ ] Build `/api/admin/reports` endpoints
- [ ] Build `/api/admin/disputes` endpoints
- [ ] Create `/app/admin/disputes` page
- [ ] Create dispute resolution form
- [ ] Test dispute handling

### Week 2: Dashboard & Analytics
- [ ] Create `/app/admin` dashboard
- [ ] Build analytics endpoints
- [ ] Create charts and metrics
- [ ] Add activity logging
- [ ] Test analytics data

### Week 2: Polish & Deploy
- [ ] Comprehensive testing (all features)
- [ ] Performance optimization
- [ ] Security audit (admin-only routes)
- [ ] Error handling
- [ ] Deploy to production

---

## Success Criteria

- [ ] All admin routes protected (non-admin cannot access)
- [ ] User management fully functional (list, suspend, view history)
- [ ] Content moderation working (approve, reject, remove)
- [ ] Dispute resolution complete (can approve/deny refunds)
- [ ] Analytics dashboard accurate and performant
- [ ] All admin actions logged to audit trail
- [ ] No sensitive data leaks in responses
- [ ] Admin UI intuitive and fast (<1s load)
- [ ] Test coverage >80% for critical paths

---

## Risks & Mitigations

| Risk | Impact | Mitigation |
|------|--------|-----------|
| Admin abuse | High | Activity logging, role restrictions, approval workflows |
| Data leaks | Critical | Only show allowed data, sanitize outputs |
| Performance | Medium | Pagination, indexing, caching |
| Complexity | High | Start simple, add features incrementally |

---

## Files to Create

```
NEW ENDPOINTS:
- src/app/api/admin/check/route.ts
- src/app/api/admin/users/route.ts
- src/app/api/admin/users/[id]/route.ts
- src/app/api/admin/users/[id]/suspend/route.ts
- src/app/api/admin/ugc/route.ts
- src/app/api/admin/ugc/[id]/route.ts
- src/app/api/admin/ugc/[id]/approve/route.ts
- src/app/api/admin/ugc/[id]/reject/route.ts
- src/app/api/admin/disputes/route.ts
- src/app/api/admin/disputes/[id]/route.ts
- src/app/api/admin/disputes/[id]/resolve/route.ts
- src/app/api/admin/reports/route.ts
- src/app/api/admin/reports/[id]/resolve/route.ts
- src/app/api/admin/analytics/dashboard/route.ts
- src/app/api/admin/analytics/revenue/route.ts

NEW PAGES:
- app/admin/layout.tsx
- app/admin/page.tsx (dashboard)
- app/admin/users/page.tsx
- app/admin/users/[id]/page.tsx
- app/admin/ugc/page.tsx
- app/admin/ugc/[id]/page.tsx
- app/admin/disputes/page.tsx
- app/admin/reports/page.tsx
- app/admin/analytics/page.tsx

NEW COMPONENTS:
- components/admin/AdminLayout.tsx
- components/admin/DataTable.tsx
- components/admin/StatsCard.tsx
- components/admin/ApprovalModal.tsx
- components/admin/DisputeResolutionModal.tsx
- components/admin/ActivityLog.tsx
- components/admin/Charts.tsx

NEW UTILITIES:
- lib/admin-auth.ts (middleware)
- lib/admin-logger.ts (activity logging)
```

---

## Time Breakdown

| Phase | Task | Hours |
|-------|------|-------|
| 1 | Database schema & migration | 1-2 |
| 2 | API endpoints (15 endpoints) | 6-8 |
| 3 | Frontend pages (8 pages) | 6-8 |
| 4 | Reusable components | 4-6 |
| 5 | Auth & authorization | 2-3 |
| 6 | Testing & deployment | 2-3 |
| **TOTAL** | | **16-20 hours** |

---

## Next Steps

1. ✅ Create database migration
2. ✅ Start with Dashboard page
3. ✅ Build API endpoints incrementally
4. ✅ Test each feature before moving to next
5. ✅ Deploy when dashboard + user management working
6. ✅ Add moderation features
7. ✅ Add analytics last

Ready to execute! 🚀
