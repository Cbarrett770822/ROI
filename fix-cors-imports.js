// Script to fix duplicate CORS imports in Netlify functions
const fs = require('fs');
const path = require('path');

// Files with issues based on the Netlify build logs
const filesToFix = [
  'netlify/functions/clear-data-dev.js',
  'netlify/functions/clear-data.js',
  'netlify/functions/cors-test.js',
  'netlify/functions/debug-questionnaire.js',
  'netlify/functions/debug-users.js',
  'netlify/functions/users.js'
];

// Function to fix duplicate imports and corsResponse declarations
function fixFile(filePath) {
  console.log(`Fixing file: ${filePath}`);
  
  // Read file content
  let content = fs.readFileSync(filePath, 'utf8');
  
  // Fix duplicate CORS imports
  // Pattern 1: Double require with different quotes
  const doubleImportPattern = /const\s*{\s*(?:getCorsHeaders|corsHeaders),\s*handleCors,\s*addCorsHeaders\s*}\s*=\s*require\(['"]\.\/(utils\/corsHeaders)['"]\);\s*\n+\s*const\s*{\s*(?:getCorsHeaders|corsHeaders),\s*handleCors,\s*addCorsHeaders\s*}\s*=\s*require\(['"]\.\/(utils\/corsHeaders)['"]\);/g;
  content = content.replace(doubleImportPattern, (match, g1, g2) => {
    return `const { getCorsHeaders, handleCors, addCorsHeaders } = require("./${g1}");`;
  });
  
  // Fix duplicate corsResponse declarations
  const doubleCorsResponsePattern = /\/\/ Handle CORS preflight requests(?:.*\n)*?.*const corsResponse = handleCors\(event\);(?:.*\n)*?.*if \(corsResponse\) {(?:.*\n)*?.*return corsResponse;(?:.*\n)*?.*}(?:.*\n)*?.*\/\/ (?:Connect|Handle|Verify)/;
  let matches = content.match(doubleCorsResponsePattern);
  
  if (matches) {
    // Keep only the first corsResponse declaration
    const firstCorsResponseBlock = matches[0];
    const restOfContent = content.replace(doubleCorsResponsePattern, '');
    
    // Find where to insert the corsResponse block
    const tryBlockStart = restOfContent.indexOf('try {');
    if (tryBlockStart !== -1) {
      // Insert after the try { line and the next line (usually a comment or connect to DB)
      const insertPoint = restOfContent.indexOf('\n', tryBlockStart) + 1;
      content = restOfContent.slice(0, insertPoint) + firstCorsResponseBlock + restOfContent.slice(insertPoint);
    } else {
      console.log(`Could not find try block in ${filePath}`);
    }
  }
  
  // Write fixed content back to file
  fs.writeFileSync(filePath, content, 'utf8');
  console.log(`Fixed ${filePath}`);
}

// Process each file
filesToFix.forEach(file => {
  const fullPath = path.resolve(file);
  if (fs.existsSync(fullPath)) {
    fixFile(fullPath);
  } else {
    console.error(`File not found: ${fullPath}`);
  }
});

console.log('All files processed.');
