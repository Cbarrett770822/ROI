import axios from 'axios';

// Set up axios defaults
// Using relative path for unified deployment
axios.defaults.baseURL = '/.netlify/functions';
axios.defaults.headers.common['Content-Type'] = 'application/json';

// Add authorization header if token exists
const token = localStorage.getItem('token');
if (token) {
  axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
}

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
