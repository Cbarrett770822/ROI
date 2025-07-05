// CORS headers utility for Netlify Functions
// This provides consistent CORS headers across all API endpoints

/**
 * Generate CORS headers based on the request event
 * @param {Object} event - The Netlify Functions event object
 * @returns {Object} - CORS headers object
 */
const getCorsHeaders = (event) => {
  // Get origin from request headers or default to localhost:8888
  const origin = event && event.headers && event.headers.origin;
  
  // Allow both development ports and production URLs
  const allowedOrigins = [
    'http://localhost:8888', 
    'http://localhost:8889', 
    'http://localhost:9999',
    'https://wms-roi.netlify.app',
    'https://roi-wms-app.netlify.app'
  ];
  
  // Use the requesting origin if it's allowed, otherwise default to localhost:8888
  const allowedOrigin = origin && allowedOrigins.includes(origin)
    ? origin
    : 'http://localhost:8888';
    
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
  // Handle CORS preflight requests
  if (event.httpMethod === 'OPTIONS') {
    console.log('[CORS] Handling preflight request from origin:', event.headers.origin);
    return {
      statusCode: 204,
      headers: getCorsHeaders(event),
      body: ''
    };
  }
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
    console.warn('[CORS] Warning: No event object provided to addCorsHeaders');
  }
  
  return {
    ...response,
    headers: {
      ...response.headers,
      ...getCorsHeaders(event)
    }
  };
};

module.exports = {
  getCorsHeaders,
  handleCors,
  addCorsHeaders
};
