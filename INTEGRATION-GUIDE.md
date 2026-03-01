# Integration Guide - Complete Setup Instructions

Complete guide for integrating all new features into Summit platform.

---

## 1. Webhook Integration (5 minutes)

### Setup

1. **Add webhook secret to environment:**
   ```bash
   # .env.local
   WEBHOOK_SECRET=your-secret-key-here
   ```

2. **Test webhook endpoint:**
   ```bash
   curl -X POST http://localhost:3000/api/webhooks \
     -H "Content-Type: application/json" \
     -H "X-Webhook-Signature: invalid" \
     -d '{"type":"test","data":{}}'
   # Should return 401 Unauthorized
   ```

3. **Generate webhook secret:**
   ```bash
   node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
   ```

### Testing Webhooks Locally

```bash
# 1. Start local server
npm run dev

# 2. In another terminal, expose to internet (optional)
ngrok http 3000

# 3. Configure webhook URL in dashboard
# https://your-ngrok-url.ngrok.io/api/webhooks

# 4. Send test webhook
curl -X POST http://localhost:3000/api/webhooks \
  -H "Content-Type: application/json" \
  -H "X-Webhook-Signature: $(node -e "console.log(require('crypto').createHmac('sha256', 'your-secret').update('{}').digest('hex'))")" \
  -d '{"id":"evt_test","type":"payment.succeeded","data":{"booking_id":"123"}}'
```

---

## 2. Email Integration (10 minutes)

### Setup with Resend

1. **Get API key:**
   - Sign up at https://resend.com
   - Create API key
   - Add to environment

   ```bash
   # .env.local
   RESEND_API_KEY=your-api-key-here
   ```

2. **Test email sending:**
   ```bash
   npm run dev
   ```

   Then in Node console:
   ```javascript
   import { sendEmail } from '@/lib/email';
   
   await sendEmail(
     'test@example.com',
     'booking-confirmation',
     {
       customer_name: 'John Doe',
       trip_name: 'Mountain Trek',
       trip_location: 'Colorado',
       trip_date: '2026-04-15',
       participant_count: '2',
       total_price: '450',
       dashboard_url: 'https://example.com/dashboard',
       guide_name: 'Alex',
       guide_rating: '4.8',
       guide_reviews: '42'
     }
   );
   ```

3. **Test in production:**
   - Update email addresses in webhook handlers
   - Send test bookings
   - Verify emails arrive in inbox

### Email Templates

All templates in `src/lib/email.ts`:

- `booking-confirmation` - Order confirmation
- `payment-receipt` - Payment details
- `guide-payout` - Guide earnings notification
- `review-reminder` - Post-trip review prompt
- `dispute-resolved` - Dispute resolution notice

**Variables available in each template:**
See `src/lib/email.ts` for complete variable lists.

---

## 3. Admin Utilities Integration (5 minutes)

### Usage

```typescript
import { 
  bulkSuspendUsers,
  getTopGuides,
  getRevenueBreakdown 
} from '@/lib/admin-utils';

// Bulk suspend users
const result = await bulkSuspendUsers(
  supabase,
  ['user-1', 'user-2', 'user-3'],
  'Terms of service violation',
  adminId,
  '2026-04-01' // optional expiration
);

// Get top guides
const topGuides = await getTopGuides(supabase, 10);

// Revenue analytics
const revenue = await getRevenueBreakdown(
  supabase,
  '2026-02-01',
  '2026-03-01'
);
```

### Integration Points

**In admin pages:**
```typescript
// src/app/admin/page.tsx
import { getRevenueBreakdown } from '@/lib/admin-utils';

const revenue = await getRevenueBreakdown(supabase, startDate, endDate);
```

**In API endpoints:**
```typescript
// src/app/api/admin/bulk-suspend/route.ts
import { bulkSuspendUsers } from '@/lib/admin-utils';

const result = await bulkSuspendUsers(
  supabase,
  userIds,
  reason,
  adminId
);
```

---

## 4. Test Data Seeding (5 minutes)

### Generate Test Data

```bash
# Run seed script
npx ts-node scripts/seed-test-data.ts
```

**Creates:**
- 5 test users (3 customers, 2 guides)
- 5 sample trips
- 10 bookings across all statuses
- 3 disputes (various resolutions)
- 5 reviews with ratings
- 5 UGC videos (pending, approved, rejected)
- 3 content reports

**Test credentials generated:**

```
Customers:
  customer1@test.local / Test123!
  customer2@test.local / Test123!
  customer3@test.local / Test123!

Guides:
  guide1@test.local / Test123!
  guide2@test.local / Test123!
```

### Use Test Data

1. Login with customer account
2. Browse admin panel with guide account
3. Create bookings/disputes/reviews as needed
4. Test admin functions

---

## 5. Running Tests (5 minutes)

### Automated Test Suite

```bash
# Run all admin panel tests
npx ts-node scripts/run-admin-tests.ts
```

**Tests cover:**
- Authentication & access control
- Dashboard metrics
- User management
- UGC moderation
- Dispute resolution
- Content reports
- Performance (< 2 seconds per endpoint)
- Error handling

**Expected output:**
```
✓ Admin access gate
✓ Admin dashboard loads
✓ Dashboard metrics are non-negative
✓ List users endpoint responds
...

📊 SUMMARY
  Total Tests: 24
  Passed: 24 ✓
  Failed: 0 ✗
  Pass Rate: 100%
```

### Manual Testing

Follow `ADMIN-PANEL-PHASE-6-TESTING.md` for comprehensive manual test cases.

