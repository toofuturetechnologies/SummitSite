# Initiative 1: Fix 8 API Issues - Implementation Guide

**Effort**: 2-3 hours  
**Status**: 🔄 IN PROGRESS  
**Branch**: `feature/initiative-1-api-fixes`  

---

## The 8 Issues to Fix

### 1. ❌ Unsafe JSON Parsing
**Problem**: If client sends malformed JSON, `request.json()` throws an error that crashes the endpoint  
**Fix**: Wrap JSON parsing in try-catch with proper error response

### 2. ❌ No Content-Type Validation
**Problem**: Endpoint accepts any content type  
**Fix**: Check `Content-Type: application/json` header

### 3. ❌ No Request Size Limits
**Problem**: Could allow DoS attacks with massive payloads  
**Fix**: Add max payload size validation (1MB)

### 4. ❌ Inconsistent Error Messages
**Problem**: Some endpoints say "Internal server error", others are more specific  
**Fix**: Standardize error format: `{ error, code, details }`

### 5. ❌ No Input Sanitization
**Problem**: String inputs not trimmed or validated  
**Fix**: Trim strings, validate length, check for SQL injection patterns

### 6. ❌ Missing Rate Limiting Headers
**Problem**: No rate limit info sent to client  
**Fix**: Add `RateLimit-Limit`, `RateLimit-Remaining`, `RateLimit-Reset` headers

### 7. ❌ Incomplete Error Logging
**Problem**: Some errors logged with `console.error()`, some silent  
**Fix**: Standardized logging with request ID, timestamp, user ID

### 8. ❌ Inconsistent Status Codes
**Problem**: Some use 400, others use 500 for validation errors  
**Fix**: Standardize: 400 = validation, 401 = auth, 403 = forbidden, 500 = server error

---

## Solution: API Utils Helper

Create `/src/lib/api-utils.ts` with reusable validation & error handling:

```typescript
// Safely parse JSON from request
export async function parseRequestJson(request: NextRequest) {
  try {
    return await request.json();
  } catch (error) {
    throw new ApiError('Invalid JSON in request body', 400, 'JSON_PARSE_ERROR');
  }
}

// Validate required fields
export function validateRequired(data: any, fields: string[]) {
  const missing = fields.filter(f => !data[f]);
  if (missing.length > 0) {
    throw new ApiError(`Missing required fields: ${missing.join(', ')}`, 400, 'MISSING_FIELDS');
  }
}

// Sanitize string input
export function sanitizeString(str: string, maxLength = 1000) {
  if (typeof str !== 'string') {
    throw new ApiError('Expected string value', 400, 'INVALID_TYPE');
  }
  return str.trim().substring(0, maxLength);
}

// Check Content-Type
export function validateContentType(request: NextRequest) {
  const contentType = request.headers.get('content-type');
  if (!contentType?.includes('application/json')) {
    throw new ApiError('Content-Type must be application/json', 400, 'INVALID_CONTENT_TYPE');
  }
}

// Custom error class
export class ApiError extends Error {
  constructor(
    message: string,
    public statusCode: number = 500,
    public code: string = 'INTERNAL_ERROR'
  ) {
    super(message);
  }
}

// Wrapper for POST handlers
export async function handlePostRequest(
  request: NextRequest,
  handler: (data: any, req: NextRequest) => Promise<any>
) {
  try {
    validateContentType(request);
    const data = await parseRequestJson(request);
    const result = await handler(data, request);
    return NextResponse.json(result, { status: 200 });
  } catch (error) {
    return handleError(error);
  }
}

// Centralized error handler
export function handleError(error: any): NextResponse {
  if (error instanceof ApiError) {
    console.error(`[${error.code}] ${error.message}`);
    return NextResponse.json(
      {
        error: error.message,
        code: error.code,
      },
      { status: error.statusCode }
    );
  }
  
  console.error('Unexpected error:', error);
  return NextResponse.json(
    {
      error: 'Internal server error',
      code: 'INTERNAL_ERROR',
    },
    { status: 500 }
  );
}
```

---

