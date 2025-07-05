// Helper function to check if all Netlify functions have proper CORS handling
const fs = require('fs');
const path = require('path');

exports.handler = async function(event, context) {
  // Import the CORS utilities
  const { getCorsHeaders, handleCors, addCorsHeaders } = require('./utils/corsHeaders');
  
  // Handle CORS preflight requests first
  const corsResponse = handleCors(event);
  if (corsResponse) {
    return corsResponse;
  }
  
  try {
    // Get the functions directory
    const functionsDir = path.join(__dirname);
    
    // Read all JavaScript files in the functions directory
    const files = fs.readdirSync(functionsDir)
      .filter(file => file.endsWith('.js') && !file.includes('check-cors-implementation'));
    
    // Check each file for CORS implementation
    const results = [];
    
    for (const file of files) {
      const filePath = path.join(functionsDir, file);
      const content = fs.readFileSync(filePath, 'utf8');
      
      // Check for CORS-related imports and usage
      const hasCorsImport = content.includes('corsHeaders') || 
                           content.includes('getCorsHeaders') || 
                           content.includes('handleCors') || 
                           content.includes('addCorsHeaders');
      
      const hasOptionsCheck = content.includes('OPTIONS') && 
                             content.includes('httpMethod');
      
      const hasAccessControlHeaders = content.includes('Access-Control-Allow-Origin');
      
      results.push({
        file,
        hasCorsImport,
        hasOptionsCheck,
        hasAccessControlHeaders,
        status: (hasCorsImport || hasAccessControlHeaders) && hasOptionsCheck ? 'OK' : 'NEEDS REVIEW'
      });
    }
    
    // Count files that need review
    const needsReviewCount = results.filter(r => r.status === 'NEEDS REVIEW').length;
    
    // Return the results
    const response = {
      statusCode: 200,
      body: JSON.stringify({
        message: `CORS implementation check complete. ${needsReviewCount} files need review.`,
        results,
        timestamp: new Date().toISOString()
      })
    };
    
    return addCorsHeaders(response, event);
  } catch (error) {
    console.error('Error checking CORS implementation:', error);
    
    const response = {
      statusCode: 500,
      body: JSON.stringify({
        message: 'Error checking CORS implementation',
        error: error.message,
        stack: error.stack
      })
    };
    
    return addCorsHeaders(response, event);
  }
};
