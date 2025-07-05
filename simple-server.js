// Simple Express server for running Netlify functions locally
const express = require('express');
const dotenv = require('dotenv');
const mongoose = require('mongoose');
const path = require('path');
const fs = require('fs');

// Load environment variables
dotenv.config();

// Setup Express
const app = express();
const PORT = process.env.PORT || 9999;

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
    
    return mongoose.connection;
  } catch (error) {
    console.error('MongoDB connection error:', error);
    throw error;
  }
}

// Create a simple health check endpoint
app.get('/.netlify/functions/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    time: new Date().toISOString(),
    mongodbStatus: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
    environment: {
      NODE_ENV: process.env.NODE_ENV,
      MONGODB_URI: process.env.MONGODB_URI ? 'Set (hidden)' : 'Not set',
      JWT_SECRET: process.env.JWT_SECRET ? 'Set (hidden)' : 'Not set'
    }
  });
});

// Implement auth-login endpoint directly
app.post('/.netlify/functions/auth-login', async (req, res) => {
  try {
    console.log('Auth login endpoint called');
    
    // Connect to MongoDB if not already connected
    if (mongoose.connection.readyState !== 1) {
      await connectToDatabase();
    }
    
    const { username, password } = req.body;
    console.log('Login attempt for username:', username);
    
    // Define User schema directly
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
    
    // Find user in database
    const user = await User.findOne({ username });
    if (!user) {
      console.log('User not found:', username);
      return res.status(401).json({ message: 'Invalid credentials.' });
    }
    
    console.log('User found:', username, 'with role:', user.role);
    
    // Compare password (simplified for testing)
    const bcrypt = require('bcryptjs');
    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) {
      console.log('Password invalid for user:', username);
      return res.status(401).json({ message: 'Invalid credentials.' });
    }
    
    console.log('Password valid, generating token...');
    
    // Generate JWT token
    const jwt = require('jsonwebtoken');
    const token = jwt.sign(
      { userId: user._id, username: user.username, role: user.role },
      process.env.JWT_SECRET || 'changeme-secret',
      { expiresIn: '2h' }
    );
    
    console.log('Login successful for:', username);
    
    return res.status(200).json({ 
      token, 
      user: { username: user.username, role: user.role } 
    });
  } catch (err) {
    console.error('Login error:', err);
    return res.status(500).json({ 
      message: 'Login failed.', 
      error: err.message 
    });
  }
});

// Implement companies endpoint directly
app.get('/.netlify/functions/companies', async (req, res) => {
  try {
    console.log('GET /companies endpoint called');
    
    // Connect to MongoDB if not already connected
    if (mongoose.connection.readyState !== 1) {
      await connectToDatabase();
    }
    
    // Verify JWT token
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ message: 'No token provided' });
    }
    
    // Verify token
    const jwt = require('jsonwebtoken');
    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET || 'changeme-secret');
    } catch (error) {
      return res.status(401).json({ message: 'Invalid token' });
    }
    
    const { username, role } = decoded;
    console.log('Username:', username, 'Role:', role);
    
    // Define Company schema
    const companySchema = new mongoose.Schema({
      name: { type: String, required: true },
      data: { type: mongoose.Schema.Types.Mixed, default: {} },
      createdBy: { type: String, required: true },
      createdAt: { type: Date, default: Date.now }
    });
    
    // Create or get the model
    let Company;
    try {
      Company = mongoose.model('Company');
    } catch {
      Company = mongoose.model('Company', companySchema);
    }
    
    let companies;
    if (role === 'admin') {
      // Admin can see all companies
      console.log('Admin user, fetching all companies');
      companies = await Company.find({}).lean();
    } else {
      // Regular users can only see their own companies
      console.log('Regular user, fetching companies created by:', username);
      companies = await Company.find({ createdBy: username }).lean();
    }
    
    console.log('Found companies:', companies);
    
    // Format the response to match what the frontend expects
    const formattedCompanies = companies.map(company => ({
      id: company._id.toString(),
      name: company.name,
      createdBy: company.createdBy,
      createdAt: company.createdAt
    }));
    
    console.log('Formatted companies:', formattedCompanies);
    
    return res.status(200).json(formattedCompanies);
  } catch (error) {
    console.error('Error fetching companies:', error);
    return res.status(500).json({ 
      message: 'Error fetching companies', 
      error: error.message 
    });
  }
});

// Implement company creation endpoint directly
app.post('/.netlify/functions/companies', async (req, res) => {
  try {
    console.log('POST /companies - Request body:', req.body);
    
    // Connect to MongoDB if not already connected
    if (mongoose.connection.readyState !== 1) {
      await connectToDatabase();
    }
    
    // Verify JWT token
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ message: 'No token provided' });
    }
    
    // Verify token
    const jwt = require('jsonwebtoken');
    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET || 'changeme-secret');
    } catch (error) {
      return res.status(401).json({ message: 'Invalid token' });
    }
    
    const { username } = decoded;
    const { name } = req.body;
    
    if (!name || typeof name !== 'string' || !name.trim()) {
      console.error('Missing or invalid company name:', name);
      return res.status(400).json({ message: 'Company name is required' });
    }
    
    // Define Company schema
    const companySchema = new mongoose.Schema({
      name: { type: String, required: true },
      data: { type: mongoose.Schema.Types.Mixed, default: {} },
      createdBy: { type: String, required: true },
      createdAt: { type: Date, default: Date.now }
    });
    
    // Create or get the model
    let Company;
    try {
      Company = mongoose.model('Company');
    } catch {
      Company = mongoose.model('Company', companySchema);
    }
    
    // Create company
    const newCompany = new Company({ 
      name: name.trim(), 
      createdBy: username 
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
    return res.status(201).json(response);
  } catch (error) {
    console.error('Error creating company:', error);
    return res.status(500).json({ 
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
      console.log(`Health check: http://localhost:${PORT}/.netlify/functions/health`);
    });
    
    // Keep the process alive
    setInterval(() => {
      console.log('Server heartbeat - still running at ' + new Date().toISOString());
    }, 60000);
  } catch (error) {
    console.error('Failed to start server:', error);
  }
}

// Global error handlers
process.on('uncaughtException', (err) => {
  console.error('UNCAUGHT EXCEPTION:', err);
  // Keep the process alive
  console.log('Server continuing despite error...');
});

process.on('unhandledRejection', (err) => {
  console.error('UNHANDLED REJECTION:', err);
  // Keep the process alive
  console.log('Server continuing despite rejection...');
});

// Start the server
startServer();
