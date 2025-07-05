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

// Define User schema
const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  passwordHash: { type: String, required: true },
  role: { type: String, enum: ['user', 'admin'], default: 'user' }
}, { timestamps: true });

// Create or get the model
let User;
try {
  User = mongoose.model('User');
} catch {
  User = mongoose.model('User', userSchema);
}

// Connect to MongoDB
async function connectToDatabase() {
  if (mongoose.connection.readyState !== 1) {
    try {
      await mongoose.connect('mongodb+srv://admin:wmsadmin@cluster0.mongodb.net/roi-warehouse?retryWrites=true&w=majority', {
        useNewUrlParser: true,
        useUnifiedTopology: true,
      });
      console.log('Connected to MongoDB');
    } catch (error) {
      console.error('MongoDB connection error:', error);
      throw error;
    }
  }
}

// Verify JWT token middleware
const verifyToken = (event) => {
  try {
    const token = event.headers.authorization?.split(' ')[1];
    if (!token) {
      return { isValid: false, error: 'No token provided' };
    }
    
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    return { isValid: true, user: decoded };
  } catch (error) {
    return { isValid: false, error: 'Invalid token' };
  }
};

// Check if user is admin
const isAdmin = (user) => {
  return user && user.role === 'admin';
};

exports.handler = async function(event, context) {
  // For faster cold starts
  context.callbackWaitsForEmptyEventLoop = false;
  
  console.log('Request to users endpoint:', {
    path: event.path,
    httpMethod: event.httpMethod,
    headers: event.headers,
    origin: event.headers.origin || event.headers.Origin
  });
  
  // Handle CORS preflight requests
  const corsResponse = handleCors(event);
  if (corsResponse) {
    console.log('Returning CORS preflight response');
    return corsResponse;
  }
  
  // Verify token for all requests except OPTIONS
  console.log('Verifying token from authorization header:', event.headers.authorization);
  const auth = verifyToken(event);
  console.log('Token verification result:', auth);
  if (!auth.isValid) {
    console.log('Invalid token, returning 401');
    return addCorsHeaders({
      statusCode: 401,
      body: JSON.stringify({ message: auth.error })
    }, event);
  }
  
  // Only admins can access user management
  if (!isAdmin(auth.user)) {
    return addCorsHeaders({
      statusCode: 403,
      body: JSON.stringify({ message: 'Admin access required' })
    }, event);
  }
  
  try {
    // Connect to the database
    await connectToDatabase();
    
    // GET - List all users
    if (event.httpMethod === 'GET') {
      console.log('Handling GET request for users list');
      try {
        const users = await User.find({}, { passwordHash: 0 }).lean();
        console.log('Found users:', users);
        const response = addCorsHeaders({
          statusCode: 200,
          body: JSON.stringify({ users })
        }, event);
        console.log('Sending response with headers:', response.headers);
        return response;
      } catch (error) {
        console.error('Error fetching users:', error);
        return addCorsHeaders({
          statusCode: 500,
          body: JSON.stringify({ message: 'Error fetching users', error: error.message })
        }, event);
      }
    }
    
    // POST - Create a new user
    if (event.httpMethod === 'POST') {
      const { username, password, role } = JSON.parse(event.body);
      
      // Validate input
      if (!username || !password || !role) {
        return addCorsHeaders({
          statusCode: 400,
          body: JSON.stringify({ message: 'Username, password and role are required' })
        }, event);
      }
      
      // Check if user already exists
      const existingUser = await User.findOne({ username });
      if (existingUser) {
        return addCorsHeaders({
          statusCode: 409,
          body: JSON.stringify({ message: 'Username already exists' })
        }, event);
      }
      
      // Hash password and create user
      const passwordHash = await bcrypt.hash(password, 10);
      const newUser = new User({ username, passwordHash, role });
      await newUser.save();
      
      // Return user without password hash
      const userResponse = newUser.toObject();
      delete userResponse.passwordHash;
      
      return addCorsHeaders({
        statusCode: 201,
        body: JSON.stringify({ message: 'User created successfully', user: userResponse })
      }, event);
    }
    
    // PUT - Update a user
    if (event.httpMethod === 'PUT') {
      const { userId, username, password, role } = JSON.parse(event.body);
      
      // Validate input
      if (!userId || (!username && !password && !role)) {
        return addCorsHeaders({
          statusCode: 400,
          body: JSON.stringify({ message: 'User ID and at least one field to update are required' })
        }, event);
      }
      
      // Find user
      const user = await User.findById(userId);
      if (!user) {
        return addCorsHeaders({
          statusCode: 404,
          body: JSON.stringify({ message: 'User not found' })
        }, event);
      }
      
      // Update fields
      if (username) user.username = username;
      if (password) user.passwordHash = await bcrypt.hash(password, 10);
      if (role) user.role = role;
      
      await user.save();
      
      // Return user without password hash
      const userResponse = user.toObject();
      delete userResponse.passwordHash;
      
      return addCorsHeaders({
        statusCode: 200,
        body: JSON.stringify({ message: 'User updated successfully', user: userResponse })
      }, event);
    }
    
    // DELETE - Delete a user
    if (event.httpMethod === 'DELETE') {
      const { userId } = JSON.parse(event.body);
      
      // Validate input
      if (!userId) {
        return addCorsHeaders({
          statusCode: 400,
          body: JSON.stringify({ message: 'User ID is required' })
        }, event);
      }
      
      // Prevent deleting the current user
      if (userId === auth.user.id) {
        return addCorsHeaders({
          statusCode: 400,
          body: JSON.stringify({ message: 'Cannot delete your own account' })
        }, event);
      }
      
      // Delete user
      const result = await User.findByIdAndDelete(userId);
      if (!result) {
        return addCorsHeaders({
          statusCode: 404,
          body: JSON.stringify({ message: 'User not found' })
        }, event);
      }
      
      return addCorsHeaders({
        statusCode: 200,
        body: JSON.stringify({ message: 'User deleted successfully' })
      }, event);
    }
    
    // Method not allowed
    return addCorsHeaders({
      statusCode: 405,
      body: JSON.stringify({ message: 'Method not allowed' })
    }, event);
    
  } catch (error) {
    console.error('Error in users function:', error);
    return addCorsHeaders({
      statusCode: 500,
      body: JSON.stringify({ message: 'Server error', error: error.message })
    }, event);
  }
};
