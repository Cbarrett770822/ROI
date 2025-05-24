const express = require('express');
const cors = require('cors');
require('dotenv').config();

// Mock mongoose for compatibility with model files
global.mongoose = {
  Schema: function() {
    return {
      obj: {},
    };
  },
  model: function(modelName) {
    // Return a mock model with common methods
    return {
      find: () => Promise.resolve([]),
      findOne: () => Promise.resolve(null),
      findById: () => Promise.resolve(null),
      create: (data) => Promise.resolve(data),
      updateOne: () => Promise.resolve({ nModified: 1 }),
      deleteOne: () => Promise.resolve({ deletedCount: 1 })
    };
  }
};

// Import routes and services
const companiesRoutes = require('./routes/companies');
const questionnaireRoutes = require('./routes/questionnaire');
const companyDataService = require('./services/companyDataService');

// Initialize express app
const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/companies', companiesRoutes);
app.use('/api/questionnaire', questionnaireRoutes);

// Health check route
app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'ok', message: 'Server is running' });
});

// Initialize data directory and start server
async function startServer() {
  try {
    // Initialize the data directory and default files
    await companyDataService.initDataDirectory();
    console.log('Data directory initialized successfully');
    
    // Start the server
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT} (with file-based storage)`);
    });
  } catch (err) {
    console.error('Failed to initialize data directory:', err);
    process.exit(1);
  }
}

// Start the server
startServer();
