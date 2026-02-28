# Initiative 1: Fix 8 API Issues - Implementation Guide

**Priority**: 🔴 HIGH  
**Status**: 🔄 IN PROGRESS  
**Time Estimate**: 2-3 hours  

---

## Issues Identified from Testing

### Issue 1: `POST /api/create-checkout-session` (HTTP 500)
**Problem**: Request body parsing fails when no body provided  
**Root Cause**: `await request.json()` throws error on empty body  
**Fix**: Add try-catch for JSON parsing, return 400 if invalid

### Issue 2: `POST /api/bookings/complete` (HTTP 500)
**Problem**: Same as Issue 1 - JSON parsing failure  
**Root Cause**: Missing body causes crash  
**Fix**: Validate body exists, return 400 if missing

### Issue 3: `GET /api/guide-reviews` (HTTP 404)
**Problem**: Route doesn't exist or requires parameters  
**Root Cause**: Path may need query parameters (tripId, etc.)  
**Fix**: Add endpoint with proper parameter handling

### Issues 4-8: Other API endpoints
**Problem**: Similar JSON parsing issues  
**Root Cause**: No input validation  
**Fix**: Add consistent error handling pattern

---

## Solution Pattern

### Before:
```typescript
export async function POST(request: NextRequest) {
  try {
    const { field1, field2 } = await request.json();
    // ... process
  } catch (error) {
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
```

### After:
```typescript
export async function POST(request: NextRequest) {
  try {
    // Check if body exists
    if (!request.body) {
      return NextResponse.json(
        { error: 'Request body is required' },
        { status: 400 }
      );
    }

    // Parse JSON with error handling
    let data;
    try {
      data = await request.json();
    } catch (jsonError) {
      return NextResponse.json(
        { error: 'Invalid JSON in request body' },
        { status: 400 }
      );
    }

    // Validate required fields
    const { field1, field2 } = data;
    if (!field1 || !field2) {
      return NextResponse.json(
        { 
          error: 'Missing required fields',
          required: ['field1', 'field2']
        },
        { status: 400 }
      );
    }

    // ... process
    return NextResponse.json(successData, { status: 201 });
  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown' },
      { status: 500 }
    );
  }
}
```

---

## APIs to Fix

### 1. POST /api/create-checkout-session
**File**: `src/app/api/create-checkout-session/route.ts`  
**Required Fields**: amount, tripId, tripName, guideName, userId, tripDateId, participantCount  
**Fix**: Add JSON parse error handling + field validation

### 2. POST /api/bookings/complete
**File**: `src/app/api/bookings/complete/route.ts`  
**Required Fields**: bookingId  
**Fix**: Add body validation + JSON error handling

### 3. GET /api/guide-reviews
**Issue**: Endpoint doesn't exist  
**Solution**: Create new route with query parameter support

### 4. POST /api/reviews/submit
**File**: May be `src/app/api/reviews/submit/route.ts` or similar  
**Fix**: Add request body validation

### 5-8. Other POST endpoints
**Fix Pattern**: Apply same solution pattern to all POST endpoints

---

## Implementation Steps

**Step 1**: Create reusable error handling utility  
**Step 2**: Fix create-checkout-session  
**Step 3**: Fix bookings/complete  
**Step 4**: Create missing endpoints  
**Step 5**: Apply fixes to other endpoints  
**Step 6**: Test all endpoints  
**Step 7**: Document API requirements

---

## Testing Strategy

### Before Fix:
```bash
curl -X POST https://summit-site-seven.vercel.app/api/create-checkout-session
→ HTTP 500 error
```

### After Fix:
```bash
curl -X POST https://summit-site-seven.vercel.app/api/create-checkout-session
→ HTTP 400 error with clear message: "Request body is required"

curl -X POST https://summit-site-seven.vercel.app/api/create-checkout-session \
  -H "Content-Type: application/json" \
  -d '{"amount": 450, "tripId": "123"}'
→ HTTP 400 error: "Missing required fields: guideName, etc."

curl -X POST https://summit-site-seven.vercel.app/api/create-checkout-session \
  -H "Content-Type: application/json" \
  -d '{all required fields}'
→ HTTP 201 Success: "session_id": "cs_..."
```

---

## Expected Improvements

✅ All API endpoints return proper HTTP status codes  
✅ Clear error messages for clients  
✅ Proper request validation  
✅ Better error logging  
✅ Consistent API response format  
✅ 0 HTTP 500 errors for client-side issues  

---

## Deliverables

1. ✅ Reusable error handler utility
2. ✅ Fixed create-checkout-session endpoint
3. ✅ Fixed bookings/complete endpoint  
4. ✅ New guide-reviews list endpoint
5. ✅ Fixed all other problematic endpoints
6. ✅ API documentation updated
7. ✅ Test results showing 100% pass rate

---

**Next Step**: Begin implementation with error utility and first endpoint fix
