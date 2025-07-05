const mongoose = require("mongoose");
const { getCorsHeaders, handleCors, addCorsHeaders } = require('./utils/corsHeaders');

exports.handler = async function(event, context) {
  // Handle CORS preflight requests first
  const corsResponse = handleCors(event);
  if (corsResponse) {
    return corsResponse;
  }

  // For faster cold starts
  context.callbackWaitsForEmptyEventLoop = false;
  
  // Only allow POST requests
  if (event.httpMethod !== 'POST') {
    return addCorsHeaders({
      statusCode: 405,
      body: JSON.stringify({ message: 'Method Not Allowed' }, event)
    });
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
    
    return addCorsHeaders({
      statusCode: 200,
      body: JSON.stringify({ 
        message: 'Logout successful',
        success: true
      }, event)
    });
  } catch (err) {
    console.error('Logout error:', err);
    return addCorsHeaders({
      statusCode: 500,
      body: JSON.stringify({ 
        message: 'Logout failed', 
        error: err.message 
      }, event)
    });
  }
};


// Remember to wrap all responses with addCorsHeaders(response, event);
