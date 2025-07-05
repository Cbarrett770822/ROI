// API Service for making HTTP requests
import config from '../config';
import { getAuthToken } from './authService';

/**
 * Makes an authenticated API request with the JWT token
 * @param {string} endpoint - API endpoint to call
 * @param {Object} options - Fetch options
 * @returns {Promise<Object>} - Response data
 */
export const makeAuthenticatedRequest = async (endpoint, options = {}) => {
  try {
    const token = getAuthToken();
    console.log('Auth token retrieved for API call:', token ? 'Token found' : 'No token');
    
    // Normalize the API URL
    let url = endpoint;
    if (!endpoint.startsWith('http')) {
      // If it's a relative URL, ensure it uses the /.netlify/functions/ prefix
      if (!endpoint.startsWith('/.netlify/functions/')) {
        url = `${config.apiUrl}/.netlify/functions/${endpoint.replace(/^\/|^\/api\//, '')}`;
      } else {
        url = `${config.apiUrl}${endpoint}`;
      }
      console.log('Normalized API URL to:', url);
    }
    
    console.log('Making authenticated request to', url);
    
    // Set up headers with authentication token
    const headers = {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
      ...(options.headers || {})
    };
    
    console.log('Request headers:', headers);
    
    // Make the API request
    const response = await fetch(url, {
      ...options,
      headers
    });
    
    // Handle non-200 responses
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('API Error:', response.status, errorData);
      throw new Error(errorData.message || `API Error: ${response.status}`);
    }
    
    // Parse and return the response data
    return await response.json();
  } catch (error) {
    console.error('API Error:', error);
    throw error;
  }
};

/**
 * Makes a regular API request without authentication
 * @param {string} endpoint - API endpoint to call
 * @param {Object} options - Fetch options
 * @returns {Promise<Object>} - Response data
 */
export const makeRequest = async (endpoint, options = {}) => {
  try {
    // Normalize the API URL
    let url = endpoint;
    if (!endpoint.startsWith('http')) {
      // If it's a relative URL, ensure it uses the /.netlify/functions/ prefix
      if (!endpoint.startsWith('/.netlify/functions/')) {
        url = `${config.apiUrl}/.netlify/functions/${endpoint.replace(/^\/|^\/api\//, '')}`;
      } else {
        url = `${config.apiUrl}${endpoint}`;
      }
      console.log('Making API request to:', url);
    }
    
    // Make the API request
    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...(options.headers || {})
      }
    });
    
    // Handle non-200 responses
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('API Error:', response.status, errorData);
      throw new Error(errorData.message || `API Error: ${response.status}`);
    }
    
    // Parse and return the response data
    return await response.json();
  } catch (error) {
    console.error('Fetch error:', error);
    throw error;
  }
};
