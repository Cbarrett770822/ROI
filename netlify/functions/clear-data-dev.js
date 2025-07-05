const mongoose = require("mongoose");
const { getCorsHeaders, handleCors, addCorsHeaders } = require("./utils/corsHeaders");

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
// Handle CORS preflight requests first
  const corsResponse = handleCors(event);
  if (corsResponse) {
    return corsResponse;
  }

  // For faster cold starts
  context.callbackWaitsForEmptyEventLoop = false;
  
  try {
    // Connect  Company = mongoose.model('Company');
} catch {
  Company = mongoose.model('Company', companySchema);
}

try {
  Questionnaire = mongoose.model('Questionnaire');
} catch {
  Questionnaire = mongoose.model('Questionnaire', questionnaireSchema);
}

// Connect to MongoDB
const connectToDatabase = async () => {
  if (mongoose.connection.readyState !== 1) {
    try {
      await mongoose.connect(process.env.MONGODB_URI, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
      });
      console.log('[clear-data-dev] Connected to MongoDB');
    } catch (error) {
      console.error('[clear-data-dev] MongoDB connection error:', error);
      throw error;
    }
  }
};

exports.handler = async function(event, context) {
   to the database
    await connectToDatabase();
    
    // Development mode - no authentication required
    console.log('[clear-data-dev] Development mode - clearing data without authentication');
    
    // Delete all questionnaires
    const questionnaireResult = await Questionnaire.deleteMany({});
    console.log(`[clear-data-dev] Deleted ${questionnaireResult.deletedCount} questionnaires`);
    
    // Delete all companies
    const companyResult = await Company.deleteMany({});
    console.log(`[clear-data-dev] Deleted ${companyResult.deletedCount} companies`);
    
    // Return success response
    return addCorsHeaders({
      statusCode: 200,
      body: JSON.stringify({
        message: 'Data cleared successfully',
        deletedCompanies: companyResult.deletedCount,
        deletedQuestionnaires: questionnaireResult.deletedCount
      }, event)
    }, event);
    
  } catch (error) {
    console.error('[clear-data-dev] Error:', error);
    return addCorsHeaders({
      statusCode: 500,
      body: JSON.stringify({ 
        message: 'Error clearing data',
        error: error.message
      }, event)
    }, event);
  }
};


// Remember to wrap all responses with addCorsHeaders(response, event);
