require('dotenv').config();

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const XLSX = require('xlsx');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const validator = require('validator');

const app = express();

// Ensure uploads folder exists
const uploadDir = './uploads';
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir);
}

// MongoDB Connection
const mongooseOptions = {
  useNewUrlParser: true,
  useUnifiedTopology: true,
};

mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/excel-analytics', mongooseOptions)
  .then(() => {
    console.log('✅ Successfully connected to MongoDB.');
    console.log('Database:', mongoose.connection.name);
    console.log('Host:', mongoose.connection.host);
  })
  .catch(err => {
    console.error('❌ MongoDB connection error:', err);
    process.exit(1);
  });

// User Schema
const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
    validate: [validator.isEmail, 'Please provide a valid email']
  },
  password: {
    type: String,
    required: true,
    minlength: 8,
    select: false
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  role: {
    type: String,
    enum: ['user', 'admin'],
    default: 'user'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

const User = mongoose.model('User', userSchema);

// Analysis Schema
const analysisSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  fileName: String,
  xAxis: String,
  yAxis: String,
  chartType: String,
  data: Object, // Store the parsed Excel data
  createdAt: { type: Date, default: Date.now }
});

const Analysis = mongoose.model('Analysis', analysisSchema);

// Middleware
app.use(helmet());
app.use(cors({
  origin: 'http://localhost:3000',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}));
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Authentication Middleware
const protect = async (req, res, next) => {
  try {
    let token;
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return res.status(401).json({ message: 'Please log in to access this resource' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your_jwt_secret');
    const user = await User.findById(decoded.id);
    if (!user) {
      return res.status(401).json({ message: 'User no longer exists' });
    }

    req.user = user;
    next();
  } catch (error) {
    res.status(401).json({ message: 'Not authorized to access this route' });
  }
};

const restrictTo = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ 
        message: 'You do not have permission to perform this action' 
      });
    }
    next();
  };
};

// Multer config for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, file.fieldname + '-' + uniqueSuffix + ext);
  }
});

const fileFilter = (req, file, cb) => {
  const allowedTypes = [
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'application/vnd.ms-excel'
  ];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Only Excel files are allowed'), false);
  }
};

const upload = multer({ storage, fileFilter });

// --- Analytics Middleware and Endpoints ---
const responseTimes = {
  '/api/upload': [],
  '/api/history': [],
  '/api/auth/login': []
};

function logResponseTime(endpoint) {
  return async (req, res, next) => {
    const start = process.hrtime();
    res.on('finish', () => {
      const diff = process.hrtime(start);
      const ms = diff[0] * 1000 + diff[1] / 1e6;
      if (responseTimes[endpoint]) {
        responseTimes[endpoint].push(ms);
        if (responseTimes[endpoint].length > 100) responseTimes[endpoint].shift();
      }
    });
    next();
  };
}

// Routes

// Test route
app.get('/api/test', (req, res) => {
  res.json({ message: 'Unified Excel Analytics API is running!' });
});

// Authentication Routes
app.post('/api/auth/signup', async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }

    const user = await User.create({
      name,
      email,
      password,
      role: role || 'user'
    });

    const token = jwt.sign(
      { id: user._id },
      process.env.JWT_SECRET || 'your_jwt_secret',
      { expiresIn: '1d' }
    );

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
    res.status(400).json({ message: error.message });
  }
});

app.post('/api/auth/login', logResponseTime('/api/auth/login'), async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const isPasswordCorrect = await user.comparePassword(password);
    if (!isPasswordCorrect) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const token = jwt.sign(
      { id: user._id },
      process.env.JWT_SECRET || 'your_jwt_secret',
      { expiresIn: '1d' }
    );

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
    res.status(400).json({ message: error.message });
  }
});

app.get('/api/auth/me', protect, async (req, res) => {
  res.json({
    user: {
      id: req.user._id,
      name: req.user.name,
      email: req.user.email,
      role: req.user.role
    }
  });
});

app.get('/api/auth/admin-only', protect, restrictTo('admin'), (req, res) => {
  res.json({ message: 'This is an admin only route' });
});

// Excel Upload and Analysis Routes
app.post('/api/upload', logResponseTime('/api/upload'), protect, upload.single('file'), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: 'No file uploaded or invalid file type' });
  }

  try {
    const filePath = req.file.path;
    const workbook = XLSX.readFile(filePath);
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];
    const jsonData = XLSX.utils.sheet_to_json(sheet);

    // Save analysis record
    const analysis = await Analysis.create({
      userId: req.user._id,
      fileName: req.file.originalname,
      data: jsonData,
      createdAt: new Date()
    });

    res.status(200).json({
      message: 'File uploaded and parsed successfully',
      file: req.file,
      data: jsonData,
      analysisId: analysis._id
    });
  } catch (err) {
    console.error('Error parsing Excel file:', err);
    res.status(500).json({ message: 'Error reading Excel file' });
  }
});

