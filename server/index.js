const express = require('express');
const cors = require('cors');
require('dotenv').config();

// Import routes and services
const companiesRouter = require('./routes/companies');
const questionnaireRouter = require('./routes/questionnaire');
const authRouter = require('./routes/auth');
const companyDataService = require('./services/companyDataService');

// Initialize express app
const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', authRouter);
app.use('/api/companies', companiesRouter);
app.use('/api/questionnaire', questionnaireRouter);

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
