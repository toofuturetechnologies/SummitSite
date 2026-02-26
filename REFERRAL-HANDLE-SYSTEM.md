# Referral Handle System - Protective Design

## Overview

The referral system uses **user handles** (like @username on social media) combined with **protective validation** to ensure referrers have actually completed the trip they're referring.

---

## User Handles

### What is a Handle?

A **handle** is a unique username format used to identify users across the platform.

**Format:** `@{firstname}-{lastname}` or variation if duplicate

**Examples:**
- `@alex-mountain` (Guide)
- `@jane-traveler` (Customer/Referrer)
- `@john-explorer` (Creator)

### Handle Features

✅ **Unique** - No two users can have the same handle  
✅ **Indexed** - Fast database lookups  
✅ **User-friendly** - Easy to remember and share  
✅ **Immutable** - Cannot be changed once created  
✅ **Validated** - Format enforced (alphanumeric, hyphens, underscores)  

### Handle Generation

**Automatic on user creation:**
```sql
Format: @{full_name converted to lowercase}
Example: Alex Mountain → @alex-mountain
```

**Duplicate handling:**
```sql
If @alex-mountain already exists:
  @alex-mountain-1
  @alex-mountain-2
  etc.
```

---

## Referral Lookup System

### How Referral Works

**Old system (insecure):**
```
User ID lookup → Anyone could refer anyone
```

**New system (protective):**
```
Handle lookup → Validate trip completion → Validate UGC code
```

### API Endpoint

**GET** `/api/referrals/lookup`

**Query Parameters:**
- `handle` (required) - @username to lookup (e.g., @jane-traveler)
- `tripId` (required) - Trip being referred
- `currentUserId` (optional) - Prevent self-referral

**Example Request:**
```
GET /api/referrals/lookup?handle=@jane-traveler&tripId=abc123&currentUserId=xyz789
```

**Success Response (200):**
```json
{
  "success": true,
  "referrer": {
    "id": "6f00e559-...",
    "name": "Jane Traveler",
    "handle": "@jane-traveler"
  },
  "verification": {
    "tripCompleted": true,
    "ugcCodeExists": true,
    "ugcCode": "TRIP-abc12345-xyz-789"
  }
}
```

**Error: Not Found (404):**
```json
{
  "error": "User not found"
}
```

**Error: Not Completed (403):**
```json
{
  "error": "Referrer has not completed this trip",
  "details": "To refer someone to this trip, you must have booked and completed it first."
}
```

**Error: No UGC Code (403):**
```json
{
  "error": "Referrer has not received completion ID for this trip",
  "details": "The referrer must have a completion ID (UGC code) for this trip to refer others."
}
```

---

## Protective Validation Rules

### Rule 1: User Must Exist

**Check:**
```sql
SELECT id FROM profiles WHERE handle = '@jane-traveler'
```

**Failure:** "User not found" (404)

### Rule 2: User Must Have Completed This Trip

**Check:**
```sql
SELECT id FROM bookings 
WHERE user_id = referrer_id
  AND trip_id = current_trip_id
  AND status = 'completed'
```

**Failure:** "Referrer has not completed this trip" (403)

