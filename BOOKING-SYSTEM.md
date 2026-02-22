# Summit Platform - Booking System

## Overview

The complete booking system allows customers to browse trips, select dates, and book with guides. Guides manage their availability and bookings through a dashboard.

## User Flows

### Customer Booking Flow
1. Browse trips on `/trips` page
2. Click "View Details" to see trip details on `/trips/[id]`
3. Select a date from available dates
4. Choose number of participants
5. Click "Book Now"
6. Redirected to confirmation page at `/bookings/confirmed`

### Guide Workflow
1. Create trips on dashboard
2. Set availability dates for each trip
3. Manage incoming bookings
4. Confirm/decline/complete bookings
5. Track payouts

## Features Implemented

### Customer-Facing

#### Trip List Page (`/trips`)
- Shows all active trips
- Grid layout with trip cards
- Quick info: title, price, duration, guide name
- "View Details" button links to trip detail page

#### Trip Detail Page (`/trips/[id]`)
- Full trip information
  - Description
  - Highlights
  - Day-by-day itinerary
  - What's included/excluded
  - Guide info with rating
- Available dates dropdown
- Participant count selector (+/- buttons)
- Price breakdown
- Book Now button
- Instant book indicator
- Redirects to confirmation on booking

#### Booking Confirmation Page (`/bookings/confirmed`)
- Success message
- Next steps
- Browse more trips button
- Return to home button

### Guide-Facing

#### Trip Availability Manager (`/dashboard/trip/[id]/dates`)
- Add availability dates with:
  - Start and end dates
  - Number of spots
  - Optional special pricing
- View all dates for trip
- Delete dates
- Auto-updates spot availability as bookings come in

#### Booking Management Dashboard (`/dashboard/bookings`)
- Filter by status: All, Pending, Confirmed, Completed, Cancelled
- View all bookings for guide's trips
- Booking card shows:
  - Trip title
  - Date range
  - Participant count
  - Guide payout amount
  - Current status
- Quick stats: Pending, Confirmed, Completed, Total Payout
- Actions for pending bookings: Confirm or Decline
- Actions for confirmed: Mark as Completed

### Dashboard Integration
- Added "Bookings" button in main dashboard header
- Dashboard shows "Manage Dates" button for each trip

## Database Schema

### Bookings Table
```
id (UUID)
trip_id (UUID) - Foreign key to trips
trip_date_id (UUID) - Foreign key to trip_dates
user_id (UUID) - Customer's user ID
guide_id (UUID) - Guide's user ID
participant_count (INTEGER) - How many people
total_price (DECIMAL) - Total booking price
commission_amount (DECIMAL) - 12% commission to platform
guide_payout (DECIMAL) - 88% goes to guide
status (ENUM) - pending | confirmed | completed | cancelled
created_at (TIMESTAMP)
updated_at (TIMESTAMP)
```

### Trip Dates Table
```
id (UUID)
trip_id (UUID) - Which trip
start_date (DATE)
end_date (DATE)
spots_total (INTEGER) - Total capacity
spots_available (INTEGER) - Remaining spots
price_override (DECIMAL, optional) - Override base price
is_available (BOOLEAN) - Whether date is open
```

## Booking Status Flow

```
Customer Books
    ↓
Status: pending (awaiting guide confirmation)
    ↓
Guide Confirms → Status: confirmed
        OR
Guide Declines → Status: cancelled
    ↓
Trip Happens → Guide marks completed
    ↓
Status: completed (eligible for reviews)
```

**Instant Book Mode**: If `trips.is_instant_book = true`, status goes directly to `confirmed`

## Payment System (Framework)

### Current Implementation
- Booking stores prices:
  - `total_price`: Full booking amount
  - `commission_amount`: 12% platform fee
  - `guide_payout`: 88% to guide (total_price × 0.88)

### Future: Stripe Integration Needed
- Collect payment before confirmation
- Transfer payout to guide's Stripe account
- Handle refunds on cancellation
- Track payment status separately from booking status

## API / Database Queries

### Create Booking
```js
const { error } = await supabase
  .from('bookings')
  .insert({
    trip_id: tripId,
    trip_date_id: dateId,
    user_id: currentUserId,
    guide_id: guideId,
    participant_count: count,
    total_price: price * count,
    commission_amount: (price * count) * 0.12,
    guide_payout: (price * count) * 0.88,
    status: 'pending', // or 'confirmed' if instant book
  });
```

### Update Booking Status
```js
const { error } = await supabase
  .from('bookings')
  .update({ status: 'confirmed' })
  .eq('id', bookingId);
```

### Fetch Guide's Bookings
```js
const { data } = await supabase
  .from('bookings')
  .select('*')
  .eq('guide_id', guideId)
  .order('created_at', { ascending: false });
```

### Fetch Upcoming Dates
```js
const { data } = await supabase
  .from('trip_dates')
  .select('*')
  .eq('trip_id', tripId)
  .eq('is_available', true)
  .gte('start_date', today)
  .order('start_date', { ascending: true });
```

## Files Created

- `src/app/trips/[id]/page.tsx` - Public trip detail page
- `src/app/dashboard/bookings/page.tsx` - Guide's booking management
- `src/app/dashboard/trip/[id]/dates/page.tsx` - Availability date manager
- `src/app/bookings/confirmed/page.tsx` - Booking confirmation

## Known Limitations

- ⚠️ **No Payment Processing**: Bookings created but no Stripe integration yet
- ⚠️ **Manual Payout**: Guide payouts not automated (would need Stripe Connect)
- ⚠️ **No Refund Logic**: Cancellations don't refund customer
- ⚠️ **No Email Notifications**: Guides and customers don't get confirmation emails
- ⚠️ **No Reviews Yet**: Reviews system not yet implemented
- ⚠️ **Spot Availability**: Not auto-decremented when bookings confirmed

## Next Steps

1. **Payment Processing** - Integrate Stripe
   - Collect payment before confirmation
   - Store payment intent ID
   - Handle failed payments

2. **Email Notifications** - Send confirmations
   - Customer booking confirmation
   - Guide new booking alert
   - Reminder emails before trip

3. **Spot Availability** - Auto-decrement
   - When booking confirmed, decrement `spots_available`
   - Hide date when spots_available = 0

4. **Reviews System** - Post-trip feedback
   - Allow customers to review trips
   - Allow guides to respond
   - Update guide ratings

5. **Messaging** - In-app chat
   - Customer ↔ Guide messaging
   - Pre-booking questions
   - Trip-day coordination

6. **Trip Insurance** - Optional add-on
   - Offer trip insurance at booking
   - Handle claims
   - Refund processing

## Testing

### Test Booking Flow
1. Log in as test guide
2. Create a trip
3. Go to trip editor, click "Manage Dates"
4. Add 2-3 availability dates
5. Log out
6. Go to `/trips`
7. Click trip "View Details"
8. Select date, pick participants
9. Click "Book Now"
10. Should see confirmation page

### Test Guide Dashboard
1. Log in as guide
2. Click "Bookings" button
3. Should see any pending bookings
4. Click "Confirm Booking"
5. See status update in real-time

## Monitoring

### Key Metrics
- Bookings by status (pending, confirmed, completed)
- Total payout value
- Conversion rate (views → bookings)
- Average group size
- Completion rate
