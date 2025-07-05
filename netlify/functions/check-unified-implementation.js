// Helper function to check if all Netlify functions have been updated for unified deployment
const fs = require('fs');
const path = require('path');

exports.handler = async function(event, context) {
  try {
    // Get the functions directory
    const functionsDir = path.join(__dirname);
    
    // Read all JavaScript files in the functions directory
    const files = fs.readdirSync(functionsDir)
      .filter(file => file.endsWith('.js') && 
              !file.includes('check-unified-implementation') && 
              !file.includes('-unified.js'));
    
    // Check each file for CORS implementation that should be removed
    const results = [];
    
    for (const file of files) {
      const filePath = path.join(functionsDir, file);
      const content = fs.readFileSync(filePath, 'utf8');
      
      // Check for CORS-related imports and usage that should be removed in unified deployment
      const hasCorsImport = content.includes('corsHeaders') || 
                           content.includes('getCorsHeaders') || 
                           content.includes('handleCors') || 
                           content.includes('addCorsHeaders');
      
      const hasOptionsCheck = content.includes('OPTIONS') && 
                             content.includes('httpMethod');
      
      const hasAccessControlHeaders = content.includes('Access-Control-Allow-Origin');
      
      // In unified deployment, we shouldn't have any of these
      const isUnified = !hasCorsImport && !hasOptionsCheck && !hasAccessControlHeaders;
      
      results.push({
        file,
        isUnified,
        hasCorsImport,
        hasOptionsCheck,
        hasAccessControlHeaders,
        status: isUnified ? 'UNIFIED' : 'NEEDS UPDATE'
      });
    }
    
    // Count files that need updating
    const needsUpdateCount = results.filter(r => r.status === 'NEEDS UPDATE').length;
    
    // Return the results
    return {
      statusCode: 200,
      body: JSON.stringify({
        message: `Unified deployment check complete. ${needsUpdateCount} files still need updating.`,
        results,
        timestamp: new Date().toISOString()
      })
    };
  } catch (error) {
    console.error('Error checking unified implementation:', error);
    
    return {
      statusCode: 500,
      body: JSON.stringify({
        message: 'Error checking unified implementation',
        error: error.message,
        stack: error.stack
      })
    };
  }
};
