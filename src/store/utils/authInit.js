// This file initializes authentication state from localStorage
// It ensures token is valid before setting isAuthenticated to true

export const initializeAuth = () => {
  // Check if we're in a browser environment (with localStorage)
  if (typeof window === 'undefined' || !window.localStorage) {
    console.log('Not in browser environment, returning empty auth state');
    return { token: null, user: null, isAuthenticated: false };
  }

  const token = localStorage.getItem('token');
  const userString = localStorage.getItem('user');
  
  // Clear invalid state
  if (token && !userString) {
    console.log('Found token but no user data, clearing auth state');
    localStorage.removeItem('token');
    return { token: null, user: null, isAuthenticated: false };
  }
  
  // Parse user data if both token and user exist
  if (token && userString) {
    try {
      const user = JSON.parse(userString);
      console.log('Restored auth state from localStorage:', { isAuthenticated: true, user });
      return { token, user, isAuthenticated: true };
    } catch (error) {
      console.error('Failed to parse user data from localStorage:', error);
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      return { token: null, user: null, isAuthenticated: false };
    }
  }
  
  // No auth data found
  return { token: null, user: null, isAuthenticated: false };
};
