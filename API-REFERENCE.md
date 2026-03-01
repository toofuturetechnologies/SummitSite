# Summit API Reference

Complete API endpoint documentation with request/response examples.

## Authentication

All authenticated endpoints require a valid JWT token in the `Authorization` header:

```
Authorization: Bearer <jwt_token>
```

Unauthenticated users can access public endpoints without headers.

---

## Endpoints

### Trips

#### GET /api/trips
List all available trips with filtering, sorting, and pagination.

**Query Parameters:**
- `limit` (number, default: 20) - Results per page
- `offset` (number, default: 0) - Pagination offset
- `difficulty` (string) - Filter by difficulty: 'beginner', 'intermediate', 'advanced'
- `location` (string) - Search trips by location
- `sort` (string) - Sort by: 'created', 'price', 'rating'

**Response:**
```json
{
  "trips": [
    {
      "id": "uuid",
      "title": "Mount Everest Expedition",
      "location": "Nepal",
      "difficulty": "advanced",
      "price": 5000,
      "rating": 4.8,
      "guide": {
        "id": "uuid",
        "name": "Alex Mountain",
        "photo_url": "https://..."
      }
    }
  ],
  "total": 150,
  "page": 1,
  "totalPages": 8,
  "hasMore": true
}
```

**Status Codes:**
- `200` - Success
- `400` - Invalid query parameters
- `500` - Server error

---

#### POST /api/create-checkout-session
Create a Stripe checkout session for a trip booking.

**Request Body:**
```json
{
  "tripId": "uuid",
  "date": "2026-04-15",
  "participants": 2,
  "totalAmount": 450.00
}
```

**Response:**
```json
{
  "clientSecret": "pi_1234567890",
  "sessionId": "cs_test_xxxxx"
}
```

**Status Codes:**
- `200` - Checkout session created
- `400` - Missing/invalid fields
- `401` - Unauthorized (user not authenticated)
- `500` - Stripe API error

**Error Handling:**
- Missing fields → `400` with `code: MISSING_FIELDS`
- Invalid trip ID → `404` with `code: TRIP_NOT_FOUND`
- Stripe error → `500` with `code: STRIPE_ERROR`

---

### Bookings

#### GET /api/bookings
Get user's bookings.

**Query Parameters:**
- `status` (string) - Filter: 'pending', 'confirmed', 'completed', 'cancelled'

**Response:**
```json
{
  "bookings": [
    {
      "id": "uuid",
      "tripId": "uuid",
      "trip": {
        "title": "Mount Everest",
        "location": "Nepal"
      },
      "date": "2026-04-15",
      "status": "confirmed",
      "participants": 2,
      "totalAmount": 450.00
    }
  ],
  "total": 12
}
```

**Status Codes:**
- `200` - Success
- `401` - Unauthorized
- `500` - Server error

---

#### POST /api/bookings/complete
Mark a booking as completed (after trip ends).

**Request Body:**
```json
{
  "bookingId": "uuid"
}
```

**Response:**
```json
{
  "success": true,
  "booking": {
    "id": "uuid",
    "status": "completed"
  }
}
```

**Status Codes:**
- `200` - Success
- `400` - Invalid booking ID
- `401` - Unauthorized
- `403` - Not authorized to complete this booking
- `409` - Booking already completed

---

### Reviews

#### GET /api/guide-reviews/list
Get reviews of a guide's customer service.

**Query Parameters:**
- `limit` (number, default: 50)
- `offset` (number, default: 0)

**Response:**
```json
{
  "reviews": [
    {
      "id": "uuid",
      "rating": 5,
      "comment": "Amazing guide, very professional!",
      "customer": {
        "name": "John Doe",
        "photo_url": "https://..."
      },
      "trip": {
        "title": "Mountain Trek"
      },
      "createdAt": "2026-02-15T10:30:00Z"
    }
  ],
  "total": 45,
  "limit": 50,
  "offset": 0
}
```

**Status Codes:**
- `200` - Success
- `401` - Unauthorized
- `403` - Only guides can access this
- `500` - Server error

---

#### POST /api/guide-reviews/submit
Submit a review for a guide after completing a trip.

**Request Body:**
```json
{
  "bookingId": "uuid",
  "rating": 5,
  "comment": "Amazing experience!",
  "professionalism_rating": 5,
  "behavior_notes": "Very attentive and safety-conscious"
}
```

**Response:**
```json
{
  "success": true,
  "review": {
    "id": "uuid",
    "rating": 5,
    "createdAt": "2026-02-20T14:22:00Z"
  }
}
```

**Status Codes:**
- `200` - Review submitted
- `400` - Invalid fields (missing rating, comment, etc.)
- `401` - Unauthorized
- `409` - Review already exists for this booking
- `500` - Server error

---

### Payments & Payouts

#### POST /api/create-payment-intent
Create a Stripe PaymentIntent for direct payments (not checkout).

