import React, { createContext, useState, useContext, useEffect } from 'react';

const API_URL = 'http://localhost:5001/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);        // Current user data
  const [loading, setLoading] = useState(true);  // Loading state for initial auth check
  const [error, setError] = useState(null);      // Error state for auth operations

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      fetchUser(token);
    } else {
      setLoading(false);
    }
  }, []);

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
        setUser(data.user);
      } else {
        console.error('Failed to fetch user:', data.message);
        localStorage.removeItem('token');
      }
    } catch (err) {
      console.error('Error fetching user:', err);
    } finally {
      setLoading(false);
    }
  };

  // Function to handle user login
  const login = async (email, password) => {
    try {
      setError(null);
      console.log('Attempting login...');
      
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
        throw new Error(data.message || 'Login failed');
      }

      localStorage.setItem('token', data.token);
      setUser(data.user);
      return data;
    } catch (err) {
      console.error('Login error:', err);
      setError(err.message);
      throw err;
    }
  };

  const signup = async (name, email, password) => {
    try {
      setError(null);
      console.log('Attempting signup...');
      
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
        throw new Error(data.message || 'Signup failed');
      }

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

  const logout = () => {
    localStorage.removeItem('token');
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

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}; 