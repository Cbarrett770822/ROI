/**
 * Verify API URLs Script
 * 
 * This script searches through the codebase for any remaining hardcoded API URLs
 * that might prevent the unified deployment from working correctly.
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Pattern to search for hardcoded API URLs
const API_URL_PATTERN = 'roi-wms-app.netlify.app';

// Directories to search
const DIRECTORIES = [
  './src',
  './netlify/functions'
];

console.log('🔍 Scanning codebase for hardcoded API URLs...');
console.log('Looking for pattern:', API_URL_PATTERN);
console.log('-------------------------------------------');

let foundIssues = false;

// Use grep to find all occurrences of the pattern
DIRECTORIES.forEach(dir => {
  try {
    const fullPath = path.resolve(process.cwd(), dir);
    console.log(`Scanning directory: ${fullPath}`);
    
    // Use grep command to find the pattern in files
    const command = process.platform === 'win32'
      ? `findstr /s /i /m /c:"${API_URL_PATTERN}" "${fullPath}\\*.js" "${fullPath}\\*.jsx" "${fullPath}\\*.json"`
      : `grep -r "${API_URL_PATTERN}" --include="*.js" --include="*.jsx" --include="*.json" "${fullPath}"`;
    
    try {
      const result = execSync(command, { encoding: 'utf8' });
      console.log('⚠️ Found hardcoded API URLs:');
      console.log(result);
      foundIssues = true;
    } catch (error) {
      // No matches found is expected (grep returns non-zero exit code)
      if (error.status !== 1) {
        console.error(`Error scanning ${dir}:`, error.message);
      } else {
        console.log(`✅ No hardcoded URLs found in ${dir}`);
      }
    }
  } catch (error) {
    console.error(`Error processing directory ${dir}:`, error.message);
  }
});

if (!foundIssues) {
  console.log('-------------------------------------------');
  console.log('✅ No hardcoded API URLs found! The application is ready for unified deployment.');
} else {
  console.log('-------------------------------------------');
  console.log('⚠️ Found hardcoded API URLs that need to be updated for unified deployment.');
  console.log('Please update these URLs to use relative paths (/.netlify/functions/...)');
}
