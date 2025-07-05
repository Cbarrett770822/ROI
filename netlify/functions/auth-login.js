const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

// Import CORS utilities with absolute path to avoid Netlify build issues
const withCors = require("./utils/withCors");
// Also import corsHeaders directly in case it's needed
const corsUtils = require("./utils/corsHeaders");
const { getCorsHeaders, handleCors, addCorsHeaders } = corsUtils;

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
