// Import required dependencies for authentication routes
const express = require('express');        // Web framework for creating routes
const router = express.Router();           // Create router instance for auth routes
const jwt = require('jsonwebtoken');       // JSON Web Token library for creating tokens
const User = require('../models/user.model'); // User model for database operations
const { protect, restrictTo } = require('../middleware/auth.middleware'); // Authentication middleware

// User registration route - POST /api/auth/signup
router.post('/signup', async (req, res) => {
  try {
    // Extract user data from request body
    const { name, email, password, role } = req.body;

    // Check if user with this email already exists in database
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Create new user with provided data (password will be hashed by pre-save middleware)
    const user = await User.create({
      name,
      email,
      password,
      role: role || 'user' // Default to 'user' role if not specified
    });

    // Generate JWT token for the newly created user
    const token = jwt.sign(
      { id: user._id },                    // Token payload with user ID
      process.env.JWT_SECRET,              // Secret key for signing token
      { expiresIn: '1d' }                  // Token expires in 1 day
    );

    // Send success response with token and user data (excluding password)
    res.status(201).json({
      message: 'User created successfully',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    // Handle any errors during user creation
    res.status(400).json({ message: error.message });
  }
});

// User login route - POST /api/auth/login
router.post('/login', async (req, res) => {
  try {
    // Extract login credentials from request body
    const { email, password } = req.body;

    // Find user by email and include password field (normally excluded)
    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Verify password using the comparePassword method from user model
    const isPasswordCorrect = await user.comparePassword(password);
    if (!isPasswordCorrect) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Generate JWT token for authenticated user
    const token = jwt.sign(
      { id: user._id },                    // Token payload with user ID
      process.env.JWT_SECRET,              // Secret key for signing token
      { expiresIn: '1d' }                  // Token expires in 1 day
    );

    // Send success response with token and user data
    res.json({
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    // Handle any errors during login process
    res.status(400).json({ message: error.message });
  }
});

// Get current user route - GET /api/auth/me (protected route)
router.get('/me', protect, async (req, res) => {
  // User data is already attached to req.user by the protect middleware
  res.json({
    user: {
      id: req.user._id,
      name: req.user.name,
      email: req.user.email,
      role: req.user.role
    }
  });
});

// Admin-only route example - GET /api/auth/admin-only (protected and role-restricted)
router.get('/admin-only', protect, restrictTo('admin'), (req, res) => {
  // This route is only accessible to users with 'admin' role
  res.json({ message: 'This is an admin only route' });
});

// Export the router for use in main application
module.exports = router; 