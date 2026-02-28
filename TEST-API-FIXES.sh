#!/bin/bash

# API Fixes Testing Script - Initiative 1
# Tests all 8 fixed endpoints for proper error handling

BASE_URL="https://summit-site-seven.vercel.app"
# For local testing: BASE_URL="http://localhost:3000"

echo "🧪 API FIXES - COMPREHENSIVE TEST SUITE"
echo "========================================"
echo ""

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Test counter
TESTS_RUN=0
TESTS_PASSED=0
TESTS_FAILED=0

# Test helper function
test_endpoint() {
  local endpoint=$1
  local description=$2
  local method=$3
  local body=$4
  local expected_status=$5
  
  TESTS_RUN=$((TESTS_RUN + 1))
  
  echo -n "[$TESTS_RUN] Testing $endpoint - $description ... "
  
  if [ -z "$body" ]; then
    response=$(curl -s -w "\n%{http_code}" -X "$method" \
      -H "Content-Type: application/json" \
      "$BASE_URL$endpoint")
  else
    response=$(curl -s -w "\n%{http_code}" -X "$method" \
      -H "Content-Type: application/json" \
      -d "$body" \
      "$BASE_URL$endpoint")
  fi
  
  status_code=$(echo "$response" | tail -1)
  body=$(echo "$response" | sed '$d')
  
  if [ "$status_code" = "$expected_status" ]; then
    echo -e "${GREEN}PASS${NC} (HTTP $status_code)"
    TESTS_PASSED=$((TESTS_PASSED + 1))
  else
    echo -e "${RED}FAIL${NC} (Expected $expected_status, got $status_code)"
    echo "   Response: $body"
    TESTS_FAILED=$((TESTS_FAILED + 1))
  fi
}

# ============================================
# TEST 1: /api/create-checkout-session
# ============================================
echo -e "\n${YELLOW}1. Testing /api/create-checkout-session${NC}"
echo "---"

# Valid request
test_endpoint "/api/create-checkout-session" \
  "Valid request" \
  "POST" \
  '{"amount": 100, "tripId": "550e8400-e29b-41d4-a716-446655440001", "tripName": "Test Trip", "guideName": "Test Guide"}' \
  "200"

# Missing Content-Type (should fail at 400)
echo -n "[TEST] Missing Content-Type validation ... "
response=$(curl -s -w "\n%{http_code}" -X POST \
  -d '{"amount": 100}' \
  "$BASE_URL/api/create-checkout-session")
status=$(echo "$response" | tail -1)
if [ "$status" = "400" ]; then
  echo -e "${GREEN}PASS${NC} (properly rejects non-JSON)"
  TESTS_PASSED=$((TESTS_PASSED + 1))
else
  echo -e "${RED}FAIL${NC} (should reject, got $status)"
  TESTS_FAILED=$((TESTS_FAILED + 1))
fi
TESTS_RUN=$((TESTS_RUN + 1))

# Missing amount
test_endpoint "/api/create-checkout-session" \
  "Missing amount field" \
  "POST" \
  '{"tripId": "550e8400-e29b-41d4-a716-446655440001"}' \
  "400"

# Missing tripId
test_endpoint "/api/create-checkout-session" \
  "Missing tripId field" \
  "POST" \
  '{"amount": 100}' \
  "400"

# Empty JSON
test_endpoint "/api/create-checkout-session" \
  "Empty body" \
  "POST" \
  '{}' \
  "400"

# Malformed JSON
echo -n "[TEST] Malformed JSON parsing ... "
response=$(curl -s -w "\n%{http_code}" -X POST \
  -H "Content-Type: application/json" \
  -d '{bad json}' \
  "$BASE_URL/api/create-checkout-session")
status=$(echo "$response" | tail -1)
if [ "$status" = "400" ]; then
  echo -e "${GREEN}PASS${NC} (properly handles malformed JSON)"
  TESTS_PASSED=$((TESTS_PASSED + 1))
else
  echo -e "${RED}FAIL${NC} (should return 400, got $status)"
  TESTS_FAILED=$((TESTS_FAILED + 1))
fi
TESTS_RUN=$((TESTS_RUN + 1))

# ============================================
# TEST 2: /api/bookings/complete
# ============================================
echo -e "\n${YELLOW}2. Testing /api/bookings/complete${NC}"
echo "---"

# Invalid UUID format
test_endpoint "/api/bookings/complete" \
  "Invalid UUID format" \
  "POST" \
  '{"bookingId": "not-a-uuid"}' \
  "400"

# Missing bookingId
test_endpoint "/api/bookings/complete" \
  "Missing bookingId" \
  "POST" \
  '{}' \
  "400"

# Valid UUID but booking doesn't exist (will fail with 404 from DB)
test_endpoint "/api/bookings/complete" \
  "Valid UUID, booking not found" \
  "POST" \
  '{"bookingId": "550e8400-e29b-41d4-a716-446655440000"}' \
  "404"

# ============================================
# TEST 3: /api/guide-reviews/submit
# ============================================
echo -e "\n${YELLOW}3. Testing /api/guide-reviews/submit${NC}"
echo "---"

# Missing required fields
test_endpoint "/api/guide-reviews/submit" \
  "Missing bookingId" \
  "POST" \
  '{"rating": 5}' \
  "400"

