import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

// ProtectedRoute component that wraps routes requiring authentication
// This component checks if user is logged in before rendering protected content
export const ProtectedRoute = ({ children, requireAdmin = false }) => {
  // Get current user from authentication context
  const { user } = useAuth();
  
  // Get current location for redirect purposes
  const location = useLocation();

  // Check if user is not authenticated (no user data)
  if (!user) {
    // Redirect to login page and save current location for post-login redirect
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Check if route requires admin access and user is not admin
  if (requireAdmin && user.role !== 'admin') {
    // Redirect to home page if user doesn't have admin privileges
    return <Navigate to="/" replace />;
  }

  // If user is authenticated (and admin if required), render the protected content
  return children;
}; 