// Test script to check localStorage token
const token = localStorage.getItem('token');
console.log('Token in localStorage:', token ? 'Found' : 'Not found');
if (token) {
  try {
    // Try parsing it as JSON
    const parsedToken = JSON.parse(token);
    console.log('Token is stored as JSON object:', parsedToken);
  } catch (e) {
    console.log('Token is stored as string:', token);
  }
}

// Test fetching users
async function testFetchUsers() {
  console.log('Testing fetch to users endpoint...');
  try {
    // Get token from localStorage
    let authToken = localStorage.getItem('token');
    try {
      // Try parsing it as JSON
      authToken = JSON.parse(authToken);
    } catch {}
    
    const headers = {
      'Content-Type': 'application/json',
      'Authorization': \Bearer \\
    };
    
    console.log('Request headers:', headers);
    
    const response = await fetch('/.netlify/functions/users', { 
      method: 'GET',
      headers: headers
    });
    
    console.log('Response status:', response.status);
    console.log('Response headers:', Object.fromEntries([...response.headers.entries()]));
    
    const contentType = response.headers.get('content-type');
    console.log('Response content type:', contentType);
    
    if (contentType && contentType.includes('application/json')) {
      const data = await response.json();
      console.log('Response data:', data);
    } else {
      const text = await response.text();
      console.log('Response text:', text);
    }
  } catch (error) {
    console.error('Fetch error:', error);
  }
}

testFetchUsers();