# Invalid rating (too high)
test_endpoint "/api/guide-reviews/submit" \
  "Invalid rating (>5)" \
  "POST" \
  '{"bookingId": "550e8400-e29b-41d4-a716-446655440001", "rating": 10}' \
  "400"

# Invalid rating (too low)
test_endpoint "/api/guide-reviews/submit" \
  "Invalid rating (<1)" \
  "POST" \
  '{"bookingId": "550e8400-e29b-41d4-a716-446655440001", "rating": 0}' \
  "400"

# Valid request (will fail auth but tests validation)
test_endpoint "/api/guide-reviews/submit" \
  "Valid format (will fail auth)" \
  "POST" \
  '{"bookingId": "550e8400-e29b-41d4-a716-446655440001", "rating": 4, "comment": "Great trip!"}' \
  "401"

# ============================================
# TEST 4: /api/create-payment-intent
# ============================================
echo -e "\n${YELLOW}4. Testing /api/create-payment-intent${NC}"
echo "---"

# Missing required fields
test_endpoint "/api/create-payment-intent" \
  "Missing tripId and bookingId" \
  "POST" \
  '{"amount": 100}' \
  "400"

# Invalid amount
test_endpoint "/api/create-payment-intent" \
  "Invalid amount (negative)" \
  "POST" \
  '{"amount": -50, "tripId": "550e8400-e29b-41d4-a716-446655440001", "bookingId": "550e8400-e29b-41d4-a716-446655440001"}' \
  "400"

# ============================================
# TEST 5: /api/create-payout
# ============================================
echo -e "\n${YELLOW}5. Testing /api/create-payout${NC}"
echo "---"

# Missing bookingId
test_endpoint "/api/create-payout" \
  "Missing bookingId" \
  "POST" \
  '{}' \
  "400"

# Invalid bookingId format
test_endpoint "/api/create-payout" \
  "Invalid bookingId format" \
  "POST" \
  '{"bookingId": "not-uuid"}' \
  "400"

# ============================================
# TEST 6: /api/stripe-connect/create-account
# ============================================
echo -e "\n${YELLOW}6. Testing /api/stripe-connect/create-account${NC}"
echo "---"

# Missing required fields
test_endpoint "/api/stripe-connect/create-account" \
  "Missing all fields" \
  "POST" \
  '{}' \
  "400"

# Invalid email
test_endpoint "/api/stripe-connect/create-account" \
  "Invalid email format" \
  "POST" \
  '{"guideId": "550e8400-e29b-41d4-a716-446655440001", "guideName": "John", "userEmail": "not-an-email"}' \
  "400"

# Valid format
test_endpoint "/api/stripe-connect/create-account" \
  "Valid format (will fail auth)" \
  "POST" \
  '{"guideId": "550e8400-e29b-41d4-a716-446655440001", "guideName": "John", "userEmail": "john@example.com"}' \
  "401"

# ============================================
# TEST 7: /api/stripe-connect-url
# ============================================
echo -e "\n${YELLOW}7. Testing /api/stripe-connect-url${NC}"
echo "---"

# Missing guideId
test_endpoint "/api/stripe-connect-url" \
  "Missing guideId" \
  "POST" \
  '{"userId": "550e8400-e29b-41d4-a716-446655440001"}' \
  "400"

# Invalid UUID
test_endpoint "/api/stripe-connect-url" \
  "Invalid UUID format" \
  "POST" \
  '{"guideId": "bad-uuid", "userId": "550e8400-e29b-41d4-a716-446655440001"}' \
  "400"

# ============================================
# TEST 8: /api/ugc/submit
# ============================================
echo -e "\n${YELLOW}8. Testing /api/ugc/submit${NC}"
echo "---"

# Missing required fields
test_endpoint "/api/ugc/submit" \
  "Missing all required fields" \
  "POST" \
  '{}' \
  "400"

# Invalid URL
test_endpoint "/api/ugc/submit" \
  "Invalid TikTok URL" \
  "POST" \
  '{"trip_id": "550e8400-e29b-41d4-a716-446655440001", "tiktok_url": "not-a-url", "tiktok_video_id": "123", "ugc_code": "ABC123"}' \
  "400"

# Valid format (will fail auth)
test_endpoint "/api/ugc/submit" \
  "Valid format (will fail auth)" \
  "POST" \
  '{"trip_id": "550e8400-e29b-41d4-a716-446655440001", "tiktok_url": "https://www.tiktok.com/@user/video/123456", "tiktok_video_id": "123456", "ugc_code": "ABC123"}' \
  "401"

# ============================================
# RESULTS
# ============================================
echo -e "\n${YELLOW}=======================================${NC}"
echo "FINAL RESULTS"
echo -e "${YELLOW}=======================================${NC}"
echo "Total Tests Run:    $TESTS_RUN"
echo -e "Passed:             ${GREEN}$TESTS_PASSED${NC}"
echo -e "Failed:             ${RED}$TESTS_FAILED${NC}"
echo ""

PASS_RATE=$((TESTS_PASSED * 100 / TESTS_RUN))
echo "Pass Rate: $PASS_RATE%"

if [ $TESTS_FAILED -eq 0 ]; then
  echo -e "\n${GREEN}✅ ALL TESTS PASSED!${NC}"
  exit 0
else
  echo -e "\n${RED}❌ SOME TESTS FAILED${NC}"
  exit 1
fi
