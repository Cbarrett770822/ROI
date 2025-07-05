const mongoose = require('mongoose');

async function testMongoDBConnection() {
  try {
    console.log('Attempting to connect to MongoDB with the correct connection string...');
    
    // Connection string with correct database name, username, and updated password
    const uri = 'mongodb+srv://CB770822:goOX1mZbVY41Qkir@cluster0.eslgbjq.mongodb.net/roi-app-db?retryWrites=true&w=majority&appName=Cluster0';
    
    console.log('Connection string being used:', uri);
    console.log('Breaking down the connection string:');
    console.log('- Protocol: mongodb+srv://');
    console.log('- Username: CB770822');
    console.log('- Password: goOX1mZbVY41Qkir');
    console.log('- Cluster/Hostname: cluster0.eslgbjq.mongodb.net');
    console.log('- Database: roi-app-db');
    console.log('- Options: retryWrites=true&w=majority&appName=Cluster0');
    
    await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 5000, // 5 second timeout for server selection
      socketTimeoutMS: 45000, // 45 second timeout for socket operations
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
    }
  }
}

// Run the test
testMongoDBConnection();
