#!/usr/bin/env node

/**
 * Setup Stripe Webhook for Account Events
 * 
 * This script creates or updates the Stripe webhook endpoint for account.updated events
 * Required: STRIPE_SECRET_KEY and STRIPE_WEBHOOK_SECRET_ACCOUNT env vars
 * 
 * Usage:
 *   node scripts/setup-stripe-webhook.js
 * 
 * Or with env var:
 *   STRIPE_SECRET_KEY=sk_test_... node scripts/setup-stripe-webhook.js
 */

const Stripe = require('stripe');

async function setupWebhook() {
  const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
  
  if (!stripeSecretKey) {
    console.error('❌ STRIPE_SECRET_KEY not found in environment variables');
    console.error('   Set it from your Stripe Dashboard: https://dashboard.stripe.com/apikeys');
    process.exit(1);
  }

  const stripe = new Stripe(stripeSecretKey, {
    apiVersion: '2023-10-16',
  });

  try {
    console.log('🔍 Checking for existing account webhook endpoint...');

    // List all webhook endpoints
    const endpoints = await stripe.webhookEndpoints.list({ limit: 100 });
    
    const accountWebhook = endpoints.data.find(ep => {
      const eventTypes = ep.enabled_events || [];
      return eventTypes.includes('account.updated');
    });

    const webhookUrl = 'https://summit-site-seven.vercel.app/api/stripe-webhook-account';
    const requiredEvents = [
      'account.updated',
      'account.external_account.created',
      'account.external_account.updated',
    ];

    if (accountWebhook) {
      console.log(`✅ Found existing webhook: ${accountWebhook.id}`);
      console.log(`   URL: ${accountWebhook.url}`);
      console.log(`   Events: ${accountWebhook.enabled_events.join(', ')}`);

      // Update if URL doesn't match
      if (accountWebhook.url !== webhookUrl) {
        console.log(`\n🔄 Updating webhook URL to: ${webhookUrl}`);
        
        const updated = await stripe.webhookEndpoints.update(
          accountWebhook.id,
          {
            url: webhookUrl,
            enabled_events: requiredEvents,
          }
        );

        console.log(`✅ Webhook updated!`);
        console.log(`   ID: ${updated.id}`);
        console.log(`   Secret: ${updated.secret}`);
        console.log(`\n📝 Add this to your Vercel environment variables:`);
        console.log(`   STRIPE_WEBHOOK_SECRET_ACCOUNT=${updated.secret}`);
      } else {
        console.log('✅ Webhook URL is already correct!');
        console.log(`\n📝 Your webhook secret is:`);
        console.log(`   ${accountWebhook.secret}`);
      }
    } else {
      console.log('📋 No existing account webhook found. Creating one...\n');

      const endpoint = await stripe.webhookEndpoints.create({
        url: webhookUrl,
        enabled_events: requiredEvents,
      });

      console.log('✅ Webhook created successfully!');
      console.log(`   ID: ${endpoint.id}`);
      console.log(`   URL: ${endpoint.url}`);
      console.log(`   Events: ${endpoint.enabled_events.join(', ')}`);
      console.log(`   Status: ${endpoint.status}`);
      
      console.log(`\n📝 Add this to your Vercel environment variables:`);
      console.log(`   STRIPE_WEBHOOK_SECRET_ACCOUNT=${endpoint.secret}`);
      
      console.log(`\n🚀 Steps to complete setup:`);
      console.log(`   1. Go to Vercel Dashboard: https://vercel.com/toofuturetechnologies/summitsite/settings/environment-variables`);
      console.log(`   2. Add new variable: STRIPE_WEBHOOK_SECRET_ACCOUNT`);
      console.log(`   3. Paste the secret above`);
      console.log(`   4. Redeploy: vercel --prod`);
    }

    console.log('\n✅ Webhook setup complete!');
  } catch (error) {
    console.error('❌ Error setting up webhook:', error.message);
    if (error.type === 'StripeAuthenticationError') {
      console.error('   Invalid or expired Stripe API key');
    }
    process.exit(1);
  }
}

setupWebhook();
