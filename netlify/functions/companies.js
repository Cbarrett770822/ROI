const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");

// Inline CORS utility functions to avoid import issues

/**
 * Generate CORS headers based on the request event
 * @param {Object} event - The Netlify Functions event object
 * @returns {Object} - CORS headers object
 */
const getCorsHeaders = (event) => {
  // Get origin from request headers or default to localhost:8888
  const origin = event && event.headers && event.headers.origin;
  
  // Allow both development ports and production URLs
  const allowedOrigins = ['http://localhost:8888', 'http://localhost:8889', 'http://localhost:9999'];
  
  // Use the requesting origin if it's allowed, otherwise default to localhost:8888
  const allowedOrigin = origin && allowedOrigins.includes(origin)
    ? origin
    : 'http://localhost:8888';
    
  return {
    'Access-Control-Allow-Origin': allowedOrigin,
    'Access-Control-Allow-Headers': 'Content-Type, Authorization, Accept, Cache-Control, Pragma',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Credentials': 'true',
    'Access-Control-Max-Age': '86400',
    'Content-Type': 'application/json'
  };
};

/**
 * Handle CORS preflight requests
 * @param {Object} event - The Netlify Functions event object
 * @returns {Object|null} - Response object for OPTIONS requests or null
 */
const handleCors = (event) => {
  // Handle CORS preflight requests
  if (event.httpMethod === 'OPTIONS') {
    console.log('[CORS] Handling preflight request from origin:', event.headers.origin);
    return {
      statusCode: 204,
      headers: getCorsHeaders(event),
      body: ''
    };
  }
  return null;
};

/**
 * Add CORS headers to any response object
 * @param {Object} response - The response object
 * @param {Object} event - The Netlify Functions event object
 * @returns {Object} - Response with CORS headers added
 */
const addCorsHeaders = (response, event) => {
  if (!event) {
    console.warn('[CORS] Warning: No event object provided to addCorsHeaders');
  }
  
  return {
    ...response,
    headers: {
      ...response.headers,
      ...getCorsHeaders(event)
    }
  };
};

