// Authenticated fetch utility for API requests
export default async function authFetch(url, options = {}) {
  // Get token directly from localStorage - it's stored as a string in authSlice.js
  const token = localStorage.getItem('token');
  
  console.log('Auth token retrieved for API call:', token ? 'Token found' : 'No token');
  
  if (!token) {
    console.error('No authentication token found. User may need to log in again.');
  }
  
  const headers = {
    ...(options.headers || {}),
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    'Content-Type': 'application/json',
  };
  
  console.log(`Making authenticated request to ${url}`);
  console.log('Request headers:', headers);
  
  try {
    const response = await fetch(url, { ...options, headers });
    
    if (!response.ok) {
      // If the response is not OK, log detailed information
      const errorText = await response.text();
      console.error(`API request failed with status ${response.status}:`, errorText);
      throw new Error(`API request failed: ${response.status} ${response.statusText}`);
    }
    
    // Parse response before returning
    try {
      const contentType = response.headers.get('content-type');
      
      // Check if response is JSON
      if (contentType && contentType.includes('application/json')) {
        const jsonData = await response.json();
        console.log('API response data:', jsonData);
        return jsonData;
      } 
      // Handle HTML responses - likely CORS or routing issues
      else if (contentType && contentType.includes('text/html')) {
        console.warn(`Received HTML response instead of JSON. This may indicate a CORS or routing issue.`);
        console.warn(`URL: ${url}, Status: ${response.status}`);
        const htmlText = await response.text();
        console.warn(`HTML content (first 100 chars): ${htmlText.substring(0, 100)}...`);
        
        // Return a structured error object
        return {
          error: 'Received HTML instead of JSON. Check server configuration.',
          status: response.status,
          url: url
        };
      } 
      // Handle other content types
      else {
        console.warn(`Response is not JSON (${contentType}). Attempting to parse as text.`);
        const text = await response.text();
        try {
          // Try to parse as JSON anyway in case content-type is wrong
          return JSON.parse(text);
        } catch (e) {
          console.warn('Could not parse as JSON, returning text content');
          return { 
            content: text,
            error: `Unexpected content type: ${contentType}`,
            status: response.status
          };
        }
      }
    } catch (parseError) {
      console.error('Error parsing response:', parseError);
      throw new Error(`Failed to parse API response: ${parseError.message}`);
    }
  } catch (error) {
    console.error('Fetch error:', error);
    throw error;
  }
}