---

## 6. Blog Publishing (10 minutes)

### Publishing Blog Posts

1. **Copy content from BLOG-POSTS.md**
   - Article 2-9 (full content)
   - Covers beginner guides, safety, training, etc.

2. **Add to your blog platform:**
   - Create new post
   - Copy title and content
   - Add featured image
   - Set publish date/time
   - Add tags and categories

3. **Internal linking:**
   ```markdown
   [Learn about equipment](https://summit.com/blog/gear-checklist)
   [Read safety guide](https://summit.com/blog/altitude-sickness)
   ```

4. **External linking:**
   - Link from `/help` page
   - Link from trip detail pages
   - Link from FAQ

### Blog Publishing Schedule

**Suggested timeline:**
- Week 1: Articles 2-3 (Getting Started, Gear Checklist)
- Week 2: Articles 4-5 (Training, Weather)
- Week 3: Articles 6-7 (Injury Prevention, Choosing Guides)
- Week 4: Articles 8-9 (Mental Benefits, Sustainability)

**SEO optimization:**
- Use target keywords in title
- Include keyword in first 100 words
- Add internal links (3-5 per post)
- Optimize images (alt text, compression)
- Set meta description (150-160 chars)

---

## 7. Performance Monitoring (5 minutes)

### Setup Monitoring

```typescript
// Track API performance
import { QueryMetricsCollector } from '@/lib/query-optimizer';

const metrics = new QueryMetricsCollector();

// In API endpoint:
const start = Date.now();
const result = await fetchData();
const duration = Date.now() - start;
metrics.record(duration, result.length, false);

console.log(metrics.getSummary());
// {
//   total_queries: 150,
//   avg_duration_ms: 45.2,
//   cache_hit_rate: "65.33%",
//   last_query: { ... }
// }
```

### Monitor in Production

1. **Vercel Analytics:**
   - Go to Vercel dashboard
   - Select project
   - View analytics
   - Monitor response times

2. **Supabase Monitoring:**
   - Go to Supabase console
   - Settings → Database
   - View query performance
   - Check slow query logs

3. **Set alerts:**
   - Email on slow requests (>500ms)
   - Alert on high error rate (>5%)
   - Notify on database connection issues

---

## 8. Integration Checklist

Before deploying to production:

### Pre-Deployment

- [ ] Environment variables configured (.env.local)
- [ ] WEBHOOK_SECRET generated and saved
- [ ] RESEND_API_KEY obtained and configured
- [ ] Migration 011 applied to Supabase
- [ ] Admin account created (admin_role = 'admin')
- [ ] Test data seeded
- [ ] All automated tests passing
- [ ] Manual test checklist completed

### Deployment

- [ ] Code committed to git
- [ ] CI/CD pipeline passes
- [ ] All tests passing in CI
- [ ] Production environment configured
- [ ] Database backups created
- [ ] Rollback plan documented

### Post-Deployment

- [ ] Monitor error logs (24 hours)
- [ ] Verify webhook delivery
- [ ] Test email sending
- [ ] Confirm admin panel works
- [ ] Check performance metrics
- [ ] Gather team feedback

---

## 9. Troubleshooting

### Webhook Not Triggering

**Check:**
1. Is webhook secret correct?
2. Is webhook URL accessible? (`curl -I https://yoururl/api/webhooks`)
3. Are headers correct in test request?
4. Check server logs for errors

**Fix:**
```bash
# Regenerate webhook secret
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# Test with new secret
curl -X POST https://yoururl/api/webhooks \
  -H "X-Webhook-Signature: $(node -e "...")" \
  -d '{...}'
```

### Emails Not Sending

**Check:**
1. Is RESEND_API_KEY set?
2. Is API key valid in Resend dashboard?
3. Check email address is correct
4. Check email logs in Resend

**Fix:**
```bash
# Test email directly
node -e "
const { sendEmail } = require('./src/lib/email');
sendEmail('test@example.com', 'booking-confirmation', {...})
"
```

### Tests Failing

**Check:**
1. Is admin account created?
2. Is auth token correct?
3. Are environment variables set?
4. Is database seeded?

**Fix:**
```bash
# Re-seed test data
npx ts-node scripts/seed-test-data.ts

# Re-run tests
npx ts-node scripts/run-admin-tests.ts
```

### Performance Issues

**Check:**
1. Database query performance (Supabase logs)
2. API response times (Vercel analytics)
3. Cache hit rates (monitoring dashboard)

**Fix:**
```bash
# Add indexes
# See DATABASE-OPTIMIZATION.md

# Clear cache
# Redeploy to Vercel
```

---

## 10. Support Resources

- **Webhook Guide:** `WEBHOOK-GUIDE.md`
- **Database Optimization:** `DATABASE-OPTIMIZATION.md`
- **Blog Content:** `BLOG-POSTS.md`
- **Testing:** `ADMIN-PANEL-PHASE-6-TESTING.md`
- **API Reference:** `API-REFERENCE.md`

---

## Quick Links

| Task | File | Time |
|------|------|------|
| Setup Webhooks | `/api/webhooks/route.ts` | 5 min |
| Setup Email | `src/lib/email.ts` | 10 min |
| Seed Test Data | `scripts/seed-test-data.ts` | 5 min |
| Run Tests | `scripts/run-admin-tests.ts` | 5 min |
| Publish Blog | `BLOG-POSTS.md` | 10 min |
| **Total Integration Time** | | **35 min** |

---

**Status: All integrations ready for deployment**

Questions? Check the relevant guide file or contact dev@summit.local
