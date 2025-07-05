const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");

// Import the shared CORS utility functions
const { getCorsHeaders, handleCors, addCorsHeaders } = require('./utils/corsHeaders');


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
    
    // Verify token for all requests except OPTIONS
    const auth = verifyToken(event);
    if (!auth.isValid) {
      return addCorsHeaders({
        statusCode: 401,
        body: JSON.stringify({ message: auth.error }, event)
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
          }, event)
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
            body: JSON.stringify({ message: 'Company not found' }, event)
          }, event);
        }
        
        console.log('Found company:', company);
        
        // Check if user has permission to view this company
        if (role !== 'admin' && company.createdBy !== username) {
          console.log('Access denied: User', username, 'attempted to access company created by', company.createdBy);
          return addCorsHeaders({
            statusCode: 403,
            body: JSON.stringify({ message: 'Access denied' }, event)
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
          }, event)
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
          body: JSON.stringify({ message: 'Company not found' }, event)
        });
      }
      
      // Check if user has permission to view this company's data
      if (role !== 'admin' && company.createdBy !== username) {
        return addCorsHeaders({
          statusCode: 403,
          body: JSON.stringify({ message: 'Access denied' }, event)
        });
      }
      
      return addCorsHeaders({
        statusCode: 200,
        body: JSON.stringify(company.data || {}, event)
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
            body: JSON.stringify({ message: 'Missing request body' }, event)
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
            body: JSON.stringify({ message: 'Invalid JSON in request body' }, event)
          });
        }
        
        const { name } = parsedBody;
        
        if (!name || typeof name !== 'string' || !name.trim()) {
          console.error('Missing or invalid company name:', name);
          return addCorsHeaders({
            statusCode: 400,
            body: JSON.stringify({ message: 'Company name is required' }, event)
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
          }, event)
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
          body: JSON.stringify({ message: 'Company not found' }, event)
        });
      }
      
      // Check if user has permission to modify this company's data
      if (role !== 'admin' && company.createdBy !== username) {
        return addCorsHeaders({
          statusCode: 403,
          body: JSON.stringify({ message: 'Access denied' }, event)
        });
      }
      
      company.data = data;
      await company.save();
      return addCorsHeaders({
        statusCode: 200,
        body: JSON.stringify({ message: 'Data saved successfully' }, event)
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
          body: JSON.stringify({ message: 'Company not found' }, event)
        });
      }
      
      // Check if user has permission to modify this company
      if (role !== 'admin' && existingCompany.createdBy !== username) {
        return addCorsHeaders({
          statusCode: 403,
          body: JSON.stringify({ message: 'Access denied' }, event)
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
          body: JSON.stringify({ message: 'Company not found' }, event)
        });
      }
      
      // Check if user has permission to delete this company
      if (role !== 'admin' && company.createdBy !== username) {
        return addCorsHeaders({
          statusCode: 403,
          body: JSON.stringify({ message: 'Access denied' }, event)
        });
      }
      
      await Company.findByIdAndDelete(companyId);
      
      return addCorsHeaders({
        statusCode: 200,
        body: JSON.stringify({ message: 'Company deleted successfully', companyId }, event)
      });
    }
    
    // Unsupported route
    else {
      return addCorsHeaders({
        statusCode: 404,
        body: JSON.stringify({ message: 'Not found' }, event)
      });
    }
  } catch (error) {
    console.error('Error in companies function:', error);
    return addCorsHeaders({
      statusCode: 500,
      body: JSON.stringify({ 
        message: 'Internal server error', 
        error: error.message 
      }, event)
    });
  }
};

