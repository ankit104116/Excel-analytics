// Import required dependencies for user model
const mongoose = require('mongoose');      // MongoDB object modeling tool
const bcrypt = require('bcryptjs');        // Password hashing library
const validator = require('validator');    // Input validation library

// Define the user schema with all required fields and validation rules
const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,                        // Email is mandatory
    unique: true,                          // Email must be unique across all users
    lowercase: true,                       // Convert email to lowercase for consistency
    trim: true,                           // Remove whitespace from beginning and end
    validate: [validator.isEmail, 'Please provide a valid email'] // Custom email validation
  },
  password: {
    type: String,
    required: true,                        // Password is mandatory
    minlength: 8,                         // Minimum password length for security
    select: false                         // Don't include password in queries by default for security
  },
  name: {
    type: String,
    required: true,                        // Name is mandatory
    trim: true                           // Remove whitespace from beginning and end
  },
  role: {
    type: String,
    enum: ['user', 'admin'],              // Only allow these two role values
    default: 'user'                       // Default role for new users
  },
  createdAt: {
    type: Date,
    default: Date.now                     // Automatically set creation timestamp
  }
});

// Pre-save middleware - Hash password before saving to database
userSchema.pre('save', async function(next) {
  // Only hash password if it has been modified (or is new)
  if (!this.isModified('password')) return next();
  
  // Hash password with 12 salt rounds for security
  this.password = await bcrypt.hash(this.password, 12);
  next(); // Continue with save operation
});

// Instance method to compare candidate password with stored hashed password
userSchema.methods.comparePassword = async function(candidatePassword) {
  // Use bcrypt to compare plain text password with hashed password
  return await bcrypt.compare(candidatePassword, this.password);
};

// Create and export the User model based on the schema
const User = mongoose.model('User', userSchema);

module.exports = User; 