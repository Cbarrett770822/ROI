/**
 * Test script for unified deployment
 * 
 * This script tests API endpoints using relative paths to verify
 * that the unified deployment approach works correctly.
 */

const axios = require('axios');

// Configuration
const config = {
  baseUrl: 'http://localhost:8888', // Local development URL
  // For production testing, use: 'https://wms-roi.netlify.app'
  endpoints: {
    login: '/.netlify/functions/auth-login',
    companies: '/.netlify/functions/companies',
    testCors: '/.netlify/functions/test-cors'
  },
  credentials: {
    username: 'admin',
    password: 'admin123'
  }
};

// Test functions
async function testLogin() {
  console.log('\n--- Testing Login API ---');
  try {
    const response = await axios.post(`${config.baseUrl}${config.endpoints.login}`, {
      username: config.credentials.username,
      password: config.credentials.password
    });
    
    console.log('✅ Login successful');
    console.log('Token received:', response.data.token ? '✅ Yes' : '❌ No');
    console.log('User data received:', response.data.user ? '✅ Yes' : '❌ No');
    
    return response.data.token;
  } catch (error) {
    console.error('❌ Login failed:', error.response?.data || error.message);
    return null;
  }
}

async function testCompanies(token) {
  console.log('\n--- Testing Companies API ---');
  if (!token) {
    console.error('❌ No token available, skipping companies test');
    return;
  }
  
  try {
    const response = await axios.get(`${config.baseUrl}${config.endpoints.companies}`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    
    console.log('✅ Companies API call successful');
    console.log('Number of companies:', response.data.length);
    console.log('Sample company:', response.data[0] || 'No companies found');
    
    return response.data;
  } catch (error) {
    console.error('❌ Companies API call failed:', error.response?.data || error.message);
    return null;
  }
}

async function testCreateCompany(token) {
  console.log('\n--- Testing Company Creation ---');
  if (!token) {
    console.error('❌ No token available, skipping company creation test');
    return;
  }
  
  const companyName = `Test Company ${new Date().toISOString()}`;
  
  try {
    const response = await axios.post(`${config.baseUrl}${config.endpoints.companies}`, {
      name: companyName
    }, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    
    console.log('✅ Company creation successful');
    console.log('Created company:', response.data);
    
    return response.data;
  } catch (error) {
    console.error('❌ Company creation failed:', error.response?.data || error.message);
    return null;
  }
}

async function testCorsEndpoint() {
  console.log('\n--- Testing CORS Test Endpoint ---');
  try {
    const response = await axios.get(`${config.baseUrl}${config.endpoints.testCors}`);
    
    console.log('✅ CORS test endpoint call successful');
    console.log('Response:', response.data);
    
    return response.data;
  } catch (error) {
    console.error('❌ CORS test endpoint call failed:', error.response?.data || error.message);
    return null;
  }
}

// Main test function
async function runTests() {
  console.log('=== UNIFIED DEPLOYMENT TEST SCRIPT ===');
  console.log(`Testing against: ${config.baseUrl}`);
  console.log('Date:', new Date().toISOString());
  
  try {
    // Test login
    const token = await testLogin();
    
    // Test companies API
    await testCompanies(token);
    
    // Test company creation
    await testCreateCompany(token);
    
    // Test CORS endpoint
    await testCorsEndpoint();
    
    console.log('\n=== TEST SUMMARY ===');
    console.log('All tests completed. Check logs above for results.');
  } catch (error) {
    console.error('\n❌ Unexpected error during tests:', error);
  }
}

// Run the tests
runTests();
