// Simple CORS test function
const { getCorsHeaders, handleCors, addCorsHeaders } = require("./utils/corsHeaders");

exports.handler = async function(event, context) {
  // Handle CORS preflight requests first
  const corsResponse = handleCors(event);
  if (corsResponse) {
    console.log('Returning CORS preflight response:', corsResponse);
    return corsResponse;
  }

  // Log detailed request information
  console.log('CORS Test Request:', {
    method: event.httpMethod,
    path: event.path,
    origin: event.headers.origin,
    host: event.headers.host,
    headers: event.headers
  });
  
  // For all other requests, return a simple response with CORS headers
  const response = {
    statusCode: 200,
    body: JSON.stringify({
      message: 'CORS test successful',
      requestOrigin: event.headers.origin || 'No origin header',
      requestMethod: event.httpMethod,
      corsHeadersApplied: true,
      allowedOrigins: [
        'http://localhost:8888', 
        'http://localhost:8889', 
        'http://localhost:9999',
        'https://wms-roi.netlify.app',
        'https://roi-wms-app.netlify.app'
      ],
      timestamp: new Date().toISOString()
    })
  };
  
  // Add CORS headers to the response
  const corsResponse2 = addCorsHeaders(response, event);
  console.log('Returning regular response with CORS headers:', corsResponse2);
  return corsResponse2;
};


// Remember to wrap all responses with addCorsHeaders(response, event);
