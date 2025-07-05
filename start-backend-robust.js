// Robust script to start Netlify Functions server
import { spawn } from 'child_process';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';

// Load environment variables
dotenv.config();

// Check if MongoDB URI and JWT_SECRET are available
if (!process.env.MONGODB_URI) {
  console.error('ERROR: MONGODB_URI environment variable is missing!');
  process.exit(1);
}

if (!process.env.JWT_SECRET) {
  console.error('ERROR: JWT_SECRET environment variable is missing!');
  process.exit(1);
}

console.log('Starting Netlify Functions backend server...');
console.log('Environment variables loaded successfully');

// Check if netlify-functions directory exists
const functionsDir = path.join(process.cwd(), 'netlify', 'functions');
if (!fs.existsSync(functionsDir)) {
  console.error(`ERROR: Functions directory not found at ${functionsDir}`);
  process.exit(1);
}

console.log(`Functions directory found at ${functionsDir}`);
console.log('Starting Netlify Dev server on port 9999...');

// Start the Netlify Functions server
const netlifyProcess = spawn('netlify', ['dev', '--port', '9999'], {
  stdio: 'inherit',
  shell: true,
  env: {
    ...process.env,
    FORCE_COLOR: '1' // Enable colored output
  }
});

// Handle process events
netlifyProcess.on('error', (err) => {
  console.error('Failed to start Netlify Dev process:', err);
});

netlifyProcess.on('exit', (code, signal) => {
  if (code !== 0) {
    console.error(`Netlify Dev process exited with code ${code} and signal ${signal}`);
  }
});

// Keep the script running
console.log('Backend server started. Press Ctrl+C to stop.');
