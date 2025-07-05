/**
 * Unified Deployment Test Function
 * 
 * This function helps verify that the unified deployment is working correctly.
 * It returns information about the request and environment to help diagnose any issues.
 */

exports.handler = async function(event, context) {
  // Log request details for debugging
  console.log('Unified deployment test - Request details:', {
    method: event.httpMethod,
    path: event.path,
    origin: event.headers.origin || 'No origin header',
    host: event.headers.host,
    referer: event.headers.referer || 'No referer'
  });
  
  // Get environment information
  const environment = {
    nodeEnv: process.env.NODE_ENV || 'Not set',
    netlifyContext: process.env.CONTEXT || 'Not set',
    netlifyUrl: process.env.URL || 'Not set',
    netlifyDeployUrl: process.env.DEPLOY_URL || 'Not set',
    netlifyDeployId: process.env.DEPLOY_ID || 'Not set'
  };
  
  // Return a simple response with request and environment information
  return {
    statusCode: 200,
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      message: 'Unified deployment test successful',
      timestamp: new Date().toISOString(),
      request: {
        method: event.httpMethod,
        path: event.path,
        origin: event.headers.origin || 'No origin header',
        host: event.headers.host
      },
      environment,
      note: 'If you can see this response without CORS errors, the unified deployment is working correctly!'
    }, null, 2)
  };
};
