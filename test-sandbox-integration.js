#!/usr/bin/env node

// Test Real Onramp Sandbox Integration
const ONRAMP_CONFIG = {
  baseUrl: 'https://api-test.onramp.money',
  apiKey: 'a7KTmnb2Qx8wploYvs9cNMIrLJhWqT',
  apiSecret: 'q8XJvzb1Ns6dyrmUow3eCKLaPtHgMf',
  appId: '1596446'
};

async function testRealEndpoints() {
  console.log('Testing Onramp Sandbox API with provided credentials\n');

  // Test different authentication methods
  const authMethods = [
    {
      name: 'Bearer Token',
      headers: {
        'Authorization': `Bearer ${ONRAMP_CONFIG.apiKey}`,
        'Content-Type': 'application/json'
      }
    },
    {
      name: 'API Key Headers',
      headers: {
        'X-API-Key': ONRAMP_CONFIG.apiKey,
        'X-API-Secret': ONRAMP_CONFIG.apiSecret,
        'X-App-ID': ONRAMP_CONFIG.appId,
        'Content-Type': 'application/json'
      }
    },
    {
      name: 'Basic Auth',
      headers: {
        'Authorization': `Basic ${Buffer.from(`${ONRAMP_CONFIG.apiKey}:${ONRAMP_CONFIG.apiSecret}`).toString('base64')}`,
        'Content-Type': 'application/json'
      }
    }
  ];

  // Common whitelabel endpoints to test
  const endpoints = [
    '/',
    '/api',
    '/api/v1',
    '/health',
    '/status',
    '/ping',
    '/whitelabel',
    '/partners',
    '/widget',
    '/quotes',
    '/transactions',
    '/currencies',
    '/rates'
  ];

  for (const method of authMethods) {
    console.log(`\n=== Testing ${method.name} ===`);
    
    for (const endpoint of endpoints) {
      const url = `${ONRAMP_CONFIG.baseUrl}${endpoint}`;
      
      try {
        const response = await fetch(url, {
          method: 'GET',
          headers: method.headers
        });

        console.log(`GET ${endpoint}: ${response.status} ${response.statusText}`);
        
        if (response.ok) {
          const text = await response.text();
          const preview = text.substring(0, 100).replace(/\n/g, ' ');
          console.log(`✅ Response: ${preview}${text.length > 100 ? '...' : ''}`);
        } else if (response.status === 401) {
          console.log('🔐 Authentication required');
        } else if (response.status === 403) {
          console.log('🚫 Access forbidden');
        }
      } catch (error) {
        console.log(`❌ Error: ${error.message}`);
      }
      
      // Rate limiting
      await new Promise(resolve => setTimeout(resolve, 200));
    }
  }
}

// Test widget URL generation
function testWidgetUrl() {
  console.log('\n=== Widget URL Generation ===');
  
  const params = new URLSearchParams({
    partner_id: ONRAMP_CONFIG.appId,
    amount: '100',
    currency: 'USD',
    crypto_currency: 'XLM',
    user_email: 'test@fiplus.com',
    redirect_url: 'https://fiplus.com/success',
    webhook_url: 'https://fiplus.com/webhook'
  });

  const widgetUrl = `${ONRAMP_CONFIG.baseUrl}/widget?${params.toString()}`;
  console.log('Generated Widget URL:');
  console.log(widgetUrl);
  console.log('\nThis URL would be used to redirect users for payment processing.');
}

async function main() {
  console.log('🚀 Onramp Sandbox Integration Test\n');
  console.log('Credentials:');
  console.log(`Base URL: ${ONRAMP_CONFIG.baseUrl}`);
  console.log(`App ID: ${ONRAMP_CONFIG.appId}`);
  console.log(`API Key: ${ONRAMP_CONFIG.apiKey.substring(0, 8)}...`);
  
  await testRealEndpoints();
  testWidgetUrl();
  
  console.log('\n📋 Summary:');
  console.log('- Testing multiple authentication methods with provided credentials');
  console.log('- Checking for available API endpoints');
  console.log('- Widget URL structure follows standard patterns');
  console.log('- Ready for production implementation once correct endpoints identified');
}

main().catch(console.error);