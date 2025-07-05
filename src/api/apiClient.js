import axios from 'axios';
import { store } from '../redux/store';
import { setLoading } from '../redux/slices/uiSlice';

// Create a base API client with default configuration
const apiClient = axios.create({
  baseURL: '',  // Empty baseURL for Netlify deployment
  timeout: 30000, // 30 seconds
  headers: {
    'Content-Type': 'application/json',
  }
});

// Request interceptor to add auth token and handle loading state
apiClient.interceptors.request.use(
  (config) => {
    // Get token from localStorage
    const token = localStorage.getItem('token');
    
    // If token exists, add it to the headers
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    // Ensure all Netlify Functions endpoints use the correct path format
    if (!config.url.startsWith('/.netlify/functions/') && !config.url.startsWith('http')) {
      // Add the Netlify Functions prefix to the URL
      config.url = `/.netlify/functions/${config.url.replace(/^\//, '')}`;
      console.log(`Normalized API URL to: ${config.url}`);
    }
    
    // Log the full URL for debugging
    const fullUrl = config.baseURL ? `${config.baseURL}${config.url}` : config.url;
    console.log(`Making API request to: ${fullUrl}`);
    
    // In development, if we're using relative URLs without a baseURL, prepend the Netlify dev server URL
    if (!config.baseURL && import.meta.env.MODE === 'development') {
      config.baseURL = 'http://localhost:8888';
    }
    
    // Set loading state to true when request starts
    if (config.showLoading !== false) {
      store.dispatch(setLoading(true));
    }
    
    return config;
  },
  (error) => {
    // Set loading state to false on request error
    store.dispatch(setLoading(false));
    return Promise.reject(error);
  }
);

// Response interceptor to handle common errors and loading state
apiClient.interceptors.response.use(
  (response) => {
    // Set loading state to false when response is received
    store.dispatch(setLoading(false));
    return response;
  },
  (error) => {
    // Set loading state to false on response error
    store.dispatch(setLoading(false));
    
    // Handle specific error cases
    if (error.response) {
      // Server responded with an error status code
      switch (error.response.status) {
        case 401:
          // Unauthorized - token expired or invalid
          console.error('Authentication error:', error.response.data);
          // If not on login page, redirect to login
          if (window.location.pathname !== '/login') {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            window.location.href = '/login';
          }
          break;
        case 403:
          // Forbidden - user doesn't have permission
          console.error('Authorization error:', error.response.data);
          break;
        case 404:
          // Not found
          console.error('Resource not found:', error.response.data);
          break;
        case 500:
          // Server error
          console.error('Server error:', error.response.data);
          break;
        default:
          console.error(`Error ${error.response.status}:`, error.response.data);
      }
    } else if (error.request) {
      // Request was made but no response received
      console.error('Network error - no response received:', error.request);
    } else {
      // Error in setting up the request
      console.error('Request configuration error:', error.message);
    }
    
    return Promise.reject(error);
  }
);

// Helper methods for common API operations
export const api = {
  // GET request
  get: (url, config = {}) => apiClient.get(url, config),
  
  // POST request
  post: (url, data = {}, config = {}) => apiClient.post(url, data, config),
  
  // PUT request
  put: (url, data = {}, config = {}) => apiClient.put(url, data, config),
  
  // DELETE request
  delete: (url, config = {}) => apiClient.delete(url, config),
  
  // Special method for requests that shouldn't show loading indicator
  silent: {
    get: (url, config = {}) => apiClient.get(url, { ...config, showLoading: false }),
    post: (url, data = {}, config = {}) => apiClient.post(url, data, { ...config, showLoading: false }),
    put: (url, data = {}, config = {}) => apiClient.put(url, data, { ...config, showLoading: false }),
    delete: (url, config = {}) => apiClient.delete(url, { ...config, showLoading: false }),
  }
};

export default apiClient;
