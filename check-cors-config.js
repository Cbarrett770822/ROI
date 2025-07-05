// Simple script to check if our CORS configuration is correct
const corsHeaders = require('./netlify/functions/utils/corsHeaders');

// Test with different origins
const origins = [
  'http://localhost:8888',
  'http://localhost:9999',
  'https://wms-roi.netlify.app',
  'https://roi-wms-app.netlify.app',
  'https://some-random-domain.com'
];

// Simulate events with different origins
origins.forEach(origin => {
  const event = {
    headers: {
      origin: origin
    }
  };
  
  // Get CORS headers for this origin
  const headers = corsHeaders.getCorsHeaders(event);
  
  console.log(`\nTesting origin: ${origin}`);
  console.log(`Allowed: ${headers['Access-Control-Allow-Origin'] === origin ? 'YES' : 'NO'}`);
  console.log(`Returned origin: ${headers['Access-Control-Allow-Origin']}`);
  console.log('All headers:', headers);
});
