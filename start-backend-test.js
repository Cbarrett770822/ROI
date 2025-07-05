// Test script to start the Netlify Functions backend
import { spawn } from 'child_process';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

console.log('Starting Netlify Functions backend test...');
console.log('Environment variables loaded:');
console.log('- MONGODB_URI:', process.env.MONGODB_URI ? 'Found (hidden for security)' : 'Not found');
console.log('- JWT_SECRET:', process.env.JWT_SECRET ? 'Found (hidden for security)' : 'Not found');

// Start the Netlify Functions server
const netlifyProcess = spawn('netlify', ['dev', '--port', '9999', '--debug'], {
  stdio: 'inherit',
  shell: true
});

// Handle process events
netlifyProcess.on('error', (err) => {
  console.error('Failed to start Netlify Dev process:', err);
});

// Keep the script running
console.log('Backend test script is running. Press Ctrl+C to stop.');
