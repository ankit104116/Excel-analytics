// Import required dependencies for the Express server
const express = require('express');        // Web framework for Node.js
const cors = require('cors');              // Cross-Origin Resource Sharing middleware
const helmet = require('helmet');          // Security middleware for HTTP headers
const morgan = require('morgan');          // HTTP request logger middleware
const dotenv = require('dotenv');          // Environment variables loader
const mongoose = require('mongoose');      // MongoDB object modeling tool
const authRoutes = require('./routes/auth.routes'); // Authentication routes

// Load environment variables from .env file into process.env
dotenv.config();

// MongoDB Connection Options - Configure mongoose connection settings
const mongooseOptions = {
  useNewUrlParser: true,      // Use new URL parser for MongoDB connection string
  useUnifiedTopology: true,   // Use new server discovery and monitoring engine
};

// Connect to MongoDB database using environment variable or fallback to local database
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/excel-analytics', mongooseOptions)
  .then(() => {
    // Success callback - Log successful database connection details
    console.log('Successfully connected to MongoDB.');
    console.log('Database:', mongoose.connection.name);
    console.log('Host:', mongoose.connection.host);
  })
  .catch(err => {
    // Error callback - Log error and exit process if database connection fails
    console.error('MongoDB connection error:', err);
    process.exit(1); // Exit if cannot connect to database
  });

// Create Express application instance
const app = express();

// CORS configuration - Define which origins can access the API
const corsOptions = {
  origin: 'http://localhost:3000', // Allow requests from React app's address
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'], // Allowed HTTP methods
  allowedHeaders: ['Content-Type', 'Authorization'], // Allowed request headers
  credentials: true // Allow cookies and authentication headers
};

// Apply middleware to Express app in order of execution
app.use(helmet()); // Security headers middleware - protects against common vulnerabilities
app.use(cors(corsOptions)); // Enable CORS with specified options
app.use(morgan('dev')); // HTTP request logging in development format
app.use(express.json()); // Parse incoming JSON payloads
app.use(express.urlencoded({ extended: true })); // Parse URL-encoded bodies

// Test route to verify server is running and accessible
app.get('/api/test', (req, res) => {
  res.json({ message: 'Server is running!' });
});

// Mount authentication routes under /api/auth prefix
app.use('/api/auth', authRoutes);

// Basic root route - Welcome message for API
app.get('/', (req, res) => {
  res.json({ message: 'Welcome to Excel Analytics Platform API' });
});

// Global error handling middleware - Catches all unhandled errors
app.use((err, req, res, next) => {
  console.error('Error:', err); // Log error for debugging
  res.status(500).json({ 
    message: 'Something went wrong!',
    // Only show error details in development environment for security
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// Start the server on specified port or default to 5000
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  console.log(`API available at http://localhost:${PORT}`);
}); 