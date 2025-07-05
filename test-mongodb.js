const mongoose = require('mongoose');
const dns = require('dns');

// Set mongoose debug mode to true for verbose logging
mongoose.set('debug', true);

// Test DNS resolution first
console.log('Testing DNS resolution for MongoDB hosts...');
const hosts = [
  'ac-lbxnpqn-shard-00-00.kcvzjmk.mongodb.net',
  'ac-lbxnpqn-shard-00-01.kcvzjmk.mongodb.net',
  'ac-lbxnpqn-shard-00-02.kcvzjmk.mongodb.net',
  'cluster0.kcvzjmk.mongodb.net'
];

// Test both connection string formats
const connectionStrings = {
  srv: 'mongodb+srv://admin:wmsadmin@cluster0.kcvzjmk.mongodb.net/roi-warehouse?retryWrites=true&w=majority',
  direct: 'mongodb://admin:wmsadmin@ac-lbxnpqn-shard-00-00.kcvzjmk.mongodb.net:27017,ac-lbxnpqn-shard-00-01.kcvzjmk.mongodb.net:27017,ac-lbxnpqn-shard-00-02.kcvzjmk.mongodb.net:27017/roi-warehouse?ssl=true&replicaSet=atlas-aqvlvn-shard-0&authSource=admin&retryWrites=true&w=majority'
};

// DNS resolution test
Promise.all(hosts.map(host => {
  return new Promise((resolve) => {
    dns.lookup(host, (err, address) => {
      if (err) {
        console.log(`❌ DNS resolution failed for ${host}:`, err.code);
        resolve(false);
      } else {
        console.log(`✅ DNS resolution successful for ${host}: ${address}`);
        resolve(true);
      }
    });
  });
})).then(async (results) => {
  const allResolved = results.every(result => result === true);
  console.log(`DNS resolution test ${allResolved ? 'PASSED' : 'FAILED'}`);
  
  // Now test MongoDB connections
  console.log('\n--- Testing MongoDB Connections ---');
  
  // Test SRV connection string first
  try {
    console.log('\n1. Testing SRV connection string...');
    console.log(`Connection string: ${connectionStrings.srv}`);
    await testConnection(connectionStrings.srv);
  } catch (error) {
    console.error('SRV connection test failed:', error);
  }
  
  // Then test direct connection string
  try {
    console.log('\n2. Testing direct connection string...');
    console.log(`Connection string: ${connectionStrings.direct}`);
    await testConnection(connectionStrings.direct);
  } catch (error) {
    console.error('Direct connection test failed:', error);
  }
});

async function testConnection(uri) {
  try {
    console.log('Attempting to connect to MongoDB...');
    
    const connection = await mongoose.connect(uri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 5000, // 5 second timeout
      connectTimeoutMS: 10000, // 10 second timeout
    });
    
    console.log('✅ MongoDB connection successful!');
    console.log('Connection details:', {
      host: connection.connection.host,
      port: connection.connection.port,
      name: connection.connection.name,
      readyState: connection.connection.readyState
    });
    
    // List all collections to verify access
    const collections = await connection.connection.db.listCollections().toArray();
    console.log('Available collections:', collections.map(c => c.name));
    
    // Close the connection
    await connection.connection.close();
    console.log('Connection closed successfully');
    return true;
  } catch (error) {
    console.error('❌ MongoDB connection error:', error);
    if (error.name === 'MongoServerSelectionError') {
      console.error('Server selection timed out. This usually means the server is unreachable.');
      console.error('Topology description:', error.topology?.description?.servers);
    }
    throw error;
  }
}
