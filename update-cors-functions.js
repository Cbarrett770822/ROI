// Script to update all Netlify functions to use the shared CORS utility
const fs = require('fs');
const path = require('path');

// Files that need to be updated
const filesToUpdate = [
  'auth-logout.js',
  'clear-data-dev.js',
  'clear-data.js',
  'cors-test.js',
  'debug-questionnaire.js',
  'debug-users.js',
  'list-users.js',
  'reset-admin-password.js',
  'reset-user-password.js',
  'seed-users.js'
];

// Path to the functions directory
const functionsDir = path.join(__dirname, 'netlify', 'functions');

// Import statement to add
const importStatement = "const { getCorsHeaders, handleCors, addCorsHeaders } = require('./utils/corsHeaders');\n";

// Function to check if a file already has the import
function hasImport(content) {
  return content.includes("require('./utils/corsHeaders')");
}

// Function to check if a file already handles OPTIONS requests
function hasOptionsHandler(content) {
  return content.includes("event.httpMethod === 'OPTIONS'");
}

// Function to add CORS handling to a file
function addCorsHandling(filePath) {
  console.log(`Processing ${filePath}...`);
  
  // Read the file content
  let content = fs.readFileSync(filePath, 'utf8');
  
  // Check if the file already has the import
  if (!hasImport(content)) {
    // Find the position after the last require statement
    const lastRequirePos = content.lastIndexOf('require(');
    if (lastRequirePos !== -1) {
      const endOfLine = content.indexOf('\n', lastRequirePos);
      if (endOfLine !== -1) {
        // Insert the import statement after the last require
        content = content.slice(0, endOfLine + 1) + '\n' + importStatement + content.slice(endOfLine + 1);
      } else {
        // If we can't find the end of line, just prepend the import
        content = importStatement + content;
      }
    } else {
      // If there are no require statements, add it at the beginning
      content = importStatement + content;
    }
  }
  
  // Check if the file already handles OPTIONS requests
  if (!hasOptionsHandler(content)) {
    // Find the handler function
    const handlerPos = content.indexOf('exports.handler');
    if (handlerPos !== -1) {
      // Find the opening brace of the handler function
      const openingBracePos = content.indexOf('{', handlerPos);
      if (openingBracePos !== -1) {
        // Insert the CORS handling code after the opening brace
        const corsHandlingCode = `
  // Handle CORS preflight requests first
  const corsResponse = handleCors(event);
  if (corsResponse) {
    return corsResponse;
  }
`;
        content = content.slice(0, openingBracePos + 1) + corsHandlingCode + content.slice(openingBracePos + 1);
      }
    }
  }
  
  // Find all response objects and wrap them with addCorsHeaders
  // This is a bit tricky as we need to find all return statements with response objects
  // For simplicity, we'll just add a reminder comment at the end of the file
  if (!content.includes('// Remember to wrap all responses with addCorsHeaders')) {
    content += '\n\n// Remember to wrap all responses with addCorsHeaders(response, event);\n';
  }
  
  // Write the updated content back to the file
  fs.writeFileSync(filePath, content);
  console.log(`Updated ${filePath}`);
}

// Process each file
filesToUpdate.forEach(file => {
  const filePath = path.join(functionsDir, file);
  if (fs.existsSync(filePath)) {
    addCorsHandling(filePath);
  } else {
    console.log(`File not found: ${filePath}`);
  }
});

console.log('CORS update complete!');
