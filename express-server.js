// Simple Express server to run Netlify functions locally
import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Load environment variables
dotenv.config();

// Setup Express
const app = express();
const PORT = 9999;

// Get directory paths
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const functionsDir = path.join(__dirname, 'netlify', 'functions');

// Middleware
app.use(express.json());
app.use(cors({
  origin: 'http://localhost:8888',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Accept', 'Cache-Control', 'Pragma']
}));

// Log all requests
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
  next();
});

// Dynamically load and route to Netlify functions
async function setupFunctionRoutes() {
  try {
    // Get all JS files in the functions directory
    const files = fs.readdirSync(functionsDir).filter(file => file.endsWith('.js'));
    
    console.log(`Found ${files.length} function files:`, files);
    
    // Create routes for each function
    for (const file of files) {
      const functionName = path.basename(file, '.js');
      const functionPath = path.join(functionsDir, file);
      
      console.log(`Setting up route for /.netlify/functions/${functionName}`);
      
      // Import the function module - convert to file:// URL for Windows compatibility
      const fileUrl = `file://${functionPath.replace(/\\/g, '/')}`;
      console.log(`Importing function from: ${fileUrl}`);
      const functionModule = await import(fileUrl);
      
      // Create Express route
      app.all(`/.netlify/functions/${functionName}`, async (req, res) => {
        try {
          console.log(`Executing function: ${functionName}`);
          
          // Convert Express request to Netlify function event format
          const event = {
            path: req.path,
            httpMethod: req.method,
            headers: req.headers,
            queryStringParameters: req.query,
            body: JSON.stringify(req.body),
            isBase64Encoded: false
          };
          
          // Execute the function
          const result = await functionModule.handler(event, {});
          
          // Set status code and headers
          res.status(result.statusCode);
          if (result.headers) {
            Object.entries(result.headers).forEach(([key, value]) => {
              res.setHeader(key, value);
            });
          }
          
          // Send response body
          res.send(result.body);
          
        } catch (error) {
          console.error(`Error executing function ${functionName}:`, error);
          res.status(500).json({ 
            error: 'Internal Server Error', 
            message: error.message,
            stack: error.stack
          });
        }
      });
    }
    
    console.log('All function routes set up successfully');
  } catch (error) {
    console.error('Error setting up function routes:', error);
  }
}

// Start server
async function startServer() {
  try {
    // Setup function routes
    await setupFunctionRoutes();
    
    // Start listening
    app.listen(PORT, () => {
      console.log(`Server running at http://localhost:${PORT}`);
      console.log(`Functions available at http://localhost:${PORT}/.netlify/functions/{function-name}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
  }
}

startServer();
