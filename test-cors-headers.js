const fetch = require('node-fetch');

// Function to test CORS headers from a Netlify function
async function testCorsHeaders(endpoint) {
  try {
    // First, make an OPTIONS request to simulate the CORS preflight
    const optionsResponse = await fetch(endpoint, {
      method: 'OPTIONS',
      headers: {
        'Origin': 'https://wms-roi.netlify.app',
        'Access-Control-Request-Method': 'GET',
        'Access-Control-Request-Headers': 'Content-Type, Authorization'
      }
    });
    
    console.log(`\n=== OPTIONS request to ${endpoint} ===`);
    console.log('Status:', optionsResponse.status);
    console.log('Headers:');
    
    // Log all headers
    for (const [key, value] of optionsResponse.headers.entries()) {
      console.log(`  ${key}: ${value}`);
    }
    
    // Now make a GET request to check regular response headers
    const getResponse = await fetch(endpoint, {
      headers: {
        'Origin': 'https://wms-roi.netlify.app'
      }
    });
    
    console.log(`\n=== GET request to ${endpoint} ===`);
    console.log('Status:', getResponse.status);
    console.log('Headers:');
    
    // Log all headers
    for (const [key, value] of getResponse.headers.entries()) {
      console.log(`  ${key}: ${value}`);
    }
    
    // Try to parse the response body
    try {
      const body = await getResponse.text();
      console.log('Response body (first 200 chars):', body.substring(0, 200));
    } catch (error) {
      console.log('Error parsing response body:', error.message);
    }
    
  } catch (error) {
    console.error(`Error testing ${endpoint}:`, error.message);
  }
}

// Test multiple endpoints
async function runTests() {
  const baseUrl = 'https://roi-wms-app.netlify.app/.netlify/functions';
  
  // List of endpoints to test
  const endpoints = [
    `${baseUrl}/companies`,
    `${baseUrl}/auth-login`,
    `${baseUrl}/users`,
    `${baseUrl}/auth-logout`
  ];
  
  // Test each endpoint
  for (const endpoint of endpoints) {
    await testCorsHeaders(endpoint);
  }
}

// Run the tests
runTests().catch(console.error);
