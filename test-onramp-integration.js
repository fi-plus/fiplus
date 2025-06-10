#!/usr/bin/env node

// Test Onramp Whitelabel Integration
// Based on https://docs.onramp.money/onramp-whitelabel-unlisted

const ONRAMP_CONFIG = {
  baseUrl: 'https://api-test.onramp.money',
  apiKey: process.env.ONRAMP_API_KEY || 'a7KTmnb2Qx8wploYvs9cNMIrLJhWqT',
  apiSecret: process.env.ONRAMP_SECRET_KEY || 'q8XJvzb1Ns6dyrmUow3eCKLaPtHgMf',
  appId: process.env.ONRAMP_APP_ID || '1596446'
};

async function testOnrampEndpoints() {
  console.log('🔍 Testing Onramp Whitelabel API Integration');
  console.log('📚 Based on: https://docs.onramp.money/onramp-whitelabel-unlisted\n');

  const endpoints = [
    // Widget-based endpoints (most likely)
    '/widget/create',
    '/widget/session',
    '/api/widget/create',
    '/api/widget/session',
    
    // Transaction endpoints
    '/transaction/status',
    '/transactions',
    '/api/transactions',
    
    // Quote endpoints
    '/quote',
    '/quotes',
    '/api/quote',
    '/api/quotes',
    
    // Currency endpoints
    '/currencies',
    '/api/currencies',
    '/supported-currencies',
    
    // User/KYC endpoints
    '/user/kyc',
    '/api/user/kyc',
    '/kyc/status'
  ];

  for (const endpoint of endpoints) {
    await testEndpoint(endpoint);
    // Rate limiting pause
    await new Promise(resolve => setTimeout(resolve, 500));
  }
}

async function testEndpoint(endpoint) {
  const url = `${ONRAMP_CONFIG.baseUrl}${endpoint}`;
  
  const authHeaders = {
    'Authorization': `Bearer ${ONRAMP_CONFIG.apiKey}`,
    'X-API-Key': ONRAMP_CONFIG.apiKey,
    'X-API-Secret': ONRAMP_CONFIG.apiSecret,
    'X-App-ID': ONRAMP_CONFIG.appId,
    'Content-Type': 'application/json'
  };

  try {
    // Test GET request
    const getResponse = await fetch(url, {
      method: 'GET',
      headers: authHeaders
    });

    console.log(`GET ${endpoint}: ${getResponse.status} ${getResponse.statusText}`);
    
    if (getResponse.ok) {
      const data = await getResponse.text();
      console.log(`✅ Success: ${data.substring(0, 200)}${data.length > 200 ? '...' : ''}\n`);
      return;
    }

    // Test POST request for widget creation
    if (endpoint.includes('widget') || endpoint.includes('session')) {
      const postResponse = await fetch(url, {
        method: 'POST',
        headers: authHeaders,
        body: JSON.stringify({
          amount: 100,
          currency: 'USD',
          crypto_currency: 'XLM',
          user_email: 'test@fiplus.com',
          redirect_url: 'https://fiplus.com/success'
        })
      });

      console.log(`POST ${endpoint}: ${postResponse.status} ${postResponse.statusText}`);
      
      if (postResponse.ok) {
        const data = await postResponse.text();
        console.log(`✅ Success: ${data.substring(0, 200)}${data.length > 200 ? '...' : ''}\n`);
        return;
      }
    }

  } catch (error) {
    console.log(`❌ Error ${endpoint}: ${error.message}`);
  }
  
  console.log(''); // Empty line for readability
}

async function testWebhookEndpoint() {
  console.log('🔗 Testing Webhook Endpoint Integration\n');
  
  const webhookUrl = 'http://localhost:5000/api/webhooks/onramp';
  const testPayload = {
    type: 'transaction.completed',
    transactionId: 'test_txn_12345',
    userId: '1',
    amount: '100.00',
    currency: 'USD',
    fee: '2.50',
    paymentMethod: 'bank_transfer'
  };

  try {
    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Onramp-Signature': 'test_signature'
      },
      body: JSON.stringify(testPayload)
    });

    console.log(`Webhook Test: ${response.status} ${response.statusText}`);
    
    if (response.ok) {
      const result = await response.json();
      console.log('✅ Webhook Response:', JSON.stringify(result, null, 2));
    } else {
      console.log('❌ Webhook failed');
    }
  } catch (error) {
    console.log('❌ Webhook Error:', error.message);
  }
}

async function main() {
  console.log('🚀 fi.plus Onramp Integration Test Suite\n');
  console.log('Configuration:');
  console.log(`Base URL: ${ONRAMP_CONFIG.baseUrl}`);
  console.log(`App ID: ${ONRAMP_CONFIG.appId}`);
  console.log(`API Key: ${ONRAMP_CONFIG.apiKey.substring(0, 8)}...`);
  console.log('');

  await testOnrampEndpoints();
  await testWebhookEndpoint();
  
  console.log('📋 Test Summary:');
  console.log('- If all endpoints return 404, API documentation is needed from Onramp');
  console.log('- If authentication errors (401/403), check API credentials');
  console.log('- If webhook test passes, local integration is working');
  console.log('- Next step: Contact Onramp support for proper API documentation');
}

// Run tests
main().catch(console.error);