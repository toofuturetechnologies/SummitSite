#!/bin/bash

# Interactive Stripe Webhook Setup
# This script guides you through setting up the account webhook

set -e

echo "🔧 Stripe Webhook Setup for Account Events"
echo "=========================================="
echo ""

# Check if we already have the key
if [ ! -z "$STRIPE_SECRET_KEY" ]; then
  echo "✅ Found STRIPE_SECRET_KEY in environment"
  API_KEY="$STRIPE_SECRET_KEY"
else
  echo "📝 Please enter your Stripe Secret Key"
  echo "   (Get it from https://dashboard.stripe.com/apikeys)"
  echo ""
  read -p "Enter Stripe Secret Key (sk_test_... or sk_live_...): " API_KEY
  echo ""
fi

# Validate the key format
if [[ ! $API_KEY =~ ^sk_(test|live)_ ]]; then
  echo "❌ Invalid Stripe key format"
  echo "   Should start with sk_test_ or sk_live_"
  exit 1
fi

echo "🔍 Checking Stripe account..."
echo ""

# Get account info to verify key
ACCOUNT_INFO=$(curl -s https://api.stripe.com/v1/account \
  -u "$API_KEY:" \
  -H "Content-Type: application/x-www-form-urlencoded")

if echo "$ACCOUNT_INFO" | grep -q "error"; then
  echo "❌ Invalid API Key"
  echo "   Error: $(echo $ACCOUNT_INFO | grep -o '"message":"[^"]*' | cut -d'"' -f4)"
  exit 1
fi

ACCOUNT_ID=$(echo "$ACCOUNT_INFO" | grep -o '"id":"[^"]*' | head -1 | cut -d'"' -f4)
echo "✅ Connected to Stripe account: $ACCOUNT_ID"
echo ""

# Check existing webhooks
echo "🔍 Checking for existing webhook endpoint..."
echo ""

WEBHOOK_URL="https://summit-site-seven.vercel.app/api/stripe-webhook-account"
REQUIRED_EVENTS="account.updated%2Caccount.external_account.created%2Caccount.external_account.updated"

# List webhooks
WEBHOOKS=$(curl -s https://api.stripe.com/v1/webhook_endpoints \
  -u "$API_KEY:" \
  -H "Content-Type: application/x-www-form-urlencoded")

# Check if webhook already exists
EXISTING=$(echo "$WEBHOOKS" | grep -o "stripe-webhook-account" | head -1)

if [ ! -z "$EXISTING" ]; then
  echo "✅ Found existing webhook endpoint!"
  
  # Get webhook ID
  WEBHOOK_ID=$(echo "$WEBHOOKS" | grep -B 5 "stripe-webhook-account" | grep '"id":"' | head -1 | cut -d'"' -f4)
  
  echo "   ID: $WEBHOOK_ID"
  
  # Get webhook details
  WEBHOOK=$(curl -s https://api.stripe.com/v1/webhook_endpoints/$WEBHOOK_ID \
    -u "$API_KEY:" \
    -H "Content-Type: application/x-www-form-urlencoded")
  
  SECRET=$(echo "$WEBHOOK" | grep -o '"secret":"[^"]*' | cut -d'"' -f4)
  URL=$(echo "$WEBHOOK" | grep -o '"url":"[^"]*' | cut -d'"' -f4)
  
  echo "   URL: $URL"
  echo "   Secret: ${SECRET:0:20}...${SECRET: -10}"
  echo ""
  
  if [ "$URL" = "$WEBHOOK_URL" ]; then
    echo "✅ Webhook URL is correct!"
  else
    echo "⚠️  Webhook URL doesn't match. Updating..."
    # Update the webhook
    curl -s https://api.stripe.com/v1/webhook_endpoints/$WEBHOOK_ID \
      -u "$API_KEY:" \
      -X POST \
      -d "url=$WEBHOOK_URL" \
      -d "enabled_events[]=account.updated" \
      -d "enabled_events[]=account.external_account.created" \
      -d "enabled_events[]=account.external_account.updated" \
      > /dev/null
    
    echo "✅ Webhook URL updated!"
  fi
else
  echo "📋 No existing webhook found. Creating new one..."
  echo ""
  
  # Create new webhook
  WEBHOOK=$(curl -s https://api.stripe.com/v1/webhook_endpoints \
    -u "$API_KEY:" \
    -X POST \
    -d "url=$WEBHOOK_URL" \
    -d "enabled_events[]=account.updated" \
    -d "enabled_events[]=account.external_account.created" \
    -d "enabled_events[]=account.external_account.updated")
  
  if echo "$WEBHOOK" | grep -q "error"; then
    echo "❌ Error creating webhook:"
    echo "   $(echo $WEBHOOK | grep -o '"message":"[^"]*' | cut -d'"' -f4)"
    exit 1
  fi
  
  WEBHOOK_ID=$(echo "$WEBHOOK" | grep -o '"id":"[^"]*' | head -1 | cut -d'"' -f4)
  SECRET=$(echo "$WEBHOOK" | grep -o '"secret":"[^"]*' | cut -d'"' -f4)
  
  echo "✅ Webhook created successfully!"
  echo ""
  echo "   ID: $WEBHOOK_ID"
  echo "   URL: $WEBHOOK_URL"
  echo "   Events:"
  echo "     - account.updated"
  echo "     - account.external_account.created"
  echo "     - account.external_account.updated"
  echo ""
fi

echo "=========================================="
echo "📋 ADD THIS TO YOUR VERCEL ENVIRONMENT:"
echo "=========================================="
echo ""
echo "Variable Name:  STRIPE_WEBHOOK_SECRET_ACCOUNT"
echo "Variable Value: $SECRET"
echo ""
echo "📍 Go to: https://vercel.com/toofuturetechnologies/summitsite/settings/environment-variables"
echo ""
echo "🚀 After adding the env var, redeploy:"
echo "   git push origin main"
echo ""
echo "✅ Setup Complete!"
