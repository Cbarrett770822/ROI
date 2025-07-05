/**
 * Unified Deployment Verification Script
 * 
 * This script verifies that the unified deployment is working correctly
 * by testing API endpoints and checking for CORS-related issues.
 * 
 * Run this script after deploying to Netlify to verify everything works.
 */

const axios = require('axios');

// Configuration
const config = {
  // Change this to your Netlify URL when testing the production deployment
  baseUrl: 'https://wms-roi.netlify.app',
  
  // Test credentials - update these with valid credentials for your system
  credentials: {
    username: 'admin',
    password: 'admin123'
  },
  
  // Endpoints to test
  endpoints: [
    {
      name: 'Login',
      path: '/.netlify/functions/auth-login',
      method: 'post',
      data: credentials => ({ 
        username: credentials.username, 
        password: credentials.password 
      }),
      requiresAuth: false
    },
    {
      name: 'Companies',
      path: '/.netlify/functions/companies',
      method: 'get',
      requiresAuth: true
    },
    {
      name: 'Users',
      path: '/.netlify/functions/users',
      method: 'get',
      requiresAuth: true
    },
    {
      name: 'Test CORS',
      path: '/.netlify/functions/test-cors',
      method: 'get',
      requiresAuth: false
    }
  ]
};

// Test runner
async function runTests() {
  console.log('=== UNIFIED DEPLOYMENT VERIFICATION ===');
  console.log(`Testing against: ${config.baseUrl}`);
  console.log('Date:', new Date().toISOString());
  console.log('');
  
  let token = null;
  let allPassed = true;
  
  // Run tests sequentially
  for (const endpoint of config.endpoints) {
    console.log(`Testing ${endpoint.name} endpoint (${endpoint.path})...`);
    
    try {
      const headers = {};
      
      // Add authorization header if required and token is available
      if (endpoint.requiresAuth) {
        if (!token) {
          console.log(`⚠️ Skipping ${endpoint.name} - No authentication token available`);
          continue;
        }
        headers.Authorization = `Bearer ${token}`;
      }
      
      // Prepare request data
      const data = endpoint.data ? endpoint.data(config.credentials) : undefined;
      
      // Make the request
      const response = await axios({
        method: endpoint.method,
        url: `${config.baseUrl}${endpoint.path}`,
        headers,
        data
      });
      
      // Check response
      if (response.status >= 200 && response.status < 300) {
        console.log(`✅ ${endpoint.name} - Success (${response.status})`);
        
        // Save token from login response
        if (endpoint.name === 'Login' && response.data.token) {
          token = response.data.token;
          console.log('   Token received and saved for subsequent requests');
        }
        
        // Log response data summary
        if (response.data) {
          if (typeof response.data === 'object') {
            const keys = Object.keys(response.data);
            console.log(`   Response contains: ${keys.join(', ')}`);
          } else {
            console.log(`   Response: ${response.data.substring(0, 100)}...`);
          }
        }
      } else {
        console.log(`❌ ${endpoint.name} - Unexpected status: ${response.status}`);
        allPassed = false;
      }
      
      // Check for CORS headers - in unified deployment, we shouldn't have these
      const corsHeaders = Object.keys(response.headers).filter(h => 
        h.toLowerCase().includes('access-control'));
      
      if (corsHeaders.length > 0) {
        console.log(`⚠️ ${endpoint.name} - Found CORS headers: ${corsHeaders.join(', ')}`);
        console.log('   This is unexpected in a unified deployment!');
      } else {
        console.log(`✅ ${endpoint.name} - No CORS headers (as expected in unified deployment)`);
      }
      
    } catch (error) {
      console.error(`❌ ${endpoint.name} - Error:`, error.message);
      if (error.response) {
        console.error(`   Status: ${error.response.status}`);
        console.error(`   Data:`, error.response.data);
      }
      allPassed = false;
    }
    
    console.log(''); // Add spacing between tests
  }
  
  // Final summary
  console.log('=== VERIFICATION SUMMARY ===');
  if (allPassed) {
    console.log('✅ All tests passed! The unified deployment appears to be working correctly.');
  } else {
    console.log('❌ Some tests failed. Please check the logs above for details.');
  }
}

// Run the tests
runTests().catch(error => {
  console.error('Unhandled error during tests:', error);
});
