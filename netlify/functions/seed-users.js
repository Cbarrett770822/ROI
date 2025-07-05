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
    
    // Check if users already exist
    const existingUsers = await User.find({});
    if (existingUsers.length > 0) {
      return {
        statusCode: 200,
        body: JSON.stringify({ 
          message: 'Users already exist', 
          count: existingUsers.length,
          users: existingUsers.map(u => ({ username: u.username, role: u.role }))
        })
      };
    }
    
    // Create admin user
    const adminPasswordHash = await bcrypt.hash('admin123', 10);
    const adminUser = new User({
      username: 'admin',
      passwordHash: adminPasswordHash,
      role: 'admin'
    });
    await adminUser.save();
    
    // Create regular user
    const userPasswordHash = await bcrypt.hash('user123', 10);
    const regularUser = new User({
      username: 'user',
      passwordHash: userPasswordHash,
      role: 'user'
    });
    await regularUser.save();
    
    return {
      statusCode: 200,
      body: JSON.stringify({ 
        message: 'Users created successfully',
        users: [
          { username: 'admin', role: 'admin' },
          { username: 'user', role: 'user' }
        ]
      })
    };
  } catch (error) {
    console.error('Error seeding users:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ 
        message: 'Error seeding users', 
        error: error.message 
      })
    };
  }
};


// Remember to wrap all responses with addCorsHeaders(response, event);
