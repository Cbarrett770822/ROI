// Script to check for missing event parameters in addCorsHeaders calls
const fs = require('fs');
const path = require('path');

// Path to the functions directory
const functionsDir = path.join(__dirname, 'netlify', 'functions');

// Get all JavaScript files in the functions directory
const getJsFiles = (dir) => {
  const files = fs.readdirSync(dir);
  return files.filter(file => file.endsWith('.js') && !file.includes('node_modules'));
};

// Check a file for missing event parameters in addCorsHeaders calls
function checkFile(filePath) {
  console.log(`Checking ${filePath}...`);
  
  // Read the file content
  const content = fs.readFileSync(filePath, 'utf8');
  
  // Find all addCorsHeaders calls
  const regex = /addCorsHeaders\s*\(\s*\{[^}]*}\s*\)/g;
  const matches = content.match(regex);
  
  if (matches && matches.length > 0) {
    console.log(`  Found ${matches.length} potential issues in ${path.basename(filePath)}:`);
    matches.forEach(match => {
      console.log(`    ${match}`);
    });
    return true;
  }
  
  return false;
}

// Process all JS files in the functions directory
const jsFiles = getJsFiles(functionsDir);
let issuesFound = false;

jsFiles.forEach(file => {
  const filePath = path.join(functionsDir, file);
  if (checkFile(filePath)) {
    issuesFound = true;
  }
});

if (!issuesFound) {
  console.log('No issues found! All addCorsHeaders calls appear to include the event parameter.');
} else {
  console.log('Issues found. Please fix the addCorsHeaders calls to include the event parameter.');
}
