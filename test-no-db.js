const mongoose = require('mongoose');

async function testMongoDBConnection() {
  try {
    console.log('Attempting to connect to MongoDB without specifying a database...');
    
    // Connection string without database name
    const uri = 'mongodb+srv://CB770822:Aleconfig@cluster0.eslgbjq.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0';
    
    console.log('Connection string being used:', uri);
    
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
    
    // List all available databases
    const adminDb = mongoose.connection.db.admin();
    const dbs = await adminDb.listDatabases();
    console.log('Available databases:', dbs.databases.map(db => db.name));
    
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
