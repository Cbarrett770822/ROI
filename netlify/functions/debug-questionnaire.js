const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const { corsHeaders, handleCors, addCorsHeaders } = require("./utils/corsHeaders");

const { getCorsHeaders, handleCors, addCorsHeaders } = require('./utils/corsHeaders');

// MongoDB Schema for Company
const companySchema = new mongoose.Schema({
  name: { type: String, required: true },
  data: { type: mongoose.Schema.Types.Mixed, default: {} },
  createdBy: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
  questionnaire: {
    answers: { type: mongoose.Schema.Types.Mixed, default: {} }
  }
});

// Create or get the model
let Company;
try {
  // Try to get the model if it exists
  Company = mongoose.model('Company');
} catch {
  // Create the model if it doesn't exist
  Company = mongoose.model('Company', companySchema);
}

// Connect to MongoDB
const connectToDatabase = async () => {
  if (mongoose.connection.readyState !== 1) {
    try {
      await mongoose.connect(process.env.MONGODB_URI, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
      });
      console.log('Connected to MongoDB in debug-questionnaire function');
    } catch (error) {
      console.error('MongoDB connection error:', error);
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
  
  // Handle CORS preflight requests
  const corsResponse = handleCors(event);
  if (corsResponse) {
    return corsResponse;
  }
  
  // Log request details for debugging
  console.log('Debug-questionnaire request:', {
    path: event.path,
    method: event.httpMethod,
    headers: event.headers
  });
  
  try {
    // Connect to the database
    await connectToDatabase();
    
    // Extract company ID from path if present
    const path = event.path.split('/');
    const companyId = path[path.length - 1] !== 'debug-questionnaire' ? path[path.length - 1] : null;
    
    // Log the extracted company ID
    console.log('Extracted company ID:', companyId);
    
    // Debug info to return
    const debugInfo = {
      event: {
        path: event.path,
        httpMethod: event.httpMethod,
        headers: event.headers,
        queryStringParameters: event.queryStringParameters,
        body: event.body ? JSON.parse(event.body) : null,
      },
      companyId,
      mongodbStatus: mongoose.connection.readyState,
      companies: []
    };
    
    // Get all companies (limited info for security)
    try {
      const companies = await Company.find({}, 'name createdBy createdAt questionnaire').lean();
      console.log(`Found ${companies.length} companies`);
      debugInfo.companies = companies.map(company => ({
      id: company._id,
      name: company.name,
      createdBy: company.createdBy,
      createdAt: company.createdAt,
      hasQuestionnaire: !!company.questionnaire,
      answerCount: company.questionnaire?.answers ? Object.keys(company.questionnaire.answers).length : 0
    }));
    } catch (err) {
      console.error('Error fetching companies:', err);
      debugInfo.error = 'Error fetching companies: ' + err.message;
    }
    
    // If a specific company ID was provided, get more details
    if (companyId) {
      try {
        const company = await Company.findById(companyId).lean();
        console.log('Found specific company:', company ? company._id : 'not found');
        if (company) {
        debugInfo.specificCompany = {
          id: company._id,
          name: company.name,
          createdBy: company.createdBy,
          createdAt: company.createdAt,
          questionnaire: company.questionnaire || { answers: {} }
        };
      } else {
        debugInfo.specificCompany = null;
        debugInfo.error = `Company with ID ${companyId} not found`;
      }
      } catch (err) {
        console.error('Error fetching specific company:', err);
        debugInfo.error = 'Error fetching specific company: ' + err.message;
      }
    }
    
    return addCorsHeaders({
      statusCode: 200,
      body: JSON.stringify(debugInfo)
    }, event);
  } catch (error) {
    console.error('Error in debug-questionnaire function:', error);
    return addCorsHeaders({
      statusCode: 500,
      body: JSON.stringify({ 
        message: 'Internal server error', 
        error: error.message,
        stack: error.stack
      }, event)
    });
  }
};


// Remember to wrap all responses with addCorsHeaders(response, event);
