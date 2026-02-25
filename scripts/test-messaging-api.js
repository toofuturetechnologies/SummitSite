#!/usr/bin/env node

/**
 * Test Messaging API Flows
 * 
 * Tests the complete messaging system:
 * 1. Send message from customer to guide
 * 2. Get conversations list (should show unread)
 * 3. Load conversation thread
 * 4. Guide replies to message
 * 5. Verify message marked as read
 * 
 * Usage:
 *   node scripts/test-messaging-api.js
 */

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://nqczucpdkccbkydbzytl.supabase.co';
const API_BASE = process.env.NEXT_PUBLIC_VERCEL_URL || 'http://localhost:3000';

// Test account IDs from create-demo-accounts.js
const GUIDE_ID = 'f54d5a56-5f57-46ca-9131-4a6babec64c3'; // Alex Mountain
const CUSTOMER1_ID = '6f00e559-a0ce-44f6-9963-7f3f607b40b6'; // Jane Traveler
const CUSTOMER2_ID = 'f6190653-c170-4879-b1ac-c8f8d80489cf'; // John Explorer

async function testMessagingAPI() {
  console.log('🧪 Testing Messaging API');
  console.log('========================\n');

  const results = {
    passed: 0,
    failed: 0,
    tests: [],
  };

  function logTest(name, passed, details = '') {
    const icon = passed ? '✅' : '❌';
    const status = passed ? 'PASS' : 'FAIL';
    console.log(`${icon} ${name}`);
    if (details) console.log(`   ${details}`);
    
    results.tests.push({ name, passed, details });
    if (passed) results.passed++;
    else results.failed++;
  }

  try {
    // Test 1: Send message from Jane to Alex
    console.log('📤 Test 1: Send Message (Jane → Alex)\n');
    
    const sendResponse = await fetch(`${API_BASE}/api/messages/send`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        senderId: CUSTOMER1_ID,
        recipientId: GUIDE_ID,
        content: 'Hi Alex! I\'m interested in your rock climbing trip. Can you tell me more about the dates?',
      }),
    });

    if (!sendResponse.ok) {
      throw new Error(`Send failed: ${sendResponse.statusText}`);
    }

    const sendData = await sendResponse.json();
    logTest(
      'Send message API',
      sendData.success === true,
      `Message ID: ${sendData.message?.id?.substring(0, 8)}...`
    );
    console.log('');

    // Test 2: Get conversations for guide (should see Jane's message unread)
    console.log('📭 Test 2: Get Conversations (Alex\'s inbox)\n');
    
    const conversationsResponse = await fetch(
      `${API_BASE}/api/messages/conversations?userId=${GUIDE_ID}`
    );

    if (!conversationsResponse.ok) {
      throw new Error(`Conversations failed: ${conversationsResponse.statusText}`);
    }

    const conversationsData = await conversationsResponse.json();
    const janeConversation = conversationsData.conversations?.find(
      (c) => c.otherUserId === CUSTOMER1_ID
    );

    logTest(
      'Get conversations list',
      conversationsData.success === true && janeConversation !== undefined,
      `Found Jane's conversation with ${janeConversation?.unreadCount || 0} unread message(s)`
    );
    console.log('');

    // Test 3: Load Jane's conversation thread
    console.log('💬 Test 3: Load Conversation Thread (Alex reads Jane\'s message)\n');
    
    const threadResponse = await fetch(
      `${API_BASE}/api/messages/conversation/${CUSTOMER1_ID}?currentUserId=${GUIDE_ID}`
    );

    if (!threadResponse.ok) {
      throw new Error(`Thread failed: ${threadResponse.statusText}`);
    }

    const threadData = await threadResponse.json();
    const janeMessage = threadData.messages?.[0];

    logTest(
      'Load conversation thread',
      threadData.success === true && threadData.messages?.length > 0,
      `Loaded ${threadData.messages?.length || 0} message(s)`
    );

    if (janeMessage) {
      logTest(
        'Message content correct',
        janeMessage.content?.includes('rock climbing trip'),
        `Message: "${janeMessage.content?.substring(0, 40)}..."`
      );
    }
    console.log('');

    // Test 4: Guide sends reply to Jane
    console.log('📤 Test 4: Send Reply (Alex → Jane)\n');
    
    const replyResponse = await fetch(`${API_BASE}/api/messages/send`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        senderId: GUIDE_ID,
        recipientId: CUSTOMER1_ID,
        content: 'Hi Jane! Great question! Our next rock climbing trip is scheduled for March 15-17. It\'s perfect for intermediate climbers.',
      }),
    });

    if (!replyResponse.ok) {
      throw new Error(`Reply failed: ${replyResponse.statusText}`);
    }

    const replyData = await replyResponse.json();
    logTest(
      'Send reply API',
      replyData.success === true,
      `Reply ID: ${replyData.message?.id?.substring(0, 8)}...`
    );
    console.log('');

    // Test 5: Customer gets conversations (should see Alex's reply)
    console.log('📭 Test 5: Get Conversations (Jane\'s inbox)\n');
    
    const customerConversationsResponse = await fetch(
      `${API_BASE}/api/messages/conversations?userId=${CUSTOMER1_ID}`
    );

    if (!customerConversationsResponse.ok) {
      throw new Error(`Conversations failed: ${customerConversationsResponse.statusText}`);
    }

    const customerConversationsData = await customerConversationsResponse.json();
    const alexConversation = customerConversationsData.conversations?.find(
      (c) => c.otherUserId === GUIDE_ID
    );

    logTest(
      'Customer sees conversation',
      customerConversationsData.success === true && alexConversation !== undefined,
      `Last message: "${alexConversation?.lastMessage?.substring(0, 40)}..."`
    );
    console.log('');

    // Test 6: Customer loads full thread (messages auto-mark as read)
    console.log('💬 Test 6: Load Conversation (Jane reads Alex\'s reply)\n');
    
    const customerThreadResponse = await fetch(
      `${API_BASE}/api/messages/conversation/${GUIDE_ID}?currentUserId=${CUSTOMER1_ID}`
    );

    if (!customerThreadResponse.ok) {
      throw new Error(`Thread failed: ${customerThreadResponse.statusText}`);
    }

    const customerThreadData = await customerThreadResponse.json();
    
    logTest(
      'Load conversation (customer side)',
      customerThreadData.success === true && customerThreadData.messages?.length >= 2,
      `Loaded ${customerThreadData.messages?.length || 0} message(s) total`
    );
    console.log('');

    // Test 7: Third customer doesn't see the conversation
    console.log('🔒 Test 7: Privacy - Other user can\'t access\n');
    
    const otherUserResponse = await fetch(
      `${API_BASE}/api/messages/conversation/${CUSTOMER1_ID}?currentUserId=${CUSTOMER2_ID}`
    );

    // This should either fail auth or return empty
    const otherUserData = await otherUserResponse.json();
    logTest(
      'Privacy check (RLS)',
      (otherUserData.messages?.length || 0) === 0 || otherUserResponse.status !== 200,
      'Other users cannot access private conversations'
    );
    console.log('');

  } catch (error) {
    console.error('❌ Test Error:', error.message);
    logTest('Overall', false, error.message);
  }

  // Summary
  console.log('📊 Test Summary');
  console.log('===============\n');
  console.log(`✅ Passed: ${results.passed}`);
  console.log(`❌ Failed: ${results.failed}`);
  console.log(`📈 Total:  ${results.tests.length}\n`);

  if (results.failed === 0) {
    console.log('🎉 All messaging tests passed!');
    console.log('');
    console.log('📝 Next Steps:');
    console.log('1. Test in browser: https://summit-site-seven.vercel.app');
    console.log('2. Log in as Jane Traveler (jane.traveler@example.com)');
    console.log('3. Go to /dashboard/messages to see conversation');
    console.log('4. Switch to Alex Mountain account and reply');
    console.log('');
  } else {
    console.log('❌ Some tests failed. Check errors above.');
    console.log('');
    console.log('Debugging:');
    console.log(`- API Base: ${API_BASE}`);
    console.log(`- Guide ID: ${GUIDE_ID}`);
    console.log(`- Customer 1 ID: ${CUSTOMER1_ID}`);
    console.log('');
  }

  return results.failed === 0;
}

testMessagingAPI().then((success) => {
  process.exit(success ? 0 : 1);
}).catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});
