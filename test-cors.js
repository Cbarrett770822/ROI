// Simple script to test CORS headers on Netlify Functions
const https = require('https');

const API_BASE_URL = 'roi-wms-app.netlify.app';
const FRONTEND_URL = 'https://wms-roi.netlify.app';

// Test endpoints
const endpoints = [
  { path: '/.netlify/functions/companies', method: 'OPTIONS' },
  { path: '/.netlify/functions/auth-login', method: 'OPTIONS' },
  { path: '/.netlify/functions/cors-test', method: 'OPTIONS' }
];

function testEndpoint(endpoint) {
  return new Promise((resolve, reject) => {
    console.log(`Testing ${endpoint.method} ${endpoint.path}...`);
    
    const options = {
      hostname: API_BASE_URL,
      path: endpoint.path,
      method: endpoint.method,
      headers: {
        'Origin': FRONTEND_URL,
        'Access-Control-Request-Method': 'GET',
        'Access-Control-Request-Headers': 'Content-Type, Authorization'
      }
    };

    const req = https.request(options, (res) => {
      console.log(`Status: ${res.statusCode}`);
      console.log('Headers:', JSON.stringify(res.headers, null, 2));
      
      // Check CORS headers
      const corsHeaders = {
        'access-control-allow-origin': res.headers['access-control-allow-origin'],
        'access-control-allow-methods': res.headers['access-control-allow-methods'],
        'access-control-allow-headers': res.headers['access-control-allow-headers']
      };
      
      console.log('CORS Headers:', corsHeaders);
      
      // Validate headers
      if (corsHeaders['access-control-allow-origin'] === '*' || corsHeaders['access-control-allow-origin'] === FRONTEND_URL) {
        console.log('✅ access-control-allow-origin is set');
      } else {
        console.log(`❌ access-control-allow-origin is missing or incorrect: ${corsHeaders['access-control-allow-origin']}`);
      }
      
      console.log('\n');
      
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        if (data) {
          console.log('Response body:', data);
        }
        resolve();
      });
    });

    req.on('error', (error) => {
      console.error(`Error testing ${endpoint.path}: ${error.message}`);
      reject(error);
    });

    req.end();
  });
}

async function runTests() {
  console.log('Testing CORS headers on API endpoints...\n');
  
  for (const endpoint of endpoints) {
    try {
      await testEndpoint(endpoint);
    } catch (error) {
      console.error(`Failed to test ${endpoint.path}: ${error.message}`);
    }
  }
}

// Run the tests
runTests().catch(console.error);
