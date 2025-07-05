// Test script to simulate frontend API calls
const https = require('https');

// Configuration
const API_BASE_URL = 'https://wms-roi.netlify.app';
const FRONTEND_ORIGIN = 'https://wms-roi.netlify.app';

// Test credentials
const TEST_USERNAME = 'admin'; // Replace with a valid test username
const TEST_PASSWORD = 'admin123'; // Replace with a valid test password

// Function to make a request to the API
function makeRequest(options) {
  return new Promise((resolve, reject) => {
    const req = https.request(options, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        console.log(`Status: ${res.statusCode}`);
        
        if (data) {
          try {
            const jsonData = JSON.parse(data);
            console.log('Response:', typeof jsonData === 'object' ? 'Data received successfully' : jsonData);
            resolve({ status: res.statusCode, headers: res.headers, data: jsonData });
          } catch (e) {
            console.log('Response (text):', data);
            resolve({ status: res.statusCode, headers: res.headers, data });
          }
        } else {
          resolve({ status: res.statusCode, headers: res.headers });
        }
      });
    });
    
    req.on('error', (error) => {
      console.error(`Error: ${error.message}`);
      reject(error);
    });
    
    if (options.body) {
      req.write(options.body);
    }
    
    req.end();
  });
}

// Test login to get a token
async function testLogin() {
  console.log('=== Testing Login API ===');
  
  const loginOptions = {
    hostname: new URL(API_BASE_URL).hostname,
    path: '/.netlify/functions/auth-login',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Origin': FRONTEND_ORIGIN
    },
    body: JSON.stringify({
      username: TEST_USERNAME,
      password: TEST_PASSWORD
    })
  };
  
  try {
    console.log(`Making login request to: ${API_BASE_URL}${loginOptions.path}`);
    const response = await makeRequest(loginOptions);
    
    if (response.status === 200 && response.data.token) {
      console.log('✅ Login successful, token received');
      return response.data.token;
    } else {
      console.log('❌ Login failed');
      return null;
    }
  } catch (error) {
    console.error('❌ Login request failed:', error.message);
    return null;
  }
}

// Test companies endpoint with token
async function testCompanies(token) {
  console.log('\n=== Testing Companies API ===');
  
  if (!token) {
    console.log('❌ No token available, skipping companies test');
    return;
  }
  
  // First test OPTIONS request for CORS preflight
  const optionsRequest = {
    hostname: new URL(API_BASE_URL).hostname,
    path: '/.netlify/functions/companies',
    method: 'OPTIONS',
    headers: {
      'Origin': FRONTEND_ORIGIN,
      'Access-Control-Request-Method': 'GET',
      'Access-Control-Request-Headers': 'Content-Type, Authorization'
    }
  };
  
  console.log(`Making OPTIONS preflight request to: ${API_BASE_URL}${optionsRequest.path}`);
  try {
    const optionsResponse = await makeRequest(optionsRequest);
    
    if (optionsResponse.status === 204) {
      console.log('✅ OPTIONS preflight request successful');
      
      // Check CORS headers
      const corsHeaders = {
        'access-control-allow-origin': optionsResponse.headers['access-control-allow-origin'],
        'access-control-allow-methods': optionsResponse.headers['access-control-allow-methods'],
        'access-control-allow-headers': optionsResponse.headers['access-control-allow-headers']
      };
      
      console.log('CORS Headers:', corsHeaders);
      
      // Validate headers
      if (corsHeaders['access-control-allow-origin'] === '*' || 
          corsHeaders['access-control-allow-origin'] === FRONTEND_ORIGIN) {
        console.log('✅ access-control-allow-origin is correctly set');
      } else {
        console.log(`❌ access-control-allow-origin is incorrect: ${corsHeaders['access-control-allow-origin']}`);
      }
      
      if (corsHeaders['access-control-allow-methods'] && 
          corsHeaders['access-control-allow-methods'].includes('GET')) {
        console.log('✅ access-control-allow-methods includes GET');
      } else {
        console.log(`❌ access-control-allow-methods is incorrect: ${corsHeaders['access-control-allow-methods']}`);
      }
      
      if (corsHeaders['access-control-allow-headers'] && 
          corsHeaders['access-control-allow-headers'].includes('Authorization')) {
        console.log('✅ access-control-allow-headers includes Authorization');
      } else {
        console.log(`❌ access-control-allow-headers is incorrect: ${corsHeaders['access-control-allow-headers']}`);
      }
    } else {
      console.log(`❌ OPTIONS preflight request failed with status: ${optionsResponse.status}`);
    }
    
    // Now test the actual GET request
    console.log('\nMaking GET request to companies endpoint...');
    const getRequest = {
      hostname: new URL(API_BASE_URL).hostname,
      path: '/.netlify/functions/companies',
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        'Origin': FRONTEND_ORIGIN
      }
    };
    
    const getResponse = await makeRequest(getRequest);
    
    if (getResponse.status === 200) {
      console.log('✅ GET companies request successful');
      if (Array.isArray(getResponse.data)) {
        console.log(`Retrieved ${getResponse.data.length} companies`);
      }
    } else {
      console.log(`❌ GET companies request failed with status: ${getResponse.status}`);
    }
  } catch (error) {
    console.error('❌ Companies request failed:', error.message);
  }
}

// Run all tests
async function runTests() {
  console.log('Starting API tests...\n');
  
  // Test login first to get a token
  const token = await testLogin();
  
  // Test companies endpoint with token
  await testCompanies(token);
  
  console.log('\nAPI tests completed.');
}

// Run the tests
runTests().catch(console.error);
