// Real Onramp API Test with Correct Authentication
import crypto from 'crypto';

const config = {
  baseUrl: 'https://api-test.onramp.money',
  appId: '1596446',
  apiKey: 'a7KTmnb2Qx8wploYvs9cNMIrLJhWqT',
  secret: 'q8XJvzb1Ns6dyrmUow3eCKLaPtHgMf'
};

// Generate correct authentication signature
function generatePayloadAndSignature(body = {}) {
  const timestamp = Date.now().toString();
  const obj = { body, timestamp };
  
  const payloadString = JSON.stringify(obj);
  const payloadBuffer = Buffer.from(payloadString, 'utf-8');
  const payload = payloadBuffer.toString('base64');
  
  const hmac = crypto.createHmac('sha512', config.secret);
  hmac.update(payload);
  const signature = hmac.digest('hex');
  
  return { payload, signature, timestamp };
}

// Make authenticated request
async function makeRequest(method, path, body = {}) {
  try {
    const { payload, signature, timestamp } = generatePayloadAndSignature(body);
    
    const headers = {
      'Content-Type': 'application/json',
      'app-id': config.appId,
      'apikey': config.apiKey,
      'payload': payload,
      'signature': signature,
      'timestamp': timestamp
    };
    
    console.log(`Testing ${method} ${path}`);
    
    const response = await fetch(`${config.baseUrl}${path}`, {
      method,
      headers,
      body: method !== 'GET' ? JSON.stringify(body) : undefined
    });
    
    console.log(`Status: ${response.status}`);
    
    if (response.ok) {
      const data = await response.json();
      console.log('✅ Success:', JSON.stringify(data, null, 2));
      return data;
    } else {
      const error = await response.text();
      console.log('❌ Error:', error);
      return null;
    }
  } catch (error) {
    console.log('❌ Request failed:', error.message);
    return null;
  }
}

async function testRealEndpoints() {
  console.log('🚀 Testing Real Onramp API Endpoints\n');
  
  // Test KYC URL creation
  const kycData = {
    email: "test@fiplus.com",
    phoneNumber: "+1-555-123-4567",
    type: "INDIVIDUAL",
    clientCustomerId: "fiplus-user-001"
  };
  
  const kycResult = await makeRequest('POST', '/onramp/api/v2/whiteLabel/kyc/url', kycData);
  
  if (kycResult && kycResult.status === 1) {
    console.log('\n🎉 KYC URL Creation: SUCCESS');
    
    const customerId = kycResult.customerId || kycResult.data?.customerId;
    
    if (customerId) {
      console.log(`Customer ID: ${customerId}`);
      
      // Test quote generation
      const quoteData = {
        fromCurrency: 'USD',
        toCurrency: 'XLM',
        fromAmount: 100,
        chain: 'XLM',
        paymentMethodType: 'BANK_TRANSFER'
      };
      
      console.log('\nTesting Quote Generation...');
      await makeRequest('POST', '/onramp/api/v2/whiteLabel/onramp/quote', quoteData);
    }
  }
  
  console.log('\n✅ API authentication working with correct method');
}

testRealEndpoints().catch(console.error);