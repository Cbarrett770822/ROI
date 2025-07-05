const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

// Inline CORS utility functions to avoid import issues

/**
 * Generate CORS headers based on the request event
 * @param {Object} event - The Netlify Functions event object
 * @returns {Object} - CORS headers object
 */
const getCorsHeaders = (event) => {
  // Get origin from request headers or default to localhost:8888
  const origin = event && event.headers && event.headers.origin;
  
  // Allow both development ports and production URLs
  const allowedOrigins = ['http://localhost:8888', 'http://localhost:8889', 'http://localhost:9999'];
  
  // Use the requesting origin if it's allowed, otherwise default to localhost:8888
  const allowedOrigin = origin && allowedOrigins.includes(origin)
    ? origin
    : 'http://localhost:8888';
    
  return {
    'Access-Control-Allow-Origin': allowedOrigin,
    'Access-Control-Allow-Headers': 'Content-Type, Authorization, Accept, Cache-Control, Pragma',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Credentials': 'true',
    'Access-Control-Max-Age': '86400',
    'Content-Type': 'application/json'
  };
};

/**
 * Handle CORS preflight requests
 * @param {Object} event - The Netlify Functions event object
 * @returns {Object|null} - Response object for OPTIONS requests or null
 */
const handleCors = (event) => {
  // Handle CORS preflight requests
  if (event.httpMethod === 'OPTIONS') {
    console.log('[CORS] Handling preflight request from origin:', event.headers.origin);
    return {
      statusCode: 204,
      headers: getCorsHeaders(event),
      body: ''
    };
  }
  return null;
};

/**
 * Add CORS headers to any response object
 * @param {Object} response - The response object
 * @param {Object} event - The Netlify Functions event object
 * @returns {Object} - Response with CORS headers added
 */
const addCorsHeaders = (response, event) => {
  if (!event) {
    console.warn('[CORS] Warning: No event object provided to addCorsHeaders');
  }
  
  return {
    ...response,
    headers: {
      ...response.headers,
      ...getCorsHeaders(event)
    }
  };
};

/**
 * Middleware to add CORS support to Netlify Functions
 * @param {Function} handler - The original handler function
 * @returns {Function} - Enhanced handler with CORS support
 */
const withCors = (handler) => {
  return async (event, context) => {
    // Handle preflight requests
    const corsResponse = handleCors(event);
    if (corsResponse) {
      return corsResponse;
    }
    
    try {
      // Call the original handler
      const response = await handler(event, context);
      
      // Add CORS headers to the response
      return addCorsHeaders(response, event);
    } catch (error) {
      console.error('[withCors] Error in handler:', error);
      
      // Return error with CORS headers
      return addCorsHeaders({
        statusCode: 500,
        body: JSON.stringify({ 
          message: 'Server error', 
          error: process.env.NODE_ENV === 'development' ? error.message : undefined
        })
      }, event);
    }
  };
};

// Define User schema directly in this file
const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  passwordHash: { type: String, required: true },
  role: { type: String, enum: ['user', 'admin'], default: 'user' }
});

// Create or get the model
let User;
try {
  // Try to get the model if it exists
  User = mongoose.model('User');
} catch {
  // Create the model if it doesn't exist
  User = mongoose.model('User', userSchema);
}

const JWT_SECRET = process.env.JWT_SECRET || 'changeme-secret';
const MONGODB_URI = 'mongodb+srv://admin:wmsadmin@cluster0.mongodb.net/roi-warehouse?retryWrites=true&w=majority';

// Connect to MongoDB
async function dbConnect() {
  if (mongoose.connection.readyState !== 1) {
    try {
      await mongoose.connect(MONGODB_URI, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
      });
      console.log('Connected to MongoDB in auth-login');
    } catch (error) {
      console.error('MongoDB connection error:', error);
      throw error;
    }
  }
  return mongoose.connection;
}

const handler = async function(event, context) {
  // For faster cold starts
  context.callbackWaitsForEmptyEventLoop = false;
  
  console.log('Auth login function called');
  
  // Handle CORS preflight requests
  

  // Handle only POST requests
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ message: 'Method Not Allowed' })
    };
  }
  
  try {
    console.log('Connecting to database...');
    await dbConnect();
    console.log('Connected to database');
    
    const { username, password } = JSON.parse(event.body);
    console.log('Login attempt for username:', username);
    
    // Find user in database
    const user = await User.findOne({ username });
    if (!user) {
      console.log('User not found:', username);
      return {
        statusCode: 401,
        body: JSON.stringify({ message: 'Invalid credentials.' })
      };
    }
    
    console.log('User found:', username, 'with role:', user.role);
    console.log('Comparing password...');
    
    // Compare password
    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) {
      console.log('Password invalid for user:', username);
      return {
        statusCode: 401,
        body: JSON.stringify({ message: 'Invalid credentials.' })
      };
    }
    
    console.log('Password valid, generating token...');
    
    // Generate JWT token
    const token = jwt.sign(
      { userId: user._id, username: user.username, role: user.role },
      JWT_SECRET,
      { expiresIn: '2h' }
    );
    
    console.log('Login successful for:', username);
    
    return {
      statusCode: 200,
      body: JSON.stringify({ token, user: { username: user.username, role: user.role } })
    };
  } catch (err) {
    console.error('Login error:', err);
    return {
      statusCode: 500,
      body: JSON.stringify({ message: 'Login failed.', error: err.message })
    };
  }
};


// Export the handler with CORS middleware
exports.handler = withCors(handler);
