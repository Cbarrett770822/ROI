// Import corsHeaders from the same directory
const corsUtils = require('./corsHeaders');
const { getCorsHeaders, handleCors, addCorsHeaders } = corsUtils;

/**
 * Middleware to add CORS support to Netlify Functions
 * @param {Function} handler - The original handler function
 * @returns {Function} - Enhanced handler with CORS support
 */
const withCors = (handler) => {
  return async (event, context) => {
    // Handle preflight requests
    const corsResponse = handleCors(event);
    if (corsResponse) {
      return corsResponse;
    }
    
    try {
      // Call the original handler
      const response = await handler(event, context);
      
      // Add CORS headers to the response
      return addCorsHeaders(response, event);
    } catch (error) {
      console.error('[withCors] Error in handler:', error);
      
      // Return error with CORS headers
      return addCorsHeaders({
        statusCode: 500,
        body: JSON.stringify({ 
          message: 'Server error', 
          error: process.env.NODE_ENV === 'development' ? error.message : undefined
        })
      }, event);
    }
  };
};

module.exports = withCors;
