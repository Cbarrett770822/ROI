// Script to convert all Netlify functions from ES modules to CommonJS
const fs = require('fs');
const path = require('path');

// Get directory paths
const functionsDir = path.join(__dirname, 'netlify', 'functions');

console.log('Converting Netlify functions to CommonJS...');

// Process all JS files in the functions directory
const files = fs.readdirSync(functionsDir).filter(file => file.endsWith('.js'));
console.log(`Found ${files.length} function files to process`);

// Process each file
for (const file of files) {
  const filePath = path.join(functionsDir, file);
  console.log(`\nProcessing ${file}...`);
  
  let content = fs.readFileSync(filePath, 'utf8');
  
  // Skip files that are already using CommonJS
  if (content.includes('module.exports') && !content.includes('import ')) {
    console.log(`- Already using CommonJS, skipping`);
    continue;
  }
  
  // Replace import statements with require statements
  let modified = content;
  
  // Replace mongoose import
  modified = modified.replace(
    /import mongoose from ['"]mongoose['"];/g,
    'const mongoose = require("mongoose");'
  );
  
  // Replace bcryptjs import
  modified = modified.replace(
    /import bcrypt from ['"]bcryptjs['"];/g,
    'const bcrypt = require("bcryptjs");'
  );
  
  // Replace jwt import
  modified = modified.replace(
    /import jwt from ['"]jsonwebtoken['"];/g,
    'const jwt = require("jsonwebtoken");'
  );
  
  // Replace corsHeaders import
  modified = modified.replace(
    /import \{ corsHeaders, handleCors, addCorsHeaders \} from ['"]\.\/utils\/corsHeaders['"];/g,
    'const { corsHeaders, handleCors, addCorsHeaders } = require("./utils/corsHeaders");'
  );
  
  // Replace export const handler with exports.handler
  modified = modified.replace(
    /export const handler = async function\(event, context\) {/g,
    'exports.handler = async function(event, context) {'
  );
  
  // Write the modified content back to the file
  if (content !== modified) {
    fs.writeFileSync(filePath, modified);
    console.log(`- Converted to CommonJS`);
  } else {
    console.log(`- No changes needed or pattern not matched`);
  }
}

// Also convert the corsHeaders.js utility file
const corsHeadersPath = path.join(functionsDir, 'utils', 'corsHeaders.js');
if (fs.existsSync(corsHeadersPath)) {
  console.log('\nProcessing utils/corsHeaders.js...');
  let corsContent = fs.readFileSync(corsHeadersPath, 'utf8');
  
  // Replace ES module exports with CommonJS exports
  const modifiedCors = corsContent.replace(
    /export {\n  corsHeaders,\n  handleCors,\n  addCorsHeaders\n};/g,
    'module.exports = {\n  corsHeaders,\n  handleCors,\n  addCorsHeaders\n};'
  );
  
  if (corsContent !== modifiedCors) {
    fs.writeFileSync(corsHeadersPath, modifiedCors);
    console.log('- Converted corsHeaders.js to CommonJS');
  } else {
    console.log('- No changes needed for corsHeaders.js');
  }
}

console.log('\nConversion complete!');
