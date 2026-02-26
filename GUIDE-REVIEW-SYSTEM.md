# Guide Review System - Complete Documentation

## Overview

The Guide Review System allows guides to leave private feedback about customers after trips are completed. These reviews are:
- **Private to the guide** - Only the guide can see reviews they wrote
- **Hidden from customers** - Customers have no access to these reviews
- **Tracked automatically** - Customer avg ratings are calculated from all guide reviews

## Feature Architecture

### Database Tables

#### `guide_reviews_of_customers`
Stores guide feedback about customers.

```sql
Fields:
- id: UUID (primary key)
- booking_id: UUID (unique, references bookings)
- guide_id: UUID (references guides)
- customer_id: UUID (references profiles)
- trip_id: UUID (references trips)
- rating: INT (1-5 stars)
- comment: TEXT (optional feedback)
- behavior_notes: TEXT (optional observations)
- professionalism_rating: INT (1-5 stars)
- created_at: TIMESTAMPTZ
- updated_at: TIMESTAMPTZ
```

#### Row-Level Security (RLS)
- **SELECT:** Only the guide who wrote the review can view it
- **INSERT:** Only the guide of the trip can create a review, and only for completed bookings
- **UPDATE:** Only the guide who wrote the review can edit it
- **DELETE:** Not allowed (maintains review history)

### API Endpoints

#### 1. Submit/Update Review
**POST** `/api/guide-reviews/submit`

Request:
```json
{
  "bookingId": "uuid",
  "rating": 4,
  "comment": "Great customer, very cooperative",
  "behaviorNotes": "Professional demeanor, good fitness level",
  "professionalismRating": 5
}
```

Response:
```json
{
  "success": true,
  "message": "Review created successfully",
  "review": { /* review object */ }
}
```

Validation:
- User must be authenticated
- User must be a guide
- Booking must exist
- Guide must own the trip
- Booking status must be 'completed'
- If review exists for booking, it updates; otherwise creates new

#### 2. List Guide's Reviews
**GET** `/api/guide-reviews/list?limit=50&offset=0`

Response:
```json
{
  "reviews": [
    {
      "id": "uuid",
      "rating": 4,
      "comment": "...",
      "behavior_notes": "...",
      "professionalism_rating": 5,
      "created_at": "2026-02-26T...",
      "profiles": {
        "full_name": "Customer Name",
        "email": "customer@example.com"
      },
      "bookings": {
        "trip": {
          "title": "Mt. Rainier Climb"
        }
      }
    }
  ],
  "total": 1,
  "limit": 50,
  "offset": 0
}
```

#### 3. Get Booking for Review
**GET** `/api/guide-reviews/booking/[bookingId]`

Response:
```json
{
  "booking": {
    "id": "uuid",
    "status": "completed",
    "profiles": { "full_name": "...", "email": "..." },
    "trips": { "title": "..." },
    "participant_count": 2,
    "total_price": 500
  },
  "existingReview": null | { /* review data */ },
  "canReview": true
}
```

### Components

#### GuideReviewCustomerModal
Modal dialog for guides to submit/edit customer reviews.

Location: `src/components/GuideReviewCustomerModal.tsx`

Props:
```typescript
interface Props {
  bookingId: string;           // Which booking to review
  isOpen: boolean;             // Modal visibility
  onClose: () => void;         // Close callback
  onSuccess: () => void;       // Success callback (refresh data)
}
```

Features:
- Star ratings (1-5) for overall quality
- Star ratings (1-5) for professionalism/conduct
- Text fields for behavior notes and comments
- Create new or edit existing reviews
- Customer info display
- Form validation

### Pages

#### /dashboard/bookings
**For:** Guides

**Changes:**
- Completed bookings now show two action buttons:
  1. "📝 Review Customer" - Opens review modal
  2. "⭐ Your Review" - Links to customer review (what guide wrote about trip)

#### /dashboard/guide-reviews
**For:** Guides only

**Purpose:** View all customer reviews given

**Features:**
- Stats: Total reviews, average rating, average professionalism
- List of all reviews given
- Expandable review details
- Search/filter capability (future enhancement)

**Access Control:**
- Non-guides redirected with error message
- RLS enforces database-level access control

## User Journey

### For Guides

1. Complete a trip and mark as 'completed' in `/dashboard/bookings`
2. See two buttons for completed bookings:
   - Click "📝 Review Customer" to review the customer
   - Click "⭐ Your Review" to review the trip (existing feature)
3. Review Customer modal opens showing:
   - Customer name, email
   - Trip title and details
   - Star rating fields (1-5)
   - Comment and behavior notes fields
4. Fill out the form and submit
5. View all reviews given in `/dashboard/guide-reviews`

### For Customers

- **No change** - Customers cannot see these reviews
- Customer ratings update based on guide reviews (backend aggregation)
- No UI access to guide review pages

## Implementation Details

### Security

#### Database-Level (RLS Policies)
```sql
-- Only guides can see reviews they wrote
SELECT: auth.uid() IN (SELECT user_id FROM guides WHERE id = guide_id)

-- Only guides can create reviews
INSERT: auth.uid() IN (SELECT user_id FROM guides WHERE id = guide_id)
        AND booking.status = 'completed'

-- Only guides can update their own reviews
UPDATE: auth.uid() IN (SELECT user_id FROM guides WHERE id = guide_id)
```

