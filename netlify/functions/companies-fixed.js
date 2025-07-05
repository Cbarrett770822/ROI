const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");

// Use the same JWT secret as auth-login.js
const JWT_SECRET = process.env.JWT_SECRET || 'changeme-secret';

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

    const decoded = jwt.verify(token, JWT_SECRET);
    return { isValid: true, user: decoded };
  } catch (error) {
    console.error('Token verification error:', error.message);
    return { isValid: false, error: 'Invalid token' };
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

// Helper function to add CORS headers to any response
const addCorsHeaders = (response) => {
  // Always use the specific frontend domain
  const corsHeaders = {
    'Access-Control-Allow-Origin': 'https://wms-roi.netlify.app',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization, Accept, Cache-Control, Pragma',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Credentials': 'true',
    'Access-Control-Max-Age': '86400',
    'Content-Type': 'application/json'
  };
  
  return {
    ...response,
    headers: {
      ...response.headers,
      ...corsHeaders
    }
  };
};

exports.handler = async function(event, context) {
  // Log all request details for debugging
  console.log('Companies function - Request details:', {
    method: event.httpMethod,
    path: event.path,
    origin: event.headers.origin || 'No origin header',
    host: event.headers.host,
    referer: event.headers.referer || 'No referer',
    headers: JSON.stringify(event.headers)
  });
  
  // Handle CORS preflight requests directly
  if (event.httpMethod === 'OPTIONS') {
    console.log('Handling OPTIONS preflight request directly');
    return {
      statusCode: 204, // No content
      headers: {
        'Access-Control-Allow-Origin': 'https://wms-roi.netlify.app',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization, Accept, Cache-Control, Pragma',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Credentials': 'true',
        'Access-Control-Max-Age': '86400'
      },
      body: ''
    };
  }
  
  // For faster cold starts
  context.callbackWaitsForEmptyEventLoop = false;
  
  try {
    // Connect to the database
    await connectToDatabase();
    
    // Verify token for all requests except OPTIONS
    const auth = verifyToken(event);
    if (!auth.isValid) {
      return addCorsHeaders({
        statusCode: 401,
        body: JSON.stringify({ message: auth.error })
      });
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
        
        console.log('Sending formatted response:', formattedCompanies);
        
        return addCorsHeaders({
          statusCode: 200,
          body: JSON.stringify(formattedCompanies)
        });
      } catch (error) {
        console.error('Error fetching companies:', error);
        return addCorsHeaders({
          statusCode: 500,
          body: JSON.stringify({ 
            message: 'Error fetching companies', 
            error: error.message 
          })
        });
      }
    }
    
    // GET /companies/:id - Get a specific company
    else if (event.httpMethod === 'GET' && companyId && !isDataEndpoint) {
      try {
        const company = await Company.findById(companyId).lean();
        if (!company) {
          return addCorsHeaders({
            statusCode: 404,
            body: JSON.stringify({ message: 'Company not found' })
          });
        }
        
        // Check if user has permission to view this company
        const { username, role } = auth.user;
        if (role !== 'admin' && company.createdBy !== username) {
          return addCorsHeaders({
            statusCode: 403,
            body: JSON.stringify({ message: 'Access denied' })
          });
        }
        
        // Format the response
        const formattedCompany = {
          id: company._id.toString(),
          name: company.name,
          data: company.data || {},
          createdBy: company.createdBy,
          createdAt: company.createdAt
        };
        
        return addCorsHeaders({
          statusCode: 200,
          body: JSON.stringify(formattedCompany)
        });
      } catch (error) {
        console.error('Error fetching company:', error);
        return addCorsHeaders({
          statusCode: 500,
          body: JSON.stringify({ 
            message: 'Error fetching company', 
            error: error.message 
          })
        });
      }
    }
    
    // GET /companies/:id/data - Get company data
    else if (event.httpMethod === 'GET' && companyId && isDataEndpoint) {
      try {
        const company = await Company.findById(companyId).lean();
        if (!company) {
          return addCorsHeaders({
            statusCode: 404,
            body: JSON.stringify({ message: 'Company not found' })
          });
        }
        
        // Check if user has permission to view this company's data
        const { username, role } = auth.user;
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
      } catch (error) {
        console.error('Error fetching company data:', error);
        return addCorsHeaders({
          statusCode: 500,
          body: JSON.stringify({ 
            message: 'Error fetching company data', 
            error: error.message 
          })
        });
      }
    }
    
    // POST /companies - Create a new company
    else if (event.httpMethod === 'POST' && !companyId) {
      try {
        const { name } = JSON.parse(event.body);
        
        if (!name || typeof name !== 'string' || name.trim() === '') {
          return addCorsHeaders({
            statusCode: 400,
            body: JSON.stringify({ message: 'Company name is required' })
          });
        }
        
        // Get user info from token
        const { username } = auth.user;
        
        // Create new company
        const company = new Company({
          name: name.trim(),
          createdBy: username,
          data: {}
        });
        
        const savedCompany = await company.save();
        console.log('Created company:', savedCompany);
        
        // Format the response
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
        });
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
      });
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
