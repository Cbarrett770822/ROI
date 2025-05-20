import axios from 'axios';

// Set up axios defaults
axios.defaults.baseURL = 'http://localhost:3001';
axios.defaults.headers.common['Content-Type'] = 'application/json';

// Add response interceptor for error handling
axios.interceptors.response.use(
  response => response,
  error => {
    // Handle API errors gracefully
    console.error('API Error:', error.response?.data || error.message);
    return Promise.reject(error);
  }
);

export default axios;
