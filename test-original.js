const mongoose = require('mongoose');

async function testMongoDBConnection() {
  try {
    console.log('Attempting to connect to MongoDB with the original connection string format...');
    
    // Original connection string format with correct database name
    const uri = 'mongodb+srv://admin:wmsadmin@cluster0.mongodb.net/roi-app-db?retryWrites=true&w=majority';
    
    console.log('Connection string being used:', uri);
    
    await mongoose.connect(uri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
      family: 4,
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