#### API-Level
- Check `auth.uid()` matches guide user_id
- Verify guide owns the trip
- Verify booking is completed
- Only allow one review per booking

### Auto-Updates
Trigger `update_customer_guide_rating()` updates:
- `profiles.avg_guide_rating` - Average rating from all guides
- `profiles.guide_review_count` - Total reviews received from guides

Calculates after INSERT or UPDATE:
```sql
UPDATE profiles SET
  avg_guide_rating = AVG(rating) FROM guide_reviews_of_customers,
  guide_review_count = COUNT(*) FROM guide_reviews_of_customers
WHERE customer_id matches
```

## Database Migration

### Apply Migration
The migration file is at: `supabase/migrations/008_add_guide_reviews_of_customers.sql`

**Via Supabase Dashboard:**
1. Go to SQL Editor
2. New query
3. Copy/paste migration file
4. Run

**Via Supabase CLI:**
```bash
supabase db push
```

**Via apply script:**
```bash
./apply-migration-008.sh
```

### Rollback
To undo the migration:
```sql
DROP TABLE IF EXISTS guide_reviews_of_customers CASCADE;
ALTER TABLE profiles DROP COLUMN IF EXISTS avg_guide_rating;
ALTER TABLE profiles DROP COLUMN IF EXISTS guide_review_count;
DROP TRIGGER IF EXISTS trigger_update_customer_guide_rating ON guide_reviews_of_customers;
DROP FUNCTION IF EXISTS update_customer_guide_rating();
```

## Testing

### Test Cases

#### 1. Create Review
- [ ] Guide can view completed booking
- [ ] "Review Customer" button appears for completed bookings
- [ ] Modal opens with customer details
- [ ] Can submit form with ratings and comments
- [ ] Review appears in /dashboard/guide-reviews

#### 2. Edit Review
- [ ] Existing review loads in modal
- [ ] Can update ratings and comments
- [ ] Changes save correctly
- [ ] Old review is replaced (not duplicated)

#### 3. Access Control
- [ ] Non-guides cannot access /dashboard/guide-reviews
- [ ] Non-guides cannot call API endpoints
- [ ] Guides can only review their own trips
- [ ] Reviews only visible to guide who wrote them

#### 4. Data Integrity
- [ ] Cannot review non-completed bookings
- [ ] Cannot review trips from other guides
- [ ] Ratings are validated (1-5)
- [ ] Customer ratings auto-update

### Test Accounts
```
Guide: alex.mountain@example.com / DemoPassword123!
Customer: jane.traveler@example.com / DemoPassword123!
```

### Test Flow
1. Sign in as guide
2. Go to /dashboard/bookings
3. Mark a booking as 'completed' (if not already)
4. Click "Review Customer" button
5. Fill form and submit
6. Go to /dashboard/guide-reviews
7. Verify review appears with all details

## Future Enhancements

1. **Search/Filter** - Find reviews by customer name, rating, date
2. **Export** - Download reviews as CSV
3. **Templates** - Suggested review templates
4. **Customer Feedback** - Guides can see their own review count/rating
5. **Performance Metrics** - Analytics on customer ratings over time
6. **Behavior Reports** - Flag customers with consistent issues
7. **Soft Blocking** - Guides can optionally decline future bookings from customers with low ratings

## Troubleshooting

### Issue: "Only guides can access this" error
**Solution:** User must be signed in as a guide account (have a guide profile)

### Issue: "Can only review completed trips" error
**Solution:** Booking status must be 'completed' before review can be submitted

### Issue: Review form doesn't load
**Solution:** 
- Check browser console for errors
- Verify booking ID is valid
- Ensure guide owns the trip

### Issue: Customer doesn't see reviews
**Solution:** This is correct behavior - reviews are hidden from customers

## Code Organization

```
src/
├── app/
│   ├── api/guide-reviews/
│   │   ├── submit/route.ts           # POST review
│   │   ├── list/route.ts             # GET reviews
│   │   └── booking/[bookingId]/route.ts # GET booking
│   └── dashboard/
│       ├── bookings/page.tsx         # Updated with review button
│       ├── guide-reviews/page.tsx    # Review history
│       └── page.tsx                  # Updated quick link
└── components/
    └── GuideReviewCustomerModal.tsx  # Review form modal

supabase/
└── migrations/
    └── 008_add_guide_reviews_of_customers.sql
```

## Deployment Checklist

- [ ] Migration applied to production database
- [ ] API endpoints tested with real data
- [ ] Modal component renders correctly
- [ ] Review dashboard displays data
- [ ] RLS policies active and working
- [ ] No customer access to guide-reviews pages
- [ ] Auto-rating calculation verified
- [ ] All TypeScript types checking
- [ ] Mobile responsive on all pages
- [ ] Accessibility (contrast, labels) compliant

## Version History

- **v1.0.0** - 2026-02-26 Initial release
  - Core review creation/editing
  - Dashboard view
  - RLS policies
  - Auto-rating updates

