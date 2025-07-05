// Script to fix missing event parameters in addCorsHeaders calls
const fs = require('fs');
const path = require('path');

// Path to the functions directory
const functionsDir = path.join(__dirname, 'netlify', 'functions');

// Get all JavaScript files in the functions directory
const getJsFiles = (dir) => {
  const files = fs.readdirSync(dir);
  return files.filter(file => file.endsWith('.js') && !file.includes('node_modules'));
};

// Fix a file by adding the event parameter to addCorsHeaders calls
function fixFile(filePath) {
  console.log(`Fixing ${filePath}...`);
  
  // Read the file content
  let content = fs.readFileSync(filePath, 'utf8');
  
  // Find all addCorsHeaders calls without the event parameter
  // This regex matches addCorsHeaders({ ... }) without a second parameter
  const regex = /addCorsHeaders\s*\(\s*\{[^}]*}\s*\)/g;
  
  // Replace with addCorsHeaders({ ... }, event)
  const fixedContent = content.replace(regex, match => {
    return `${match.slice(0, -1)}, event)`;
  });
  
  // Count the number of replacements
  const replacements = (fixedContent.match(/addCorsHeaders\s*\(\s*\{[^}]*}\s*,\s*event\s*\)/g) || []).length;
  console.log(`  Made ${replacements} replacements in ${path.basename(filePath)}`);
  
  // Write the fixed content back to the file
  fs.writeFileSync(filePath, fixedContent);
  
  return replacements > 0;
}

// Process all JS files in the functions directory
const jsFiles = getJsFiles(functionsDir);
let fixesApplied = false;

jsFiles.forEach(file => {
  const filePath = path.join(functionsDir, file);
  if (fixFile(filePath)) {
    fixesApplied = true;
  }
});

if (fixesApplied) {
  console.log('Fixes applied! All addCorsHeaders calls now include the event parameter.');
} else {
  console.log('No fixes needed. All addCorsHeaders calls already include the event parameter.');
}
