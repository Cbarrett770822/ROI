// create-roi-db.js
const { MongoClient } = require('mongodb');

// Connection string for your Atlas cluster, with the new DB name
const uri = 'mongodb+srv://charlesbtt7722:8LwMaauBS4Opqody@cluster0.eslgbjq.mongodb.net/roi-app-db?retryWrites=true&w=majority';

// Set your new DB and collection name
const dbName = 'roi-app-db';
const collectionName = 'companies';

async function createDB() {
  const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
  try {
    await client.connect();
    const db = client.db(dbName);
    const companies = db.collection(collectionName);

    // Insert a sample company to create the DB and collection
    const result = await companies.insertOne({ name: 'Sample Company', createdAt: new Date() });
    console.log('Database and collection created! Inserted document ID:', result.insertedId);
  } catch (err) {
    console.error('Error creating DB:', err);
  } finally {
    await client.close();
  }
}

createDB();
