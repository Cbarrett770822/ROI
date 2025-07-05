const mongoose = require("mongoose");

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
    
    // Get database information
    const dbName = mongoose.connection.db.databaseName;
    console.log(`Connected to database: ${dbName}`);
    
    // List all collections
    const collections = await mongoose.connection.db.listCollections().toArray();
    const collectionNames = collections.map(c => c.name);
    
    // Get all users with their details (excluding password hashes for security)
    const users = await User.find({}, { passwordHash: 0 }).lean();
    
    // Get count of documents in each collection
    const collectionCounts = {};
    for (const name of collectionNames) {
      collectionCounts[name] = await mongoose.connection.db.collection(name).countDocuments();
    }
    
    // Get all users with password hash prefixes (for debugging)
    const usersWithHashPrefixes = await User.find({}).lean().then(users => 
      users.map(user => ({
        _id: user._id.toString(),
        username: user.username,
        role: user.role,
        passwordHashPrefix: user.passwordHash ? user.passwordHash.substring(0, 20) + '...' : 'none'
      }))
    );
    
    return {
      statusCode: 200,
      body: JSON.stringify({
        database: dbName,
        collections: collectionNames,
        collectionCounts,
        users,
        usersWithHashPrefixes
      }, null, 2)
    };
  } catch (error) {
    console.error('Error listing database info:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ 
        message: 'Error listing database info', 
        error: error.message 
      })
    };
  }
};


// Remember to wrap all responses with addCorsHeaders(response, event);
