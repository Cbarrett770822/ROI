const mongoose = require("mongoose");
const { getCorsHeaders, handleCors, addCorsHeaders } = require('./utils/corsHeaders');

// Define User schema - matching the one in users.js
const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  passwordHash: { type: String, required: true },
  role: { type: String, enum: ['user', 'admin'], default: 'user' }
}, { timestamps: true });

// Create or get the model
let User;
try {
  User = mongoose.model('User');
  console.log('Retrieved existing User model');
} catch {
  User = mongoose.model('User', userSchema);
  console.log('Created new User model');
}

// Connect to MongoDB
async function connectToDatabase() {
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
}

exports.handler = async function(event, context) {
  // For faster cold starts
  context.callbackWaitsForEmptyEventLoop = false;
  
  // Handle CORS preflight requests
  const corsResponse = handleCors(event);
  if (corsResponse) {
    return corsResponse;
  }
  
  try {
    // Connect to the database
    await connectToDatabase();
    
    // Get all users with full details for debugging
    const users = await User.find({}).lean();
    
    console.log('Found users:', JSON.stringify(users, null, 2));
    
    // Check for schema anomalies
    const anomalies = [];
    
    users.forEach((user, index) => {
      // Check for required fields
      if (!user.username) anomalies.push(`User ${index}: Missing username`);
      if (!user.passwordHash) anomalies.push(`User ${index}: Missing passwordHash`);
      if (!user.role) anomalies.push(`User ${index}: Missing role`);
      
      // Check for invalid role values
      if (user.role && !['user', 'admin'].includes(user.role)) {
        anomalies.push(`User ${index}: Invalid role '${user.role}'`);
      }
      
      // Check for _id format issues
      if (!user._id) {
        anomalies.push(`User ${index}: Missing _id`);
      }
      
      // Check for any additional unexpected fields
      const expectedFields = ['_id', 'username', 'passwordHash', 'role', 'createdAt', 'updatedAt', '__v'];
      const unexpectedFields = Object.keys(user).filter(key => !expectedFields.includes(key));
      
      if (unexpectedFields.length > 0) {
        anomalies.push(`User ${index}: Unexpected fields: ${unexpectedFields.join(', ')}`);
      }
    });
    
    // Return the results
    return addCorsHeaders({
      statusCode: 200,
      body: JSON.stringify({
        userCount: users.length,
        users: users.map(user => ({
          id: user._id.toString(),
          username: user.username,
          role: user.role,
          createdAt: user.createdAt,
          updatedAt: user.updatedAt,
          hasPasswordHash: !!user.passwordHash
        })),
        anomalies: anomalies.length > 0 ? anomalies : "No anomalies found"
      })
    }, event);
    
  } catch (error) {
    console.error('Error in debug-users function:', error);
    return addCorsHeaders({
      statusCode: 500,
      body: JSON.stringify({ 
        message: 'Error debugging users', 
        error: error.message,
        stack: error.stack 
      })
    }, event);
  }
}

// Remember to wrap all responses with addCorsHeaders(response, event);
