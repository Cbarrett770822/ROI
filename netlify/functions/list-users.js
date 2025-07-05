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
    
    return addCorsHeaders({
      statusCode: 200,
      body: JSON.stringify({
        database: dbName,
        collections: collectionNames,
        collectionCounts,
        users,
        usersWithHashPrefixes
      }, null, 2)
    }, event);
  } catch (error) {
    console.error('Error listing database info:', error);
    return addCorsHeaders({
      statusCode: 500,
      body: JSON.stringify({ 
        message: 'Error listing database info', 
        error: error.message 
      })
    }, event);
  }
};


// Remember to wrap all responses with addCorsHeaders(response, event);
