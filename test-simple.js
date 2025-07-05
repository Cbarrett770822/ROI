const mongoose = require('mongoose');

async function testMongoDBConnection() {
  try {
    console.log('Attempting to connect to MongoDB with a simpler connection string...');
    
    // Connection string with the correct database name
    const uri = 'mongodb+srv://CB770822:Aleconfig@cluster0.eslgbjq.mongodb.net/roi-app-db?retryWrites=true&w=majority&appName=Cluster0';
    
    console.log('Connection string being used:', uri);
    
    await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 5000, // 5 second timeout for server selection
    });
    
    console.log('✅ MongoDB connection successful!');
    console.log('Connection details:', {
      host: mongoose.connection.host,
      port: mongoose.connection.port,
      name: mongoose.connection.name,
      readyState: mongoose.connection.readyState
    });
    
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
