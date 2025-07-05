// CORS headers utility for Netlify Functions
// This provides consistent CORS headers across all API endpoints
// Updated to use wildcard origin to match netlify.toml configuration

/**
 * Generate CORS headers based on the request event
 * @param {Object} event - The Netlify Functions event object
 * @returns {Object} - CORS headers object
 */
const getCorsHeaders = (event) => {
  // Get origin from request headers
  const origin = event && event.headers && event.headers.origin;
  
  // Use specific allowed origins instead of wildcard to fix CORS issues
  const allowedOrigins = [
    'http://localhost:8888', 
    'http://localhost:8889', 
    'http://localhost:9999',
    'https://wms-roi.netlify.app',
    'https://roi-wms-app.netlify.app'
  ];
  
  // If the origin is in our allowed list, return that specific origin
  // Otherwise use wildcard as fallback
  const allowedOrigin = origin && allowedOrigins.includes(origin)
    ? origin
    : '*';
    
  console.log(`[CORS] Request from origin: ${origin}, allowed origin: ${allowedOrigin}`);
    
  return {
    'Access-Control-Allow-Origin': allowedOrigin,
    'Access-Control-Allow-Headers': 'Content-Type, Authorization, Accept, Cache-Control, Pragma',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Credentials': 'true',
    'Access-Control-Max-Age': '86400',
    'Content-Type': 'application/json'
  };
};

/**
 * Handle CORS preflight requests
 * @param {Object} event - The Netlify Functions event object
 * @returns {Object|null} - Response object for OPTIONS requests or null
 */
const handleCors = (event) => {
  // Enhanced logging for all requests to help with debugging
  console.log('[CORS] Request details:', {
    method: event.httpMethod,
    path: event.path,
    origin: event.headers.origin || 'No origin header',
    host: event.headers.host,
    referer: event.headers.referer || 'No referer',
  });
  
  // Handle CORS preflight requests
  if (event.httpMethod === 'OPTIONS') {
    console.log('[CORS] Handling OPTIONS preflight request');
    
    // Return a proper preflight response with CORS headers
    const corsHeaders = getCorsHeaders(event);
    console.log('[CORS] Sending preflight response headers:', corsHeaders);
    
    return {
      statusCode: 204, // No content
      headers: corsHeaders,
      body: ''
    };
  }
  
  // Not an OPTIONS request, continue with normal processing
  return null;
};

/**
 * Add CORS headers to any response object
 * @param {Object} response - The response object
 * @param {Object} event - The Netlify Functions event object
 * @returns {Object} - Response with CORS headers added
 */
const addCorsHeaders = (response, event) => {
  if (!event) {
    console.warn('[CORS] Warning: No event object provided to addCorsHeaders, using default CORS headers');
    // Even without an event, we should still add CORS headers
    return {
      ...response,
      headers: {
        ...response.headers,
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization, Accept, Cache-Control, Pragma',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Credentials': 'true',
        'Access-Control-Max-Age': '86400'
      }
    };
  }
  
  // Get CORS headers based on the event
  const corsHeaders = getCorsHeaders(event);
  
  // Log what we're doing to help with debugging
  console.log('[CORS] Adding CORS headers to response:', corsHeaders);
  
  // Return response with CORS headers added
  return {
    ...response,
    headers: {
      ...response.headers,
      ...corsHeaders
    }
  };
};

module.exports = {
  getCorsHeaders,
  handleCors,
  addCorsHeaders
};
