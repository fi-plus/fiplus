// Test script for real API integrations
const API_BASE = 'https://api-test.onramp.money';
const API_KEY = 'a7KTmnb2Qx8wploYvs9cNMIrLJhWqT';
const API_SECRET = 'q8XJvzb1Ns6dyrmUow3eCKLaPtHgMf';
const APP_ID = '1596446';

async function testOnrampAPI() {
  console.log('Testing Onramp API connectivity...');
  
  try {
    // Test basic API connectivity
    const response = await fetch(`${API_BASE}/health`, {
      headers: {
        'Authorization': `Bearer ${API_KEY}`,
        'X-API-Key': API_KEY,
        'X-API-Secret': API_SECRET,
        'X-App-ID': APP_ID
      }
    });
    
    console.log('API Status:', response.status);
    console.log('Response:', await response.text());
    
    // Test quote endpoint
    const quoteResponse = await fetch(`${API_BASE}/onramp/quote`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${API_KEY}`,
        'X-API-Key': API_KEY,
        'X-API-Secret': API_SECRET,
        'X-App-ID': APP_ID
      },
      body: JSON.stringify({
        fiatCurrency: 'USD',
        cryptoCurrency: 'XLM',
        fiatAmount: 100
      })
    });
    
    console.log('Quote Status:', quoteResponse.status);
    console.log('Quote Response:', await quoteResponse.text());
    
  } catch (error) {
    console.error('API Test Failed:', error);
  }
}

// Run test
testOnrampAPI();