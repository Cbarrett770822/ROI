const axios = require('axios');

// Configuration
const NETLIFY_URL = 'https://wms-roi.netlify.app'; // The actual Netlify URL for the ROI project
const API_BASE = `${NETLIFY_URL}/.netlify/functions`;
const TEST_USERNAME = 'admin'; // Replace with a valid username
const TEST_PASSWORD = 'admin123'; // Replace with a valid password

// Store the JWT token after login
let authToken = '';

// Helper function to log responses with colors
const logResponse = (endpoint, success, data, error = null) => {
  const color = success ? '\x1b[32m' : '\x1b[31m'; // Green for success, Red for failure
  const reset = '\x1b[0m';
  
  console.log(`${color}${success ? '✓' : '✗'} ${endpoint}${reset}`);
  
  if (success) {
    console.log('  Response:', typeof data === 'object' ? JSON.stringify(data, null, 2) : data);
  } else {
    console.log('  Error:', error?.message || error);
    if (error?.response?.data) {
      console.log('  Response data:', error.response.data);
    }
    if (error?.response?.headers) {
      console.log('  Response headers:', error.response.headers);
    }
  }
  console.log(); // Empty line for readability
};

// Helper function to check CORS headers
const checkCorsHeaders = (headers) => {
  const corsHeaders = {
    'access-control-allow-origin': headers['access-control-allow-origin'],
    'access-control-allow-methods': headers['access-control-allow-methods'],
    'access-control-allow-headers': headers['access-control-allow-headers'],
  };
  
  console.log('  CORS Headers:', corsHeaders);
  
  // Check if essential CORS headers are present
  const hasEssentialHeaders = 
    corsHeaders['access-control-allow-origin'] && 
    corsHeaders['access-control-allow-methods'] && 
    corsHeaders['access-control-allow-headers'];
    
  return hasEssentialHeaders;
};

// Test functions
async function testLogin() {
  try {
    console.log('Testing login endpoint...');
    const response = await axios.post(`${API_BASE}/auth-login`, {
      username: TEST_USERNAME,
      password: TEST_PASSWORD
    });
    
    authToken = response.data.token;
    const corsHeadersOk = checkCorsHeaders(response.headers);
    
    logResponse('Login', true, {
      token: authToken ? `${authToken.substring(0, 20)}...` : 'No token received',
      user: response.data.user,
      corsHeadersOk
    });
    
    return true;
  } catch (error) {
    logResponse('Login', false, null, error);
    return false;
  }
}

async function testCorsTest() {
  try {
    console.log('Testing CORS test endpoint...');
    const response = await axios.get(`${API_BASE}/cors-test`);
    
    const corsHeadersOk = checkCorsHeaders(response.headers);
    
    logResponse('CORS Test', true, {
      data: response.data,
      corsHeadersOk
    });
    
    return true;
  } catch (error) {
    logResponse('CORS Test', false, null, error);
    return false;
  }
}

async function testUsers() {
  try {
    console.log('Testing users endpoint with authentication...');
    const response = await axios.get(`${API_BASE}/users`, {
      headers: {
        'Authorization': `Bearer ${authToken}`
      }
    });
    
    const corsHeadersOk = checkCorsHeaders(response.headers);
    
    logResponse('Users', true, {
      userCount: response.data.users?.length || 0,
      corsHeadersOk
    });
    
    return true;
  } catch (error) {
    logResponse('Users', false, null, error);
    return false;
  }
}

async function testDebugQuestionnaire() {
  try {
    console.log('Testing debug-questionnaire endpoint with authentication...');
    const response = await axios.get(`${API_BASE}/debug-questionnaire`, {
      headers: {
        'Authorization': `Bearer ${authToken}`
      }
    });
    
    const corsHeadersOk = checkCorsHeaders(response.headers);
    
    logResponse('Debug Questionnaire', true, {
      data: response.data,
      corsHeadersOk
    });
    
    return true;
  } catch (error) {
    logResponse('Debug Questionnaire', false, null, error);
    return false;
  }
}

async function testOptionsRequest() {
  try {
    console.log('Testing OPTIONS preflight request...');
    const response = await axios({
      method: 'OPTIONS',
      url: `${API_BASE}/users`,
      headers: {
        'Access-Control-Request-Method': 'GET',
        'Access-Control-Request-Headers': 'Authorization,Content-Type',
        'Origin': 'http://localhost:8888'
      }
    });
    
    const corsHeadersOk = checkCorsHeaders(response.headers);
    
    logResponse('OPTIONS Preflight', true, {
      status: response.status,
      corsHeadersOk
    });
    
    return true;
  } catch (error) {
    // For OPTIONS, we might get a 204 with empty body which axios might treat as an error
    if (error.response && error.response.status === 204) {
      const corsHeadersOk = checkCorsHeaders(error.response.headers);
      
      logResponse('OPTIONS Preflight', true, {
        status: error.response.status,
        corsHeadersOk
      });
      
      return true;
    }
    
    logResponse('OPTIONS Preflight', false, null, error);
    return false;
  }
}

// Run all tests
async function runTests() {
  console.log(`\n🧪 Testing Netlify backend at: ${API_BASE}\n`);
  
  // First test login to get the token
  const loginSuccess = await testLogin();
  if (!loginSuccess) {
    console.log('\n❌ Login failed, cannot continue with authenticated tests.\n');
    // Still run the CORS test and OPTIONS test which don't require authentication
    await testCorsTest();
    await testOptionsRequest();
    return;
  }
  
  // Run all other tests
  await testCorsTest();
  await testOptionsRequest();
  await testUsers();
  await testDebugQuestionnaire();
  
  console.log('\n✅ All tests completed!\n');
}

// Run the tests
runTests().catch(error => {
  console.error('Test runner error:', error);
});
