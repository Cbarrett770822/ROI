// Test script to verify JWT token verification locally
const jwt = require('jsonwebtoken');

// Use the same JWT secret as auth-login.js
const JWT_SECRET = process.env.JWT_SECRET || 'changeme-secret';

// Sample token from the API test
const sampleToken = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI2ODY2OTY2ODYxZjdhMWRkZWZjMTdkNDIiLCJ1c2VybmFtZSI6ImFkbWluIiwicm9sZSI6ImFkbWluIiwiaWF0IjoxNzUxNzA0MDgyLCJleHAiOjE3NTE3MTEyODJ9.Zx0aDhXDEZ8dhj6PC7_5_7yJJgLE2EZgHvx-sDfxjto";

// Mock event object
const mockEvent = {
  headers: {
    authorization: `Bearer ${sampleToken}`
  }
};

// Verify token function (copied from companies.js with our changes)
const verifyToken = (event) => {
  try {
    const token = event.headers.authorization?.split(' ')[1];
    if (!token) {
      return { isValid: false, error: 'No token provided' };
    }

    console.log('Attempting to verify token with secret:', JWT_SECRET);
    const decoded = jwt.verify(token, JWT_SECRET);
    console.log('Token successfully verified. Decoded payload:', decoded);
    return { isValid: true, user: decoded };
  } catch (error) {
    console.error('Token verification error:', error.message);
    return { isValid: false, error: 'Invalid token' };
  }
};

// Test the token verification
console.log('Testing token verification with local changes...');
const result = verifyToken(mockEvent);
console.log('Verification result:', result);

// Try to decode the token without verification to see what's inside
try {
  const decoded = jwt.decode(sampleToken);
  console.log('\nToken decoded (without verification):', decoded);
} catch (error) {
  console.error('Error decoding token:', error.message);
}

// Create a new token with the same secret to test signing
try {
  const payload = {
    userId: '123456',
    username: 'testuser',
    role: 'user'
  };
  
  console.log('\nCreating a new test token with payload:', payload);
  const newToken = jwt.sign(payload, JWT_SECRET, { expiresIn: '1h' });
  console.log('New token created:', newToken);
  
  // Verify the new token
  const verifiedNewToken = jwt.verify(newToken, JWT_SECRET);
  console.log('New token verified successfully:', verifiedNewToken);
} catch (error) {
  console.error('Error creating or verifying new token:', error.message);
}
