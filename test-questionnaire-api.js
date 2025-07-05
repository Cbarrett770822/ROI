// Test script for questionnaire API
const axios = require('axios');

// Get token from localStorage if running in browser
const getToken = () => {
  if (typeof localStorage !== 'undefined') {
    return localStorage.getItem('token');
  }
  // For Node.js testing, provide a test token here
  return process.env.TEST_TOKEN || 'your-test-token-here';
};

// Create axios instance with auth headers
const api = axios.create({
  baseURL: 'http://localhost:8888', // Netlify dev server
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${getToken()}`
  }
});

// Test functions
const testQuestionnaire = async (companyId) => {
  if (!companyId) {
    console.error('Company ID is required');
    return;
  }

  console.log(`Testing questionnaire API for company ID: ${companyId}`);
  
  try {
    // Test debug endpoint first
    console.log('\n1. Testing debug endpoint...');
    const debugResponse = await api.get(`/.netlify/functions/debug-questionnaire/${companyId}`);
    console.log('Debug response:', JSON.stringify(debugResponse.data, null, 2));
    
    // Test GET questionnaire
    console.log('\n2. Testing GET questionnaire...');
    const getResponse = await api.get(`/.netlify/functions/questionnaire/${companyId}`);
    console.log('GET response:', JSON.stringify(getResponse.data, null, 2));
    
    // Test POST questionnaire with sample answers
    console.log('\n3. Testing POST questionnaire...');
    const sampleAnswers = {
      'q1': '3',
      'q2': '4',
      'q3': '2'
    };
    
    const postResponse = await api.post(
      `/.netlify/functions/questionnaire/${companyId}`, 
      { answers: sampleAnswers }
    );
    console.log('POST response:', JSON.stringify(postResponse.data, null, 2));
    
    // Verify answers were saved
    console.log('\n4. Verifying saved answers...');
    const verifyResponse = await api.get(`/.netlify/functions/questionnaire/${companyId}`);
    console.log('Verification response:', JSON.stringify(verifyResponse.data, null, 2));
    
    console.log('\nAll tests completed successfully!');
  } catch (error) {
    console.error('Error testing questionnaire API:', error);
    if (error.response) {
      console.error('Response data:', error.response.data);
      console.error('Response status:', error.response.status);
      console.error('Response headers:', error.response.headers);
    }
  }
};

// Run the test with a company ID
// In browser, call this function with a valid company ID
// In Node.js, pass the company ID as a command line argument
if (typeof window === 'undefined') {
  const companyId = process.argv[2];
  if (!companyId) {
    console.error('Please provide a company ID as a command line argument');
    process.exit(1);
  }
  testQuestionnaire(companyId);
}

// Export for browser use
if (typeof module !== 'undefined') {
  module.exports = { testQuestionnaire };
}
