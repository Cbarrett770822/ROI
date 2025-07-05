// Simple Express server to run Netlify functions directly
import express from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import mongoose from 'mongoose';

// Load environment variables
dotenv.config();

// Setup Express
const app = express();
const PORT = 9999;

// Get directory paths
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// CORS middleware
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', 'http://localhost:8888');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, Accept, Cache-Control, Pragma');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Max-Age', '86400');
  
  if (req.method === 'OPTIONS') {
    return res.status(204).end();
  }
  next();
});

// Parse JSON bodies
app.use(express.json());

// Log all requests
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
  next();
});

// Connect to MongoDB
async function connectToDatabase() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB successfully!');
    
    // List collections
    const collections = await mongoose.connection.db.listCollections().toArray();
    console.log('Available collections:');
    collections.forEach(collection => {
      console.log(`- ${collection.name}`);
    });
  } catch (error) {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  }
}

// Create a simple health check endpoint
app.get('/.netlify/functions/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    time: new Date().toISOString(),
    mongodbStatus: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected'
  });
});

// Create a simple companies endpoint
app.get('/.netlify/functions/companies', async (req, res) => {
  try {
    // Define Company schema inline
    const companySchema = new mongoose.Schema({
      name: { type: String, required: true },
      data: { type: mongoose.Schema.Types.Mixed, default: {} },
      createdBy: { type: String, required: true },
      createdAt: { type: Date, default: Date.now }
    });

    // Get or create the Company model
    let Company;
    try {
      Company = mongoose.model('Company');
    } catch {
      Company = mongoose.model('Company', companySchema);
    }
    
    // Get all companies
    const companies = await Company.find({}).lean();
    
    // Format the response to match what the frontend expects
    const formattedCompanies = companies.map(company => ({
      id: company._id.toString(),
      name: company.name,
      createdBy: company.createdBy,
      createdAt: company.createdAt
    }));
    
    res.json(formattedCompanies);
  } catch (error) {
    console.error('Error fetching companies:', error);
    res.status(500).json({ 
      message: 'Error fetching companies', 
      error: error.message 
    });
  }
});

// Create a simple company creation endpoint
app.post('/.netlify/functions/companies', async (req, res) => {
  try {
    console.log('POST /companies - Request body:', req.body);
    
    const { name } = req.body;
    
    if (!name || typeof name !== 'string' || !name.trim()) {
      console.error('Missing or invalid company name:', name);
      return res.status(400).json({ message: 'Company name is required' });
    }
    
    // Define Company schema inline
    const companySchema = new mongoose.Schema({
      name: { type: String, required: true },
      data: { type: mongoose.Schema.Types.Mixed, default: {} },
      createdBy: { type: String, required: true },
      createdAt: { type: Date, default: Date.now }
    });

    // Get or create the Company model
    let Company;
    try {
      Company = mongoose.model('Company');
    } catch {
      Company = mongoose.model('Company', companySchema);
    }
    
    // Create company with a test username
    const newCompany = new Company({ 
      name: name.trim(), 
      createdBy: 'test-user' 
    });
    
    const savedCompany = await newCompany.save();
    console.log('Company saved successfully:', savedCompany);
    
    // Format the response to match what the frontend expects
    const response = {
      id: savedCompany._id.toString(),
      name: savedCompany.name,
      createdBy: savedCompany.createdBy,
      createdAt: savedCompany.createdAt
    };
    
    console.log('Sending formatted response:', response);
    res.status(201).json(response);
  } catch (error) {
    console.error('Error creating company:', error);
    res.status(500).json({ 
      message: 'Error creating company', 
      error: error.message,
      stack: error.stack
    });
  }
});

// Start server
async function startServer() {
  try {
    // Connect to MongoDB
    await connectToDatabase();
    
    // Start listening
    app.listen(PORT, () => {
      console.log(`Server running at http://localhost:${PORT}`);
      console.log(`API endpoints available at http://localhost:${PORT}/.netlify/functions/`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
  }
}

startServer();
