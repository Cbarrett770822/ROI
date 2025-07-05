const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");

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

// Middleware to verify JWT token
const verifyToken = (event) => {
  try {
    const rawAuth = event.headers.authorization;
    console.log('[Auth Debug] Raw Authorization header:', rawAuth);
    const token = rawAuth?.split(' ')[1];
    console.log('[Auth Debug] Extracted token:', token);
    if (!token) {
      return { isValid: false, error: 'No token provided' };
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'changeme-secret');
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
      // Updated connection string with correct credentials and database name
      await mongoose.connect('mongodb+srv://CB770822:goOX1mZbVY41Qkir@cluster0.eslgbjq.mongodb.net/roi-app-db?retryWrites=true&w=majority&appName=Cluster0', {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        serverSelectionTimeoutMS: 5000, // 5 second timeout for server selection
        socketTimeoutMS: 45000, // Close sockets after 45 seconds of inactivity
        family: 4, // Use IPv4, skip trying IPv6
      });
      console.log('Connected to MongoDB');
    } catch (error) {
      console.error('MongoDB connection error:', error);
      throw error;
    }
  }
};

// Helper function to save questionnaire with retry logic for transient MongoDB errors
const saveQuestionnaireWithRetry = async (company, answers, maxRetries = 3) => {
  let attempt = 1;
  let lastError = null;
  
  while (attempt <= maxRetries) {
    try {
      console.log(`Attempting to save questionnaire (attempt ${attempt} of ${maxRetries})`);
      
      // Set the answers in the company document
      company.questionnaire = { answers };
      
      // Save the company document
      await company.save();
      
      console.log('Questionnaire saved successfully');
      return { success: true };
    } catch (error) {
      lastError = error;
      
      // Check if this is a transient error that we should retry
      const isTransientError = 
        error.code === 112 || // WriteConflict
        (error.errorLabels && error.errorLabels.includes('TransientTransactionError'));
      
      if (!isTransientError || attempt >= maxRetries) {
        console.error(`Failed to save questionnaire on attempt ${attempt} with error:`, error);
        break;
      }
      
      // Exponential backoff delay
      const delay = Math.pow(2, attempt - 1) * 500;
      console.log(`Retrying save after ${delay}ms (attempt ${attempt} of ${maxRetries})`);
      await new Promise(resolve => setTimeout(resolve, delay));
      
      attempt++;
    }
  }
  
  return { success: false, error: lastError };
};

exports.handler = async function(event, context) {
  // Log request details for debugging
  console.log('Questionnaire function - Request details:', {
    method: event.httpMethod,
    path: event.path,
    origin: event.headers.origin || 'No origin header',
    host: event.headers.host
  });
  
  // For faster cold starts
  context.callbackWaitsForEmptyEventLoop = false;
  
  try {
    // Connect to the database
    await connectToDatabase();
    
    // Verify token for all requests
    const auth = verifyToken(event);
    if (!auth.isValid) {
      return {
        statusCode: 401,
        body: JSON.stringify({ message: auth.error })
      };
    }
    
    // Extract company ID from path
    const path = event.path.split('/');
    const companyId = path[path.length - 1];
    
    console.log('Processing questionnaire request for company ID:', companyId);
    
    // User info already extracted from auth above
    const { username, role } = auth.user;
    
    // Find the company
    const company = await Company.findById(companyId);
    if (!company) {
      return {
        statusCode: 404,
        body: JSON.stringify({ message: 'Company not found' })
      };
    }
    
    // DEV DEBUG: Print decoded JWT, username, company.createdBy
    console.log('[DEV DEBUG] Decoded JWT:', auth.user);
    console.log('[DEV DEBUG] Username:', username, '| Company createdBy:', company.createdBy);
    
    // Proper access control
    if (role !== 'admin' && company.createdBy !== username) {
      console.log(`[DEV DEBUG] Access denied: User ${username} attempted to access company ${companyId} created by ${company.createdBy}`);
      return {
        statusCode: 403,
        body: JSON.stringify({ 
          message: 'Access denied', 
          details: 'You can only access companies that you have created' 
        })
      };
    }
    
    console.log(`[DEV DEBUG] Access granted: User ${username} accessing company ${companyId}`);

    // GET request - Fetch questionnaire answers
    if (event.httpMethod === 'GET') {
      return {
        statusCode: 200,
        body: JSON.stringify({ 
          answers: company.questionnaire?.answers || {} 
        })
      };
    }
    
    // POST request - Save questionnaire answers
    else if (event.httpMethod === 'POST') {
      const { answers } = JSON.parse(event.body);
      
      // Use a retry mechanism for saving questionnaire answers
      const saveResult = await saveQuestionnaireWithRetry(company, answers, 3);
      
      if (saveResult.success) {
        return {
          statusCode: 200,
          body: JSON.stringify({ 
            message: 'Questionnaire answers saved successfully' 
          })
        };
      } else {
        console.error('Failed to save questionnaire after retries:', saveResult.error);
        return {
          statusCode: 500,
          body: JSON.stringify({ 
            message: 'Failed to save questionnaire after multiple attempts', 
            error: saveResult.error.message 
          })
        };
      }
    }
    
    // Unsupported method
    else {
      return {
        statusCode: 405,
        body: JSON.stringify({ message: 'Method not allowed' })
      };
    }
  } catch (error) {
    console.error('Error in questionnaire function:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ 
        message: 'Internal server error', 
        error: error.message 
      })
    };
  }
};
