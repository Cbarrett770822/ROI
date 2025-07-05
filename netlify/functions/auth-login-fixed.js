const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

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
// Try both connection formats
const MONGODB_URI = 'mongodb+srv://CB770822:goOX1mZbVY41Qkir@cluster0.eslgbjq.mongodb.net/roi-app-db?retryWrites=true&w=majority&appName=Cluster0';

// Connect to MongoDB
async function dbConnect() {
  if (mongoose.connection.readyState !== 1) {
    try {
      // Add more connection options for better reliability
      await mongoose.connect(MONGODB_URI, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        serverSelectionTimeoutMS: 5000, // 5 second timeout for server selection
        socketTimeoutMS: 45000, // Close sockets after 45 seconds of inactivity
        family: 4, // Use IPv4, skip trying IPv6
      });
      console.log('Connected to MongoDB');
    } catch (error) {
      console.error('MongoDB connection error:', error);
      // Log more detailed error information
      if (error.name === 'MongoServerSelectionError') {
        console.error('Server selection timed out. This usually means the server is unreachable.');
        console.error('Possible causes: IP not whitelisted, network issues, or incorrect credentials');
      }
      throw error;
    }
  }
  return mongoose.connection;
}

// Helper function to add CORS headers to any response
const addCorsHeaders = (response) => {
  // Always use the specific frontend domain
  const corsHeaders = {
    'Access-Control-Allow-Origin': 'https://wms-roi.netlify.app',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization, Accept, Cache-Control, Pragma',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Credentials': 'true',
    'Access-Control-Max-Age': '86400',
    'Content-Type': 'application/json'
  };
  
  return {
    ...response,
    headers: {
      ...response.headers,
      ...corsHeaders
    }
  };
};

exports.handler = async function(event, context) {
  // Log all request details for debugging
  console.log('Auth login function - Request details:', {
    method: event.httpMethod,
    path: event.path,
    origin: event.headers.origin || 'No origin header',
    host: event.headers.host,
    referer: event.headers.referer || 'No referer',
    headers: JSON.stringify(event.headers)
  });
  
  // Handle CORS preflight requests directly
  if (event.httpMethod === 'OPTIONS') {
    console.log('Handling OPTIONS preflight request directly');
    return {
      statusCode: 204, // No content
      headers: {
        'Access-Control-Allow-Origin': 'https://wms-roi.netlify.app',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization, Accept, Cache-Control, Pragma',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Credentials': 'true',
        'Access-Control-Max-Age': '86400'
      },
      body: ''
    };
  }
  
  // For faster cold starts
  context.callbackWaitsForEmptyEventLoop = false;
  
  console.log('Auth login function called');
  
  // Handle only POST requests
  if (event.httpMethod !== 'POST') {
    return addCorsHeaders({
      statusCode: 405,
      body: JSON.stringify({ message: 'Method Not Allowed' })
    });
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
      return addCorsHeaders({
        statusCode: 401,
        body: JSON.stringify({ message: 'Invalid credentials.' })
      });
    }
    
    console.log('User found:', username, 'with role:', user.role);
    console.log('Comparing password...');
    
    // Compare password
    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) {
      console.log('Password invalid for user:', username);
      return addCorsHeaders({
        statusCode: 401,
        body: JSON.stringify({ message: 'Invalid credentials.' })
      });
    }
    
    console.log('Password valid, generating token...');
    
    // Generate JWT token
    const token = jwt.sign(
      { userId: user._id, username: user.username, role: user.role },
      JWT_SECRET,
      { expiresIn: '2h' }
    );
    
    console.log('Login successful for:', username);
    
    return addCorsHeaders({
      statusCode: 200,
      body: JSON.stringify({ token, user: { username: user.username, role: user.role } })
    });
  } catch (err) {
    console.error('Login error:', err);
    return addCorsHeaders({
      statusCode: 500,
      body: JSON.stringify({ message: 'Login failed.', error: err.message })
    });
  }
};
