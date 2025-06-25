import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { ProtectedRoute } from './components/ProtectedRoute';
import Login from './pages/Login';
import Signup from './pages/Signup';
import AdminLogin from './pages/AdminLogin';
import UserDashboard from './pages/UserDashboard';
import AdminDashboard from './pages/AdminDashboard';
import LandingPage from './pages/LandingPage';

// Custom component for admin route protection
// Checks if user is admin and redirects to admin login if not
const AdminProtectedRoute = ({ children }) => {
  // Check if user is marked as admin in localStorage
  const isAdmin = localStorage.getItem('isAdmin') === 'true';
  
  // If admin, render the protected component, otherwise redirect to admin login
  return isAdmin ? children : <Navigate to="/admin-login" replace />;
};

// Main App component that sets up routing and authentication
function App() {
  return (
    // Router wrapper for client-side routing
    <Router>
      {/* AuthProvider wraps the entire app to provide authentication context */}
      <AuthProvider>
        {/* Routes container for defining application routes */}
        <Routes>
          {/* Public routes - accessible to all users */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/admin-login" element={<AdminLogin />} />
          
          {/* Protected routes - require authentication */}
          <Route
            path="/dashboard"
            element={
              // Wrap UserDashboard with ProtectedRoute to ensure user is logged in
              <ProtectedRoute>
                <UserDashboard />
              </ProtectedRoute>
            }
          />
          
          {/* Admin-only routes - require admin authentication */}
          <Route
            path="/admin-dashboard"
            element={
              // Wrap AdminDashboard with AdminProtectedRoute for admin-only access
              <AdminProtectedRoute>
                <AdminDashboard />
              </AdminProtectedRoute>
            }
          />
          
          {/* Catch-all route - redirects any unknown routes to home page */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </Router>
  );
}

// Export App component as default export
export default App;
