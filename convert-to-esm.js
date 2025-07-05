// Script to convert all Netlify functions from CommonJS to ES modules
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Get directory paths
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const functionsDir = path.join(__dirname, 'netlify', 'functions');

console.log('Converting Netlify functions to ES modules...');

// Process all JS files in the functions directory
const files = fs.readdirSync(functionsDir).filter(file => file.endsWith('.js'));
console.log(`Found ${files.length} function files to process`);

// Process each file
for (const file of files) {
  const filePath = path.join(functionsDir, file);
  console.log(`\nProcessing ${file}...`);
  
  let content = fs.readFileSync(filePath, 'utf8');
  
  // Skip files that are already using ES modules
  if (content.includes('import ') && content.includes('export ')) {
    console.log(`- Already using ES modules, skipping`);
    continue;
  }
  
  // Replace require statements with import statements
  let modified = content;
  
  // Replace mongoose require
  modified = modified.replace(
    /const mongoose = require\(['"]mongoose['"]\);/g,
    'import mongoose from \'mongoose\';'
  );
  
  // Replace bcryptjs require
  modified = modified.replace(
    /const bcrypt = require\(['"]bcryptjs['"]\);/g,
    'import bcrypt from \'bcryptjs\';'
  );
  
  // Replace jwt require
  modified = modified.replace(
    /const jwt = require\(['"]jsonwebtoken['"]\);/g,
    'import jwt from \'jsonwebtoken\';'
  );
  
  // Replace corsHeaders require
  modified = modified.replace(
    /const \{ corsHeaders, handleCors, addCorsHeaders \} = require\(['"]\.\/utils\/corsHeaders['"]\);/g,
    'import { corsHeaders, handleCors, addCorsHeaders } from \'./utils/corsHeaders\';'
  );
  
  // Replace exports.handler with export const handler
  modified = modified.replace(
    /exports\.handler = async function\(event, context\) {/g,
    'export const handler = async function(event, context) {'
  );
  
  // Write the modified content back to the file
  if (content !== modified) {
    fs.writeFileSync(filePath, modified);
    console.log(`- Converted to ES modules`);
  } else {
    console.log(`- No changes needed`);
  }
}

console.log('\nConversion complete!');
