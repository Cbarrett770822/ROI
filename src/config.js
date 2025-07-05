// Configuration settings for the application
const config = {
  // API URL - automatically use the Netlify URL in production or local development URL
  apiUrl: process.env.NODE_ENV === 'production' 
    ? '' // Empty string for production (relative URLs will work with Netlify since frontend and backend are on same domain)
    : 'http://localhost:8888', // Use localhost for development
    
  // JWT token settings
  tokenKey: 'token',
  userKey: 'user',
  
  // Default settings
  defaultTimeout: 30000, // 30 seconds
};

export default config;
