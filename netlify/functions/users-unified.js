const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

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
let cachedDb = null;
async function connectToDatabase() {
  if (cachedDb) {
    console.log('Using cached database connection');
    return cachedDb;
  }
  
  // Use the MongoDB Atlas connection string from environment variables or fallback
  const uri = process.env.MONGODB_URI || 'mongodb+srv://CB770822:goOX1mZbVY41Qkir@cluster0.eslgbjq.mongodb.net/roi-app-db?retryWrites=true&w=majority&appName=Cluster0';
  console.log('Connecting to MongoDB...');
  
  try {
    const client = await mongoose.connect(uri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
      family: 4 // Use IPv4, skip trying IPv6
    });
    
    cachedDb = client.connection.db;
    console.log('MongoDB connected successfully');
    return cachedDb;
  } catch (error) {
    console.error('MongoDB connection error:', error);
    throw error;
  }
}

// Verify JWT token middleware
const verifyToken = (event) => {
  try {
    const token = event.headers.authorization?.split(' ')[1];
    if (!token) {
      console.log('No token provided in request');
      return { isValid: false, error: 'No token provided' };
    }
    
    // Use fallback secret if environment variable is not set
    const jwtSecret = process.env.JWT_SECRET || 'changeme-secret';
    console.log('Verifying token with secret');
    
    const decoded = jwt.verify(token, jwtSecret);
    console.log('Token verified successfully for user:', decoded.username);
    return { isValid: true, user: decoded };
  } catch (error) {
    console.error('Token verification failed:', error.message);
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
  
  // Verify token for all requests
  console.log('Verifying token from authorization header:', event.headers.authorization);
  const auth = verifyToken(event);
  console.log('Token verification result:', auth);
  if (!auth.isValid) {
    console.log('Invalid token, returning 401');
    return {
      statusCode: 401,
      body: JSON.stringify({ message: auth.error })
    };
  }
  
  // Only admins can access user management
  if (!isAdmin(auth.user)) {
    return {
      statusCode: 403,
      body: JSON.stringify({ message: 'Admin access required' })
    };
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
        return {
          statusCode: 200,
          body: JSON.stringify({ users })
        };
      } catch (error) {
        console.error('Error fetching users:', error);
        return {
          statusCode: 500,
          body: JSON.stringify({ message: 'Error fetching users', error: error.message })
        };
      }
    }
    
    // POST - Create a new user
    if (event.httpMethod === 'POST') {
      const { username, password, role } = JSON.parse(event.body);
      
      // Validate input
      if (!username || !password || !role) {
        return {
          statusCode: 400,
          body: JSON.stringify({ message: 'Username, password and role are required' })
        };
      }
      
      // Check if user already exists
      const existingUser = await User.findOne({ username });
      if (existingUser) {
        return {
          statusCode: 409,
          body: JSON.stringify({ message: 'Username already exists' })
        };
      }
      
      // Hash password and create user
      const passwordHash = await bcrypt.hash(password, 10);
      const newUser = new User({ username, passwordHash, role });
      await newUser.save();
      
      // Return user without password hash
      const userResponse = newUser.toObject();
      delete userResponse.passwordHash;
      
      return {
        statusCode: 201,
        body: JSON.stringify({ message: 'User created successfully', user: userResponse })
      };
    }
    
    // PUT - Update a user
    if (event.httpMethod === 'PUT') {
      const { userId, username, password, role } = JSON.parse(event.body);
      
      // Validate input
      if (!userId || (!username && !password && !role)) {
        return {
          statusCode: 400,
          body: JSON.stringify({ message: 'User ID and at least one field to update are required' })
        };
      }
      
      // Find user
      const user = await User.findById(userId);
      if (!user) {
        return {
          statusCode: 404,
          body: JSON.stringify({ message: 'User not found' })
        };
      }
      
      // Update fields
      if (username) user.username = username;
      if (password) user.passwordHash = await bcrypt.hash(password, 10);
      if (role) user.role = role;
      
      await user.save();
      
      // Return user without password hash
      const userResponse = user.toObject();
      delete userResponse.passwordHash;
      
      return {
        statusCode: 200,
        body: JSON.stringify({ message: 'User updated successfully', user: userResponse })
      };
    }
    
    // DELETE - Delete a user
    if (event.httpMethod === 'DELETE') {
      const { userId } = JSON.parse(event.body);
      
      // Validate input
      if (!userId) {
        return {
          statusCode: 400,
          body: JSON.stringify({ message: 'User ID is required' })
        };
      }
      
      // Prevent deleting the current user
      if (userId === auth.user.id) {
        return {
          statusCode: 400,
          body: JSON.stringify({ message: 'Cannot delete your own account' })
        };
      }
      
      // Delete user
      const result = await User.findByIdAndDelete(userId);
      if (!result) {
        return {
          statusCode: 404,
          body: JSON.stringify({ message: 'User not found' })
        };
      }
      
      return {
        statusCode: 200,
        body: JSON.stringify({ message: 'User deleted successfully' })
      };
    }
    
    // Method not allowed
    return {
      statusCode: 405,
      body: JSON.stringify({ message: 'Method not allowed' })
    };
    
  } catch (error) {
    console.error('Error in users function:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ message: 'Server error', error: error.message })
    };
  }
};
