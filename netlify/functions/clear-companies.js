const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");

// MongoDB Schema for Company
const companySchema = new mongoose.Schema({
  name: { type: String, required: true },
  data: { type: mongoose.Schema.Types.Mixed, default: {} },
  createdBy: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
});

// Create or get the model
let Company;
try {
  // Try to get the model if it exists
  Company = mongoose.model('Company');
} catch {
  // Create the model if it doesn't exist
  Company = mongoose.model('Company', companySchema);
}

// Middleware to verify JWT token and check admin role
const verifyAdminToken = (event) => {
  try {
    const token = event.headers.authorization?.split(' ')[1];
    if (!token) {
      return { isValid: false, error: 'No token provided' };
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (decoded.role !== 'admin') {
      return { isValid: false, error: 'Admin access required' };
    }
    
    return { isValid: true, user: decoded };
  } catch (error) {
    return { isValid: false, error: 'Invalid token' };
  }
};

// Connect to MongoDB
const connectToDatabase = async () => {
  if (mongoose.connection.readyState !== 1) {
    try {
      await mongoose.connect(process.env.MONGODB_URI, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
      });
      console.log('Connected to MongoDB');
    } catch (error) {
      console.error('MongoDB connection error:', error);
      throw error;
    }
  }
};

exports.handler = async function(event, context) {
  // For faster cold starts
  context.callbackWaitsForEmptyEventLoop = false;
  
  // Only allow POST method
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ message: 'Method not allowed' })
    };
  }
  
  try {
    // Connect to the database
    await connectToDatabase();
    
    // Verify admin token
    const auth = verifyAdminToken(event);
    if (!auth.isValid) {
      return {
        statusCode: 401,
        body: JSON.stringify({ message: auth.error })
      };
    }
    
    // Clear all companies
    const result = await Company.deleteMany({});
    
    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        'Access-Control-Allow-Methods': 'POST, OPTIONS'
      },
      body: JSON.stringify({ 
        message: 'All companies cleared successfully', 
        deletedCount: result.deletedCount 
      })
    };
  } catch (error) {
    console.error('Error clearing companies:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ 
        message: 'Failed to clear companies', 
        error: error.message 
      })
    };
  }
};
