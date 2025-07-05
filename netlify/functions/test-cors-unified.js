// Simple test function for unified deployment
exports.handler = async function(event, context) {
  // Log all request details for debugging
  console.log('Request details:', {
    method: event.httpMethod,
    path: event.path,
    origin: event.headers.origin || 'No origin header',
    host: event.headers.host,
    referer: event.headers.referer || 'No referer',
    headers: event.headers
  });
  
  // Return a simple response - no CORS headers needed in unified deployment
  return {
    statusCode: 200,
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ 
      message: 'Unified deployment test successful',
      origin: event.headers.origin || 'No origin header',
      note: 'No CORS headers needed with unified deployment'
    })
  };
};