## Endpoints to Fix (8 Total)

### POST Endpoints Requiring Updates

| # | Endpoint | Current Issues | Fix |
|---|----------|----------------|-----|
| 1 | `/api/create-checkout-session` | No Content-Type check, unsafe JSON parse | Add validation helpers |
| 2 | `/api/bookings/complete` | Unsafe JSON parse, no sanitization | Add validation helpers |
| 3 | `/api/guide-reviews/submit` | No Content-Type check | Add validation helpers |
| 4 | `/api/messages/send` | Existing checks are good, improve error logging | Enhance logging |
| 5 | `/api/create-payment-intent` | Unsafe JSON parse | Add validation helpers |
| 6 | `/api/create-payout` | No Content-Type check | Add validation helpers |
| 7 | `/api/stripe-connect/create-account` | Unsafe JSON parse | Add validation helpers |
| 8 | `/api/ugc/submit` | No Content-Type check, could improve validation | Add validation helpers |

---

## Implementation Steps

### Step 1: Create API Utils (5 min)
- [ ] Create `/src/lib/api-utils.ts`
- [ ] Implement error classes and validation helpers
- [ ] Export all utilities

### Step 2: Update POST Endpoints (60 min)
For each endpoint:
- [ ] Import helpers from `api-utils.ts`
- [ ] Replace manual validation with `validateRequired()`
- [ ] Add Content-Type validation
- [ ] Wrap JSON parsing with error handling
- [ ] Replace custom error responses with `ApiError`
- [ ] Test with curl

### Step 3: Testing (30 min)
- [ ] Test with valid requests (should pass)
- [ ] Test with malformed JSON (should return 400)
- [ ] Test with missing fields (should return 400 + list missing fields)
- [ ] Test with wrong Content-Type (should return 400)
- [ ] Test with very large payload (should handle gracefully)

### Step 4: Deployment (10 min)
- [ ] Commit changes: `git add . && git commit -m "fix(api): implement 8-issue fixes - validation, error handling, content-type"`
- [ ] Push to branch: `git push origin feature/initiative-1-api-fixes`
- [ ] Deploy to Vercel (auto-deploy on push)
- [ ] Verify in production

---

## Before/After Examples

### BEFORE: `/api/bookings/complete`
```typescript
export async function POST(request: NextRequest) {
  try {
    const { bookingId } = await request.json();  // ❌ No error handling if JSON bad
    
    if (!bookingId) {  // ❌ Incomplete validation
      return NextResponse.json({ error: 'bookingId required' }, { status: 400 });
    }
    // ... rest of code
  } catch (err) {
    console.error('Error:', err);  // ❌ Generic logging
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
```

### AFTER: `/api/bookings/complete`
```typescript
import { ApiError, parseRequestJson, validateRequired, handleError } from '@/lib/api-utils';

export async function POST(request: NextRequest) {
  try {
    validateContentType(request);  // ✅ Check Content-Type
    const { bookingId } = await parseRequestJson(request);  // ✅ Safe parsing
    validateRequired({ bookingId }, ['bookingId']);  // ✅ Clear validation
    
    // ... rest of code
  } catch (error) {
    return handleError(error);  // ✅ Standardized error handling
  }
}
```

---

## Success Criteria

- [ ] All 8 endpoints have proper JSON parsing error handling
- [ ] All POST endpoints validate Content-Type
- [ ] All POST endpoints use standardized error messages
- [ ] Test with curl shows proper error responses for malformed requests
- [ ] Production deployment successful with no new errors
- [ ] API response times unchanged (validation adds <1ms)

---

## Time Estimate
- API Utils: 5 min
- Update 8 endpoints: 60 min (7.5 min per endpoint)
- Testing: 30 min
- Deployment: 10 min
- **Total: 105 minutes (1.75 hours)**

---

## Next After This
Once Initiative 1 is complete:
1. ✅ Test all fixed endpoints thoroughly
2. 🔄 Move to Initiative 2: Creator Tier System (8-12 hours)
3. 📊 Track metrics: API errors should drop to near 0%

