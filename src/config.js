// Configuration settings for the application
const config = {
  // API URL - automatically use the Netlify URL in production or local development URL
  apiUrl: process.env.NODE_ENV === 'production' 
    ? 'https://roi-wms-app.netlify.app' // Use the explicit backend URL in production
    : 'https://roi-wms-app.netlify.app',
    
  // JWT token settings
  tokenKey: 'token',
  userKey: 'user',
  
  // Default settings
  defaultTimeout: 30000, // 30 seconds
};

export default config;