// MongoDB Schema for Company
const companySchema = new mongoose.Schema({
  name: { type: String, required: true },
  data: { type: mongoose.Schema.Types.Mixed, default: {} },
  createdBy: { type: String, required: true }, // Store the username of the creator
  createdAt: { type: Date, default: Date.now }
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
    const token = event.headers.authorization?.split(' ')[1];
    if (!token) {
      return { isValid: false, error: 'No token provided' };
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    return { isValid: true, user: decoded };
  } catch (error) {
    return { isValid: false, error: 'Invalid token' };
  }
};

// Connect to MongoDB
const connectToDatabase = async () => {
  if (mongoose.connection.readyState !== 1) {
    try {
      await mongoose.connect('mongodb+srv://admin:wmsadmin@cluster0.mongodb.net/roi-warehouse?retryWrites=true&w=majority', {
        useNewUrlParser: true,
        useUnifiedTopology: true,
      });
      console.log('Connected to MongoDB');
    } catch (error) {
      console.error('MongoDB connection error:', error);
      throw error;
    }
  }
};

exports.handler = async function(event, context) {
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

    // Handle different HTTP methods
    const path = event.path.split('/');
    const companyId = path[path.length - 1] !== 'companies' ? path[path.length - 1] : null;
    const isDataEndpoint = path.includes('data');

    // GET /companies - List companies based on user role
    if (event.httpMethod === 'GET' && !companyId) {
      try {
        console.log('GET /companies - Auth user:', auth.user);
        const { username, role } = auth.user;
        console.log('Username:', username, 'Role:', role);
        
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
        
        return addCorsHeaders({
          statusCode: 200,
          body: JSON.stringify(formattedCompanies)
        }, event);
      } catch (error) {
        console.error('Error fetching companies:', error);
        return addCorsHeaders({
          statusCode: 500,
          body: JSON.stringify({ 
            message: 'Error fetching companies', 
            error: error.message 
          })
        }, event);
      }
    }
    
    // GET /companies/:id - Get a specific company
    else if (event.httpMethod === 'GET' && companyId && !isDataEndpoint) {
      try {
        console.log('GET /companies/:id - Company ID:', companyId);
        const { username, role } = auth.user;
        console.log('Username:', username, 'Role:', role);
        
        const company = await Company.findById(companyId).lean();
        if (!company) {
          console.log('Company not found with ID:', companyId);
          return addCorsHeaders({
            statusCode: 404,
            body: JSON.stringify({ message: 'Company not found' })
          }, event);
        }
        
        console.log('Found company:', company);
        
        // Check if user has permission to view this company
        if (role !== 'admin' && company.createdBy !== username) {
          console.log('Access denied: User', username, 'attempted to access company created by', company.createdBy);
          return addCorsHeaders({
            statusCode: 403,
            body: JSON.stringify({ message: 'Access denied' })
          }, event);
        }
        
        // Format the response to match what the frontend expects
        const formattedCompany = {
          id: company._id.toString(),
          name: company.name,
          createdBy: company.createdBy,
          createdAt: company.createdAt
        };
        
        console.log('Formatted company:', formattedCompany);
        
        return addCorsHeaders({
          statusCode: 200,
          body: JSON.stringify(formattedCompany)
        }, event);
      } catch (error) {
        console.error('Error fetching company:', error);
        return addCorsHeaders({
          statusCode: 500,
          body: JSON.stringify({ 
            message: 'Error fetching company', 
            error: error.message 
          })
        }, event);
      }
    }
    
    // GET /companies/:id/data - Get company data
    else if (event.httpMethod === 'GET' && companyId && isDataEndpoint) {
      const { username, role } = auth.user;
      
      const company = await Company.findById(companyId);
      if (!company) {
        return addCorsHeaders({
          statusCode: 404,
          body: JSON.stringify({ message: 'Company not found' })
        });
      }
      
      // Check if user has permission to view this company's data
      if (role !== 'admin' && company.createdBy !== username) {
        return addCorsHeaders({
          statusCode: 403,
          body: JSON.stringify({ message: 'Access denied' })
        });
      }
      
      return addCorsHeaders({
        statusCode: 200,
        body: JSON.stringify(company.data || {})
      });
    }
    
    // POST /companies - Create a new company
    else if (event.httpMethod === 'POST' && !companyId) {
      try {
        console.log('POST /companies - Request body:', event.body);
        
        if (!event.body) {
          console.error('Missing request body');
          return addCorsHeaders({
            statusCode: 400,
            body: JSON.stringify({ message: 'Missing request body' })
          });
        }
        
        let parsedBody;
        try {
          parsedBody = JSON.parse(event.body);
          console.log('Parsed body:', parsedBody);
        } catch (parseError) {
          console.error('Error parsing JSON body:', parseError);
          return addCorsHeaders({
            statusCode: 400,
            body: JSON.stringify({ message: 'Invalid JSON in request body' })
          });
        }
        
        const { name } = parsedBody;
        
        if (!name || typeof name !== 'string' || !name.trim()) {
          console.error('Missing or invalid company name:', name);
          return addCorsHeaders({
            statusCode: 400,
            body: JSON.stringify({ message: 'Company name is required' })
          });
        }
        
        const { username } = auth.user;
        console.log('Creating company with name:', name, 'and username:', username);
        
        // Create company with the creator's username
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
        
        return addCorsHeaders({
          statusCode: 201,
          body: JSON.stringify(response)
        }, event);
      } catch (error) {
        console.error('Error creating company:', error);
        return addCorsHeaders({
          statusCode: 500,
          body: JSON.stringify({ 
            message: 'Error creating company', 
            error: error.message,
            stack: error.stack
          })
        });
      }
    }
    
    // POST /companies/:id/data - Save company data
    else if (event.httpMethod === 'POST' && companyId && isDataEndpoint) {
      const { username, role } = auth.user;
      
      const data = JSON.parse(event.body);
      const company = await Company.findById(companyId);
      if (!company) {
        return addCorsHeaders({
          statusCode: 404,
          body: JSON.stringify({ message: 'Company not found' })
        });
      }
      
      // Check if user has permission to modify this company's data
      if (role !== 'admin' && company.createdBy !== username) {
        return addCorsHeaders({
          statusCode: 403,
          body: JSON.stringify({ message: 'Access denied' })
        });
      }
      
      company.data = data;
      await company.save();
      return addCorsHeaders({
        statusCode: 200,
        body: JSON.stringify({ message: 'Data saved successfully' })
      });
    }
    
    // PUT /companies/:id - Update a company
    else if (event.httpMethod === 'PUT' && companyId) {
      const { username, role } = auth.user;
      
      // First check if the user has permission to update this company
      const existingCompany = await Company.findById(companyId);
      if (!existingCompany) {
        return addCorsHeaders({
          statusCode: 404,
          body: JSON.stringify({ message: 'Company not found' })
        });
      }
      
      // Check if user has permission to modify this company
      if (role !== 'admin' && existingCompany.createdBy !== username) {
        return addCorsHeaders({
          statusCode: 403,
          body: JSON.stringify({ message: 'Access denied' })
        });
      }
      
      const { name } = JSON.parse(event.body);
      const company = await Company.findByIdAndUpdate(
        companyId, 
        { name }, 
        { new: true }
      );
      
      return addCorsHeaders({
        statusCode: 200,
        body: JSON.stringify(company)
      }, event);
    }
    
    // DELETE /companies/:id - Delete a company
    else if (event.httpMethod === 'DELETE' && companyId) {
      const { username, role } = auth.user;
      
      // First check if the company exists
      const company = await Company.findById(companyId);
      if (!company) {
        return addCorsHeaders({
          statusCode: 404,
          body: JSON.stringify({ message: 'Company not found' })
        });
      }
      
      // Check if user has permission to delete this company
      if (role !== 'admin' && company.createdBy !== username) {
        return addCorsHeaders({
          statusCode: 403,
          body: JSON.stringify({ message: 'Access denied' })
        });
      }
      
      await Company.findByIdAndDelete(companyId);
      
      return addCorsHeaders({
        statusCode: 200,
        body: JSON.stringify({ message: 'Company deleted successfully', companyId })
      });
    }
    
    // Unsupported route
    else {
      return addCorsHeaders({
        statusCode: 404,
        body: JSON.stringify({ message: 'Not found' })
      });
    }
  } catch (error) {
    console.error('Error in companies function:', error);
    return addCorsHeaders({
      statusCode: 500,
      body: JSON.stringify({ 
        message: 'Internal server error', 
        error: error.message 
      })
    });
  }
};

