const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
require('dotenv').config();

// Import routes
const companiesRoutes = require('./routes/companies');
const questionnaireRoutes = require('./routes/questionnaire');

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

// Connect to MongoDB (using in-memory MongoDB for simplicity in this example)
// In a real application, you would connect to a real MongoDB instance
mongoose.connect('mongodb://localhost:27017/supply-chain-assessment', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => {
  console.log('Connected to MongoDB');
  
  // Start the server
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
})
.catch(err => {
  console.error('Failed to connect to MongoDB', err);
  
  // If MongoDB connection fails, we'll use in-memory data for this example
  console.log('Using in-memory data storage instead');
  
  // Start the server anyway
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT} (with in-memory data)`);
  });
});
