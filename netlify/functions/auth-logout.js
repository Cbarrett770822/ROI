const mongoose = require("mongoose");

exports.handler = async function(event, context) {
  // For faster cold starts
  context.callbackWaitsForEmptyEventLoop = false;
  
  // Only allow POST requests
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ message: 'Method Not Allowed' })
    };
  }
  
  try {
    // Get token from authorization header
    const token = event.headers.authorization?.split(' ')[1];
    
    // In a real-world application, you might want to:
    // 1. Add the token to a blacklist
    // 2. Revoke any refresh tokens
    // 3. Clear any server-side sessions
    
    // For this simple application, we'll just return a success response
    // The actual logout happens on the client side by clearing the token from Redux and localStorage
    
    return {
      statusCode: 200,
      body: JSON.stringify({ 
        message: 'Logout successful',
        success: true
      })
    };
  } catch (err) {
    console.error('Logout error:', err);
    return {
      statusCode: 500,
      body: JSON.stringify({ 
        message: 'Logout failed', 
        error: err.message 
      })
    };
  }
};
