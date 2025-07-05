// Test script to check Netlify configuration
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Get directory paths
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('=== Netlify Configuration Test ===');

// Check package.json
try {
  const packageJson = JSON.parse(fs.readFileSync(path.join(__dirname, 'package.json'), 'utf8'));
  console.log('Package.json:');
  console.log('- Name:', packageJson.name);
  console.log('- Type:', packageJson.type || 'commonjs (default)');
  console.log('- Scripts:', Object.keys(packageJson.scripts).join(', '));
} catch (error) {
  console.error('Error reading package.json:', error);
}

// Check netlify.toml
try {
  const netlifyToml = fs.readFileSync(path.join(__dirname, 'netlify.toml'), 'utf8');
  console.log('\nnetlify.toml:');
  console.log(netlifyToml);
} catch (error) {
  console.error('Error reading netlify.toml:', error);
}

// Check functions directory
const functionsDir = path.join(__dirname, 'netlify', 'functions');
try {
  const files = fs.readdirSync(functionsDir).filter(file => file.endsWith('.js'));
  console.log('\nNetlify Functions:');
  console.log(`Found ${files.length} function files:`, files);
  
  // Check first few lines of each file to determine module system
  for (const file of files) {
    const filePath = path.join(functionsDir, file);
    const content = fs.readFileSync(filePath, 'utf8').split('\n').slice(0, 5).join('\n');
    console.log(`\n${file} (first 5 lines):`);
    console.log(content);
  }
} catch (error) {
  console.error('Error reading functions directory:', error);
}

// Check environment variables
console.log('\nEnvironment Variables:');
console.log('- MONGODB_URI:', process.env.MONGODB_URI ? 'Found (hidden for security)' : 'Not found');
console.log('- JWT_SECRET:', process.env.JWT_SECRET ? 'Found (hidden for security)' : 'Not found');

console.log('\n=== Test Complete ===');