**Request Body:**
```json
{
  "amount": 50000,
  "currency": "usd",
  "description": "Trip booking - Mount Everest"
}
```

**Response:**
```json
{
  "clientSecret": "pi_1234567890_secret_abcdef",
  "intentId": "pi_1234567890"
}
```

**Status Codes:**
- `200` - Intent created
- `400` - Invalid amount/currency
- `500` - Stripe error

---

#### POST /api/create-payout
Create a payout for a guide.

**Request Body:**
```json
{
  "amount": 395.00,
  "guideId": "uuid",
  "description": "Payout for Mountain Trek booking"
}
```

**Response:**
```json
{
  "success": true,
  "payout": {
    "id": "po_1234567890",
    "amount": 395.00,
    "status": "in_transit",
    "arrivedAt": "2026-03-05"
  }
}
```

**Status Codes:**
- `200` - Payout created
- `400` - Invalid amount/guide
- `401` - Unauthorized
- `500` - Stripe error

---

### Admin Endpoints

#### GET /api/admin/check
Verify if user has admin privileges.

**Response:**
```json
{
  "isAdmin": true,
  "role": "admin"
}
```

**Status Codes:**
- `200` - Success
- `401` - Unauthorized
- `403` - User is not admin

---

#### GET /api/admin/users
List all users with optional filtering.

**Query Parameters:**
- `status` (string) - 'active', 'suspended', 'all'
- `limit` (number, default: 20)
- `offset` (number, default: 0)

**Response:**
```json
{
  "users": [
    {
      "id": "uuid",
      "name": "John Doe",
      "email": "john@example.com",
      "role": "customer",
      "status": "active",
      "createdAt": "2026-01-15T10:00:00Z"
    }
  ],
  "total": 150,
  "page": 1,
  "totalPages": 8
}
```

---

#### POST /api/admin/users/suspend
Suspend a user account.

**Request Body:**
```json
{
  "userId": "uuid",
  "reason": "Violating community guidelines",
  "permanent": false,
  "expiresAt": "2026-04-01T00:00:00Z"
}
```

**Response:**
```json
{
  "success": true,
  "suspension": {
    "id": "uuid",
    "userId": "uuid",
    "reason": "Violating community guidelines",
    "suspendedAt": "2026-03-01T10:30:00Z",
    "expiresAt": "2026-04-01T00:00:00Z"
  }
}
```

---

#### GET /api/admin/analytics/dashboard
Get platform analytics dashboard data.

**Response:**
```json
{
  "total_users": 1250,
  "active_guides": 45,
  "total_bookings": 580,
  "monthly_revenue": 125000.00,
  "pending_disputes": 3,
  "pending_reviews": 12
}
```

---

## Error Handling

All error responses follow this format:

```json
{
  "error": "Description of the error",
  "code": "ERROR_CODE",
  "details": {
    "field": "value",
    "missingFields": ["field1", "field2"]
  }
}
```

**Common Error Codes:**
- `MISSING_FIELDS` - Required fields missing
- `INVALID_INPUT` - Invalid field format
- `UNAUTHORIZED` - Not authenticated
- `FORBIDDEN` - Authenticated but not authorized
- `NOT_FOUND` - Resource not found
- `CONFLICT` - Resource already exists
- `RATE_LIMIT` - Too many requests
- `INTERNAL_ERROR` - Server error

---

## Rate Limiting

- **Public endpoints**: 100 requests per minute
- **Authenticated endpoints**: 1000 requests per minute
- **Admin endpoints**: 500 requests per minute

Rate limit headers:
```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 47
X-RateLimit-Reset: 1614556800
```

---

## Versioning

Current API version: `v1`

Future versions will be available at `/api/v2/`, `/api/v3/`, etc. with backward compatibility maintained.

---

## Webhooks

Summit sends webhooks for important events:

### Events

- `payment.succeeded` - Payment completed
- `booking.created` - New booking made
- `booking.cancelled` - Booking cancelled
- `review.submitted` - New review added
- `dispute.created` - New dispute filed
- `user.suspended` - User account suspended

### Webhook Payload

```json
{
  "id": "webhook_uuid",
  "type": "booking.created",
  "timestamp": "2026-03-01T10:30:00Z",
  "data": {
    "bookingId": "uuid",
    "tripId": "uuid",
    "amount": 450.00
  }
}
```

---

## Testing

**Test Mode:**
- Use test Stripe API keys (start with `pk_test_` or `sk_test_`)
- Test card: `4242 4242 4242 4242` (expiry: any future date, CVC: any 3 digits)
- Test webhook endpoint: `https://webhook.site/` (temporary testing)

---

## Support

For API questions or issues:
- Email: api@summit.local
- Documentation: https://docs.summit.local
- Issues: https://github.com/toofuturetechnologies/SummitSite/issues
