// Robust Express server for running Netlify functions locally
// Using CommonJS for compatibility with Netlify functions
const express = require('express');
const dotenv = require('dotenv');
const mongoose = require('mongoose');
const path = require('path');
const fs = require('fs').promises;

// Load environment variables
dotenv.config();

// Setup Express
const app = express();
const PORT = process.env.PORT || 9999;

// Get directory paths
const functionsDir = path.join(__dirname, 'netlify', 'functions');

// CORS middleware
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', 'http://localhost:8888');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, Accept, Cache-Control, Pragma');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Max-Age', '86400');
  
  if (req.method === 'OPTIONS') {
    return res.status(204).end();
  }
  next();
});

// Parse JSON bodies
app.use(express.json());

// Log all requests
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
  next();
});

// MongoDB connection - centralized
let mongoConnection = null;

async function connectToDatabase() {
  if (mongoose.connection.readyState !== 1) {
    try {
      console.log('Connecting to MongoDB...');
      await mongoose.connect(process.env.MONGODB_URI, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
      });
      mongoConnection = mongoose.connection;
      console.log('Connected to MongoDB successfully!');
      
      // List collections
      const collections = await mongoose.connection.db.listCollections().toArray();
      console.log('Available collections:');
      collections.forEach(collection => {
        console.log(`- ${collection.name}`);
      });
      
      // Add event listeners for connection issues
      mongoose.connection.on('error', (err) => {
        console.error('MongoDB connection error:', err);
      });
      
      mongoose.connection.on('disconnected', () => {
        console.log('MongoDB disconnected');
        mongoConnection = null;
      });
      
      return mongoose.connection;
    } catch (error) {
      console.error('MongoDB connection error:', error);
      throw error;
    }
  }
  return mongoose.connection;
}

// Create a simple health check endpoint
app.get('/.netlify/functions/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    time: new Date().toISOString(),
    mongodbStatus: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
    environment: {
      NODE_ENV: process.env.NODE_ENV,
      MONGODB_URI: process.env.MONGODB_URI ? 'Set (hidden)' : 'Not set',
      JWT_SECRET: process.env.JWT_SECRET ? 'Set (hidden)' : 'Not set'
    }
  });
});

// Dynamic function handler
app.all('/.netlify/functions/:function', async (req, res) => {
  const functionName = req.params.function;
  const functionPath = path.join(functionsDir, `${functionName}.js`);
  
  try {
    // Check if function file exists
    try {
      await fs.access(functionPath);
    } catch (err) {
      console.error(`Function ${functionName} not found`);
      return res.status(404).json({ error: `Function ${functionName} not found` });
    }
    
    // Ensure database connection
    await connectToDatabase();
    
    console.log(`Loading function from: ${functionPath}`);
    
    // Use require() to load the function module (CommonJS)
    // Delete from cache first if it exists to ensure fresh load
    delete require.cache[require.resolve(functionPath)];
    const functionModule = require(functionPath);
    
    if (!functionModule.handler) {
      throw new Error(`Function ${functionName} does not export a handler`);
    }
    
    // Create event and context objects similar to what Netlify would provide
    const event = {
      path: req.path,
      httpMethod: req.method,
      headers: req.headers,
      queryStringParameters: req.query,
      body: JSON.stringify(req.body),
      isBase64Encoded: false
    };
    
    const context = {
      callbackWaitsForEmptyEventLoop: false
    };
    
    // Call the function handler
    console.log(`Calling handler for ${functionName}`);
    const result = await functionModule.handler(event, context);
    
    // Send the response
    res.status(result.statusCode).set(result.headers || {}).send(result.body);
    
  } catch (error) {
    console.error(`Error executing function ${functionName}:`, error);
    res.status(500).json({ 
      error: `Error executing function ${functionName}`,
      message: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
});

// Global error handlers
process.on('uncaughtException', (err) => {
  console.error('UNCAUGHT EXCEPTION! 💥 Shutting down...');
  console.error(err.name, err.message, err.stack);
  // Keep the process alive
  console.log('Server continuing despite error...');
});

process.on('unhandledRejection', (err) => {
  console.error('UNHANDLED REJECTION! 💥');
  console.error(err.name, err.message, err.stack);
  // Keep the process alive
  console.log('Server continuing despite rejection...');
});

// Start server
async function startServer() {
  try {
    // Connect to MongoDB
    await connectToDatabase();
    
    // Start listening
    const server = app.listen(PORT, () => {
      console.log(`Server running at http://localhost:${PORT}`);
      console.log(`API endpoints available at http://localhost:${PORT}/.netlify/functions/`);
      console.log(`Health check: http://localhost:${PORT}/.netlify/functions/health`);
    });
    
    // Handle server errors
    server.on('error', (error) => {
      console.error('Server error:', error);
    });
    
  } catch (error) {
    console.error('Failed to start server:', error);
  }
}

startServer();

// Keep the process alive
setInterval(() => {
  console.log('Server heartbeat - still running at ' + new Date().toISOString());
}, 60000);
