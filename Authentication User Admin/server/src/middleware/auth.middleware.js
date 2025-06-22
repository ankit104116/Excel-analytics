// Import required dependencies for authentication middleware
const jwt = require('jsonwebtoken');       // JSON Web Token library for token verification
const User = require('../models/user.model'); // User model for database queries

// Middleware to protect routes - verifies JWT token and authenticates user
exports.protect = async (req, res, next) => {
  try {
    // Step 1: Extract JWT token from Authorization header
    let token;
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      // Extract token from "Bearer <token>" format
      token = req.headers.authorization.split(' ')[1];
    }

    // Check if token exists - if not, user is not authenticated
    if (!token) {
      return res.status(401).json({ message: 'Please log in to access this resource' });
    }

    // Step 2: Verify the JWT token using the secret key
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Step 3: Check if user still exists in database (in case user was deleted after token was issued)
    const user = await User.findById(decoded.id);
    if (!user) {
      return res.status(401).json({ message: 'User no longer exists' });
    }

    // Step 4: Grant access to protected route by attaching user to request object
    req.user = user;
    next(); // Continue to the next middleware or route handler
  } catch (error) {
    // Handle any errors during token verification or user lookup
    res.status(401).json({ message: 'Not authorized to access this route' });
  }
};

// Middleware factory function for role-based access control
exports.restrictTo = (...roles) => {
  // Return a middleware function that checks user roles
  return (req, res, next) => {
    // Check if user's role is included in the allowed roles array
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ 
        message: 'You do not have permission to perform this action' 
      });
    }
    next(); // Continue if user has required role
  };
}; 