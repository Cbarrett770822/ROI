const mongoose = require('mongoose');

async function testMongoDBConnection() {
  try {
    console.log('Attempting to connect to MongoDB with the new connection string...');
    
    // The new connection string with roi-warehouse database name and URL-encoded password
    const uri = 'mongodb+srv://charlesbtt7722:%3C%21Aleconfig770822%21%3E@cluster0.eslgbjq.mongodb.net/roi-warehouse?retryWrites=true&w=majority&appName=Cluster0';
    
    await mongoose.connect(uri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 5000, // 5 second timeout for server selection
      socketTimeoutMS: 45000, // Close sockets after 45 seconds of inactivity
      family: 4, // Use IPv4, skip trying IPv6
    });
    
    console.log('✅ MongoDB connection successful!');
    console.log('Connection details:', {
      host: mongoose.connection.host,
      port: mongoose.connection.port,
      name: mongoose.connection.name,
      readyState: mongoose.connection.readyState
    });
    
    // List all collections to verify access
    const collections = await mongoose.connection.db.listCollections().toArray();
    console.log('Available collections:', collections.map(c => c.name));
    
    // Close the connection
    await mongoose.connection.close();
    console.log('Connection closed successfully');
  } catch (error) {
    console.error('❌ MongoDB connection error:', error);
    if (error.name === 'MongoServerSelectionError') {
      console.error('Server selection timed out. This usually means the server is unreachable.');
      console.error('Possible causes: IP not whitelisted, network issues, or incorrect credentials');
    }
  }
}

// Run the test
testMongoDBConnection();
