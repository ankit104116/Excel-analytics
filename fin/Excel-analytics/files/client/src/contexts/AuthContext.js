import React, { createContext, useState, useContext, useEffect } from 'react';

// API base URL for backend communication
const API_URL = 'http://localhost:5001/api';

// Create React context for authentication state
const AuthContext = createContext(null);

// AuthProvider component that wraps the app and provides authentication state
export const AuthProvider = ({ children }) => {
  // State variables for authentication
  const [user, setUser] = useState(null);        // Current user data
  const [loading, setLoading] = useState(true);  // Loading state for initial auth check
  const [error, setError] = useState(null);      // Error state for auth operations

  // Effect hook to check authentication status on component mount
  useEffect(() => {
    // Check if user is logged in on mount by looking for token in localStorage
    const token = localStorage.getItem('token');
    if (token) {
      // If token exists, fetch user data from server
      fetchUser(token);
    } else {
      // If no token, set loading to false immediately
      setLoading(false);
    }
  }, []); // Empty dependency array means this runs only once on mount

  // Function to fetch user data from server using JWT token
  const fetchUser = async (token) => {
    try {
      console.log('Fetching user data...');
      
      // Make API request to get current user data
      const response = await fetch(`${API_URL}/auth/me`, {
        headers: {
          'Authorization': `Bearer ${token}` // Include JWT token in Authorization header
        }
      });
      
      const data = await response.json();
      console.log('User data response:', data);
      
      if (response.ok) {
        // If request successful, update user state
        setUser(data.user);
      } else {
        // If request failed, remove invalid token and log error
        console.error('Failed to fetch user:', data.message);
        localStorage.removeItem('token');
      }
    } catch (err) {
      // Handle network or other errors
      console.error('Error fetching user:', err);
    } finally {
      // Always set loading to false when done
      setLoading(false);
    }
  };

  // Function to handle user login
  const login = async (email, password) => {
    try {
      // Clear any previous errors
      setError(null);
      console.log('Attempting login...');
      
      // Make API request to login endpoint
      const response = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }), // Send login credentials
      });
      
      const data = await response.json();
      console.log('Login response:', data);
      
      if (!response.ok) {
        // If login failed, throw error with server message
        throw new Error(data.message || 'Login failed');
      }

      // If login successful, store token and update user state
      localStorage.setItem('token', data.token);
      setUser(data.user);
      return data;
    } catch (err) {
      // Handle login errors
      console.error('Login error:', err);
      setError(err.message);
      throw err;
    }
  };

  // Function to handle user registration
  const signup = async (name, email, password) => {
    try {
      // Clear any previous errors
      setError(null);
      console.log('Attempting signup...');
      
      // Make API request to signup endpoint
      const response = await fetch(`${API_URL}/auth/signup`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name, email, password }), // Send registration data
      });
      
      const data = await response.json();
      console.log('Signup response:', data);
      
      if (!response.ok) {
        // If signup failed, throw error with server message
        throw new Error(data.message || 'Signup failed');
      }

      // If signup successful, store token and update user state
      localStorage.setItem('token', data.token);
      setUser(data.user);
      return data;
    } catch (err) {
      // Handle signup errors
      console.error('Signup error:', err);
      setError(err.message);
      throw err;
    }
  };

  // Function to handle user logout
  const logout = () => {
    // Remove token from localStorage
    localStorage.removeItem('token');
    // Clear user state
    setUser(null);
  };

  // Create context value object with all auth functions and state
  const value = {
    user,        // Current user data
    loading,     // Loading state
    error,       // Error state
    login,       // Login function
    signup,      // Signup function
    logout,      // Logout function
  };

  // Return context provider with auth value
  // Only render children when not loading to prevent flashing
  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

// Custom hook to use authentication context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    // Throw error if hook is used outside of AuthProvider
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}; 