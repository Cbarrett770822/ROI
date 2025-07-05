const mongoose = require("mongoose");
const { getCorsHeaders, handleCors, addCorsHeaders } = require("./utils/corsHeaders");
const jwt = require("jsonwebtoken");

const { getCorsHeaders, handleCors, addCorsHeaders } = require('./utils/corsHeaders');

// MongoDB Schema for Company
const companySchema = new mongoose.Schema({
  name: { type: String, required: true },
  data: { type: mongoose.Schema.Types.Mixed, default: {} },
  createdBy: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
});

// MongoDB Schema for Questionnaire
const questionnaireSchema = new mongoose.Schema({
  companyId: { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'Company' },
  data: { type: mongoose.Schema.Types.Mixed, default: {} },
  createdBy: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Create or get the models
let Company, Questionnaire;
try {
  Company = mongoose.model('Company');
} catch {
  Company = mongoose.model('Company', companySchema);
}

try {
  Questionnaire = mongoose.model('Questionnaire');
} catch {
  Questionnaire = mongoose.model('Questionnaire', questionnaireSchema);
}

// Middleware to verify JWT token
const verifyToken = (event) => {
  try {
    const token = event.headers.authorization?.split(' ')[1];
    if (!token) {
      return { isValid: false, error: 'No token provided' };
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    return { isValid: true, user: decoded };
  } catch (error) {
    console.error('[Auth Debug] Token verification error:', error.message);
    return { isValid: false, error: 'Invalid token', debug: error.message };
  }
};

// Connect to MongoDB
const connectToDatabase = async () => {
  if (mongoose.connection.readyState !== 1) {
    try {
      await mongoose.connect(process.env.MONGODB_URI, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
      });
      console.log('[clear-data] Connected to MongoDB');
    } catch (error) {
      console.error('[clear-data] MongoDB connection error:', error);
      throw error;
    }
  }
};

exports.handler = async function(event, context) {
  // Handle CORS preflight requests first
  const corsResponse = handleCors(event);
  if (corsResponse) {
    return corsResponse;
  }

  // For faster cold starts
  context.callbackWaitsForEmptyEventLoop = false;
  
  try {
    // Connect to the database
    await connectToDatabase();
    
    // Handle CORS preflight requests
    const corsResponse = handleCors(event);
    if (corsResponse) {
      return corsResponse;
    }
    
    // Verify token for all requests except OPTIONS
    const auth = verifyToken(event);
    if (!auth.isValid) {
      return addCorsHeaders({
        statusCode: 401,
        body: JSON.stringify({ message: auth.error })
      }, event);
    }
    
    // Only allow admin users to clear data
    if (auth.user.role !== 'admin') {
      console.log('[clear-data] Non-admin user attempted to clear data:', auth.user.username);
      return addCorsHeaders({
        statusCode: 403,
        body: JSON.stringify({ message: 'Only admin users can clear data' })
      }, event);
    }
    
    console.log('[clear-data] Admin user clearing data:', auth.user.username);
    
    // Delete all questionnaires
    const questionnaireResult = await Questionnaire.deleteMany({});
    console.log(`[clear-data] Deleted ${questionnaireResult.deletedCount} questionnaires`);
    
    // Delete all companies
    const companyResult = await Company.deleteMany({});
    console.log(`[clear-data] Deleted ${companyResult.deletedCount} companies`);
    
    // Return success response
    return addCorsHeaders({
      statusCode: 200,
      body: JSON.stringify({
        message: 'Data cleared successfully',
        deletedCompanies: companyResult.deletedCount,
        deletedQuestionnaires: questionnaireResult.deletedCount
      })
    }, event);
    
  } catch (error) {
    console.error('[clear-data] Error:', error);
    return addCorsHeaders({
      statusCode: 500,
      body: JSON.stringify({ 
        message: 'Error clearing data',
        error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
      })
    }, event);
  }
};


// Remember to wrap all responses with addCorsHeaders(response, event);
