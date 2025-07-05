const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const { getCorsHeaders, handleCors, addCorsHeaders } = require('./utils/corsHeaders');

// Define User schema
const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  passwordHash: { type: String, required: true },
  role: { type: String, enum: ['user', 'admin'], default: 'user' }
});

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
  // Handle CORS preflight requests first
  const corsResponse = handleCors(event);
  if (corsResponse) {
    return corsResponse;
  }

  // For faster cold starts
  context.callbackWaitsForEmptyEventLoop = false;
  
  try {
    // Connect to the database
    await connectToDatabase();
    
    // New password for regular user
    const newPassword = 'user123';
    const passwordHash = await bcrypt.hash(newPassword, 10);
    
    // Find user and update password
    const result = await User.updateOne(
      { username: 'user' },
      { $set: { passwordHash: passwordHash } }
    );
    
    if (result.matchedCount === 0) {
      return {
        statusCode: 404,
        body: JSON.stringify({ message: 'User not found' })
      };
    }
    
    return {
      statusCode: 200,
      body: JSON.stringify({
        message: 'User password reset successfully',
        username: 'user',
        password: newPassword,
        updated: result.modifiedCount > 0
      })
    };
  } catch (error) {
    console.error('Error resetting user password:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ 
        message: 'Error resetting user password', 
        error: error.message 
      })
    };
  }
};


// Remember to wrap all responses with addCorsHeaders(response, event);
