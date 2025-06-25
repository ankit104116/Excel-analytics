import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export const ProtectedRoute = ({ children, requireAdmin = false }) => {
  const { user } = useAuth();
  
  const location = useLocation();

  // Check if user is not authenticated (no user data)
  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (requireAdmin && user.role !== 'admin') {
    return <Navigate to="/" replace />;
  }
  return children;
}; 