**Why:**
- Ensures they actually booked and took the trip
- Only allows referrals from real experience
- Prevents fraud (referring trips you haven't done)

### Rule 3: User Must Have UGC Code for This Trip

**Check:**
```sql
SELECT ugc_code FROM bookings 
WHERE user_id = referrer_id
  AND trip_id = current_trip_id
  AND status = 'completed'
  AND ugc_code IS NOT NULL
```

**Failure:** "Referrer has not received completion ID for this trip" (403)

**Why:**
- UGC code is generated when trip is completed and guide is paid
- Proves both trip completion AND guide payment
- Links the two bookings (referrer's past trip → new booking)
- Unique identifier for fraud prevention

### Rule 4: Self-Referral Prevention

**Check:**
```
if (currentUserId == referrer_id) {
  return "Cannot refer yourself"
}
```

**Failure:** "Cannot refer yourself" (400)

---

## Database Schema

### profiles table

```sql
-- New columns
handle VARCHAR(50) UNIQUE NOT NULL
handle_created_at TIMESTAMPTZ
handle_format_check: @[a-zA-Z0-9_-]{2,49}$
```

**Indexes:**
```sql
idx_profiles_handle ON profiles(handle)
```

### bookings table (no changes)

```sql
-- Existing columns used
ugc_code VARCHAR(32) UNIQUE NOT NULL
status TEXT ('pending', 'confirmed', 'completed', 'cancelled')
trip_id UUID NOT NULL
user_id UUID NOT NULL
```

---

## Checkout Flow with Handle Referral

### Step 1: Customer Enters Referrer Handle

```
Checkout Page Input:
"Who referred you?"
[Input: @jane-traveler]
```

### Step 2: Validate Referrer

```javascript
const response = await fetch('/api/referrals/lookup', {
  query: {
    handle: '@jane-traveler',
    tripId: 'abc123',
    currentUserId: 'xyz789'
  }
});
```

### Step 3: Handle Response

**Success:**
```javascript
if (response.ok) {
  // Show: "Great! Jane Traveler referred you"
  // Use: response.verification.ugcCode to link bookings
  referralUserId = response.referrer.id;
}
```

**Failure:**
```javascript
if (response.status === 403) {
  // Show error: "Jane hasn't completed this trip"
  referralUserId = null;
}
```

### Step 4: Create Booking with Referral Link

```sql
INSERT INTO bookings (
  trip_id,
  user_id,
  referral_user_id,    -- Jane's user ID
  referral_payout_amount,
  ugc_code,            -- Generated for this booking
  ...
)
```

---

## Example Scenarios

### Scenario 1: Valid Referral ✅

**User:** Jane Traveler (@jane-traveler)  
**Status:** Completed Mountain Adventure trip  
**UGC Code:** Yes (TRIP-abc123-def456)  
**Referral:** John Explorer searches for referrer  

**Lookup:** `@jane-traveler` for Mountain Adventure  
**Validation:**
- ✅ Jane exists
- ✅ Jane booked Mountain Adventure
- ✅ Jane's booking completed
- ✅ Jane has UGC code

**Result:** ✅ ACCEPTED - John can refer Jane

---

### Scenario 2: Invalid - Didn't Complete Trip ❌

**User:** Sarah (@sarah-adventure)  
**Status:** Booked Mountain Adventure but CANCELLED  
**UGC Code:** No (trip was cancelled)  
**Referral:** John searches for @sarah-adventure  

**Lookup:** `@sarah-adventure` for Mountain Adventure  
**Validation:**
- ✅ Sarah exists
- ✅ Sarah booked Mountain Adventure
- ❌ Sarah's booking NOT completed (status=cancelled)

**Result:** ❌ REJECTED - Error: "Sarah has not completed this trip"

---

### Scenario 3: Invalid - Different Trip ❌

**User:** Jane (@jane-traveler)  
**Status:** Completed Rainforest Adventure  
**UGC Code:** Yes (but for Rainforest, not Mountain)  
**Referral:** John tries to refer Jane for Mountain Adventure  

**Lookup:** `@jane-traveler` for Mountain Adventure  
**Validation:**
- ✅ Jane exists
- ❌ Jane has NOT booked Mountain Adventure (only Rainforest)

**Result:** ❌ REJECTED - Error: "Jane has not completed this trip"

---

### Scenario 4: Invalid - Self-Referral ❌

**User:** John (@john-explorer)  
**Status:** Completed Mountain Adventure  
**Referral:** John tries to refer himself  

**Lookup:** `@john-explorer` with currentUserId=john's_id  
**Validation:**
- ✅ John exists
- ✅ John completed Mountain Adventure
- ❌ John is trying to refer himself

**Result:** ❌ REJECTED - Error: "Cannot refer yourself"

---

## Implementation Checklist

- [x] Add `handle` column to profiles (migration 009)
- [x] Generate handles for existing users
- [x] Create handle index for fast lookup
- [x] Create `/api/referrals/lookup` endpoint
- [ ] Update checkout page to use handle lookup
- [ ] Update referral display to show @handle
- [ ] Create test data with handles
- [ ] Add handle validation in referral forms
- [ ] Add referrer details display (name + handle)
- [ ] Add error messages for failed validation
- [ ] Create user-facing help text

---

## Error Handling & User Messages

### For Customers (Checkout)

**"Jane Traveler referred me"**
```
Enter referrer's username: [input field]
Help text: "Enter the @handle of the person who referred you 
           (e.g., @jane-traveler). They must have completed 
           this trip to refer you."

On search:
✅ Success: "Great! Jane Traveler referred you. 
            You'll both earn referral bonuses."
❌ Not found: "Username not found. Check spelling."
❌ Not completed: "Jane hasn't completed this trip yet. 
                   You can only refer from people who've done it."
```

### For Guides (Dashboard)

**Referral earnings breakdown:**
```
Referral: @jane-traveler
Trip: Mountain Adventure
Amount: $7.50
Status: Paid
Completed: Feb 28, 2026
```

---

## Security Implications

### What This Protects Against

1. **Fake Referrals**
   - Can't refer trips you haven't done
   - UGC code proves completion

2. **Duplicate Referrals**
   - Each person can only refer once per trip
   - Booking is unique (one referral_user_id per booking)

3. **Fraud**
   - UGC code ties referrer's past trip to new booking
   - Guide signature on completion (UGC code proves they led it)

4. **Abuse**
   - Self-referral prevented
   - Only legitimate trip completions count
   - Community-verified (only real customers can refer)

---

## Database Migration (009)

**Run in Supabase:**
```sql
-- Copy the entire content of:
supabase/migrations/009_add_user_handles.sql

-- Execute in SQL Editor
```

**After migration:**
- All existing users get handles
- All new signups auto-generate handle
- Handle uniqueness enforced
- Referral lookups can use handle

---

## Testing Checklist

- [ ] User handles generated correctly
- [ ] Handle lookup works with valid referrer
- [ ] Trip completion validated
- [ ] UGC code existence validated
- [ ] Self-referral prevented
- [ ] Error messages display correctly
- [ ] Checkout integrates handle lookup
- [ ] Multiple trip scenario works (user can only refer specific trip)
- [ ] Referral link created correctly in booking
- [ ] Dashboard displays referrer handle

---

## FAQ

**Q: Can I change my handle?**
A: No, handles are immutable for security and consistency.

**Q: What if my name is duplicated?**
A: The system auto-appends numbers (@alex-mountain-1, @alex-mountain-2, etc.)

**Q: Can I refer multiple times from different trips?**
A: Yes! If you've completed multiple trips, you can refer each one separately.

**Q: What if the referrer cancels their trip later?**
A: Referral still counts (based on trip_id, not on current status).

**Q: Is my handle visible to others?**
A: Yes, it's your public username like any social platform.

**Q: How do I find someone's handle?**
A: Either ask them, or search the user directory if available.