// Analysis History Routes
app.get('/api/history', logResponseTime('/api/history'), protect, async (req, res) => {
  try {
    const analyses = await Analysis.find({ userId: req.user._id })
      .sort({ createdAt: -1 })
      .limit(50);
    res.json(analyses);
  } catch (err) {
    res.status(500).json({ message: 'Server Error' });
  }
});

app.post('/api/analysis', protect, async (req, res) => {
  try {
    const { analysisId, xAxis, yAxis, chartType } = req.body;
    
    const analysis = await Analysis.findById(analysisId);
    if (!analysis || analysis.userId.toString() !== req.user._id.toString()) {
      return res.status(404).json({ message: 'Analysis not found' });
    }

    analysis.xAxis = xAxis;
    analysis.yAxis = yAxis;
    analysis.chartType = chartType;
    await analysis.save();

    res.json(analysis);
  } catch (err) {
    res.status(500).json({ message: 'Server Error' });
  }
});

// Admin: Get all users
app.get('/api/admin/users', protect, restrictTo('admin'), async (req, res) => {
  try {
    const users = await User.find({}, 'id name email role createdAt');
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: 'Server Error' });
  }
});

// Analytics: API Response Times
app.get('/api/admin/analytics/performance', protect, restrictTo('admin'), (req, res) => {
  const result = {};
  for (const key in responseTimes) {
    const arr = responseTimes[key];
    result[key] = arr.length ? (arr.reduce((a, b) => a + b, 0) / arr.length).toFixed(2) : null;
  }
  res.json(result);
});

// Analytics: User & File Stats
app.get('/api/admin/analytics/summary', protect, restrictTo('admin'), async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const since = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const activeUsers = await Analysis.distinct('userId', { createdAt: { $gte: since } });
    const totalFiles = await Analysis.countDocuments();
    res.json({
      totalUsers,
      activeUsers: activeUsers.length,
      totalFiles
    });
  } catch (err) {
    res.status(500).json({ message: 'Server Error' });
  }
});

// Admin: Get all reports/analyses for a user
app.get('/api/admin/user/:userId/reports', protect, restrictTo('admin'), async (req, res) => {
  try {
    const analyses = await Analysis.find({ userId: req.params.userId }).sort({ createdAt: -1 });
    res.json(analyses);
  } catch (err) {
    res.status(500).json({ message: 'Server Error' });
  }
});

// Admin: Toggle user/admin role
app.patch('/api/admin/user/:userId/role', protect, restrictTo('admin'), async (req, res) => {
  try {
    const { role } = req.body;
    if (!['user', 'admin'].includes(role)) {
      return res.status(400).json({ message: 'Invalid role' });
    }
    const user = await User.findByIdAndUpdate(req.params.userId, { role }, { new: true });
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json({ message: 'Role updated', user });
  } catch (err) {
    res.status(500).json({ message: 'Server Error' });
  }
});

// Admin: Get user activity log (for now, just recent analyses)
app.get('/api/admin/user/:userId/activity', protect, restrictTo('admin'), async (req, res) => {
  try {
    const activity = await Analysis.find({ userId: req.params.userId }).sort({ createdAt: -1 }).limit(20);
    res.json(activity);
  } catch (err) {
    res.status(500).json({ message: 'Server Error' });
  }
});

// Admin: Delete user
app.delete('/api/admin/user/:userId', protect, restrictTo('admin'), async (req, res) => {
  try {
    await User.findByIdAndDelete(req.params.userId);
    await Analysis.deleteMany({ userId: req.params.userId });
    res.json({ message: 'User and their analyses deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Server Error' });
  }
});

// Admin: User signups over time (daily for last 30 days)
app.get('/api/admin/analytics/signups', protect, restrictTo('admin'), async (req, res) => {
  try {
    const since = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const users = await User.find({ createdAt: { $gte: since } });
    const counts = {};
    users.forEach(u => {
      const day = u.createdAt.toISOString().slice(0, 10);
      counts[day] = (counts[day] || 0) + 1;
    });
    // Fill in days with 0 signups
    for (let i = 0; i < 30; i++) {
      const d = new Date(Date.now() - i * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);
      if (!counts[d]) counts[d] = 0;
    }
    // Sort by date ascending
    const sorted = Object.entries(counts).sort(([a], [b]) => a.localeCompare(b));
    res.json({ labels: sorted.map(([d]) => d), data: sorted.map(([, c]) => c) });
  } catch (err) {
    res.status(500).json({ message: 'Server Error' });
  }
});

// Root route
app.get('/', (req, res) => {
  res.json({ message: 'Welcome to Unified Excel Analytics Platform API' });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({ 
    message: 'Something went wrong!',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// Start server
const PORT = process.env.PORT || 5001;
app.listen(PORT, () => {
  console.log(`🚀 Unified Server running on http://localhost:${PORT}`);
  console.log(`📊 API available at http://localhost:${PORT}/api`);
}); 