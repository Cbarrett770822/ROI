// Test MongoDB connection
import mongoose from 'mongoose';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

async function testConnection() {
  console.log('Testing MongoDB connection...');
  console.log('MongoDB URI:', process.env.MONGODB_URI ? 'Found (hidden for security)' : 'Not found');
  
  try {
    // Connect to MongoDB
    console.log('Attempting to connect to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    
    console.log('✅ Successfully connected to MongoDB!');
    console.log('Connection state:', mongoose.connection.readyState);
    console.log('Database name:', mongoose.connection.name);
    
    // List collections
    console.log('\nCollections in database:');
    const collections = await mongoose.connection.db.listCollections().toArray();
    collections.forEach(collection => {
      console.log(`- ${collection.name}`);
    });
    
    // Close connection
    await mongoose.connection.close();
    console.log('\nConnection closed successfully.');
  } catch (error) {
    console.error('❌ MongoDB connection error:', error);
  }
}

// Run the test
testConnection()
  .then(() => console.log('Test completed.'))
  .catch(err => console.error('Test failed:', err));
