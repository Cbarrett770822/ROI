// Simple script to test the API directly
const https = require('https');

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
        console.log('Headers:', JSON.stringify(res.headers, null, 2));
        
        if (data) {
          try {
            const jsonData = JSON.parse(data);
            console.log('Response:', JSON.stringify(jsonData, null, 2));
          } catch (e) {
            console.log('Response (text):', data);
          }
        }
        
        resolve({ status: res.statusCode, headers: res.headers, data });
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

// Test login first to get a token
async function testLogin() {
  console.log('Testing login...');
  
  const loginOptions = {
    hostname: 'roi-wms-app.netlify.app',
    path: '/.netlify/functions/auth-login',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Origin': 'https://wms-roi.netlify.app'
    },
    body: JSON.stringify({
      username: 'admin',
      password: 'admin123'
    })
  };
  
  try {
    const response = await makeRequest(loginOptions);
    
    if (response.status === 200) {
      let token;
      try {
        const jsonData = JSON.parse(response.data);
        token = jsonData.token;
        console.log('Login successful, token received');
        
        // Now test the companies endpoint with the token
        await testCompanies(token);
      } catch (e) {
        console.error('Failed to parse login response:', e.message);
      }
    } else {
      console.log('Login failed');
    }
  } catch (error) {
    console.error('Login request failed:', error.message);
  }
}

// Test companies endpoint with token
async function testCompanies(token) {
  console.log('\nTesting companies endpoint with token...');
  
  // First test OPTIONS request for CORS preflight
  const optionsRequest = {
    hostname: 'roi-wms-app.netlify.app',
    path: '/.netlify/functions/companies',
    method: 'OPTIONS',
    headers: {
      'Origin': 'https://wms-roi.netlify.app',
      'Access-Control-Request-Method': 'GET',
      'Access-Control-Request-Headers': 'Content-Type, Authorization'
    }
  };
  
  console.log('Sending OPTIONS preflight request...');
  try {
    await makeRequest(optionsRequest);
    
    // Now test the actual GET request
    console.log('\nSending GET request to companies endpoint...');
    const getRequest = {
      hostname: 'roi-wms-app.netlify.app',
      path: '/.netlify/functions/companies',
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        'Origin': 'https://wms-roi.netlify.app'
      }
    };
    
    await makeRequest(getRequest);
  } catch (error) {
    console.error('Companies request failed:', error.message);
  }
}

// Run the tests
testLogin().catch(console.error);
