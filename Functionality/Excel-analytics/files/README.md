# Excel Analytics Platform

A comprehensive web-based platform for Excel file analysis, data visualization, and user management with role-based access control.

## 🚀 Overview

The Excel Analytics Platform is a full-stack application that allows users to upload Excel files, analyze data, create visualizations, and manage user accounts. The platform features a robust authentication system, admin dashboard, and real-time analytics capabilities.

## 📋 Table of Contents

- [Features](#-features)
- [Technology Stack](#-technology-stack)
- [Architecture](#-architecture)
- [Installation](#-installation)
- [Usage](#-usage)
- [API Documentation](#-api-documentation)
- [Admin Features](#-admin-features)
- [Security Features](#-security-features)
- [File Structure](#-file-structure)

## ✨ Features

### 🔐 Authentication & User Management
- **User Registration & Login**: Secure user authentication with JWT tokens
- **Role-Based Access Control**: User and Admin roles with different permissions
- **Password Security**: Bcrypt hashing for secure password storage
- **Session Management**: JWT-based session handling with expiration
- **User Profile Management**: View and update user information

### 📊 Excel File Processing
- **File Upload**: Drag-and-drop or click-to-upload Excel files (.xls, .xlsx)
- **Data Parsing**: Automatic conversion of Excel data to JSON format
- **File Validation**: Type checking and format validation
- **Data Storage**: Secure storage of parsed data in MongoDB
- **File History**: Track and manage uploaded files

### 📈 Data Visualization
- **Chart Generation**: Create various chart types from Excel data
- **Interactive Charts**: Dynamic chart rendering with Chart.js
- **Axis Configuration**: Customizable X and Y axis selection
- **Chart Types**: Support for multiple chart formats
- **Real-time Updates**: Live chart updates based on data changes

### 🎨 Frontend Features
- **Responsive Design**: Modern UI with Tailwind CSS
- **User Dashboard**: Personalized dashboard for regular users
- **Admin Dashboard**: Comprehensive admin interface
- **Landing Page**: Professional landing page with feature showcase
- **Protected Routes**: Role-based route protection
- **Modern UI/UX**: Clean, intuitive user interface

### 🔧 Admin Capabilities
- **User Management**: View, edit, and delete user accounts
- **Role Management**: Toggle user roles between User and Admin
- **System Analytics**: Monitor platform performance and usage
- **User Activity Tracking**: Track user actions and file uploads
- **Performance Monitoring**: API response time analytics
- **User Reports**: Generate reports for individual users

### 📈 Analytics & Monitoring
- **Performance Metrics**: Track API response times
- **User Statistics**: Monitor user registration and activity
- **File Analytics**: Track file upload patterns
- **System Health**: Monitor database connections and server status
- **Usage Reports**: Generate comprehensive usage reports

## 🛠 Technology Stack

### Backend
- **Node.js**: Server-side JavaScript runtime
- **Express.js**: Web application framework
- **MongoDB**: NoSQL database with Mongoose ODM
- **JWT**: JSON Web Tokens for authentication
- **Multer**: File upload handling
- **XLSX**: Excel file parsing library
- **Bcryptjs**: Password hashing
- **Helmet**: Security middleware
- **Morgan**: HTTP request logging
- **CORS**: Cross-origin resource sharing

### Frontend
- **React.js**: Frontend framework
- **React Router**: Client-side routing
- **Redux Toolkit**: State management
- **Chart.js**: Data visualization library
- **Tailwind CSS**: Utility-first CSS framework
- **Three.js**: 3D graphics library
- **File-saver**: File download functionality
- **HTML2Canvas**: Screenshot capabilities
- **jsPDF**: PDF generation

### Development Tools
- **Nodemon**: Development server with auto-restart
- **ESLint**: Code linting
- **PostCSS**: CSS processing
- **Autoprefixer**: CSS vendor prefixing

## 🏗 Architecture

```
Excel Analytics Platform
├── Backend (Node.js/Express)
│   ├── Authentication System
│   ├── File Processing Engine
│   ├── Database Models
│   ├── API Endpoints
│   └── Admin Services
├── Frontend (React)
│   ├── User Interface
│   ├── State Management
│   ├── Chart Components
│   └── Authentication Context
└── Database (MongoDB)
    ├── User Collection
    └── Analysis Collection
```

## 📦 Installation

### Prerequisites
- Node.js (>= 14.0.0)
- MongoDB (local or cloud instance)
- npm or yarn package manager

### Quick Start

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd integ/Excel-analytics
   ```

2. **Install dependencies**
   ```bash
   # Install backend dependencies
   npm install
   
   # Install frontend dependencies
   cd files/client
   npm install
   ```

3. **Environment Setup**
   Create a `.env` file in the root directory:
   ```env
   MONGODB_URI=mongodb://localhost:27017/excel-analytics
   JWT_SECRET=your_jwt_secret_key
   PORT=5001
   NODE_ENV=development
   ```

4. **Start the platform**

   **Windows:**
   ```bash
   start-platform.bat
   ```

   **Linux/Mac:**
   ```bash
   chmod +x start-platform.sh
   ./start-platform.sh
   ```

   **Manual Start:**
   ```bash
   # Terminal 1 - Backend
   node unified-server.js
   
   # Terminal 2 - Frontend
   cd files/client
   npm start
   ```

## 🚀 Usage

### For Regular Users

1. **Access the Platform**
   - Navigate to `http://localhost:3000`
   - Register a new account or login

2. **Upload Excel Files**
   - Click "Upload File" in the dashboard
   - Select an Excel file (.xls or .xlsx)
   - File will be automatically parsed and stored

3. **Create Visualizations**
   - Select uploaded data from history
   - Choose chart type and axis configuration
   - Generate interactive charts

4. **Manage Data**
   - View upload history
   - Access previous analyses
   - Download generated charts

### For Administrators

1. **Admin Access**
   - Login with admin credentials
   - Access admin dashboard at `/admin`

2. **User Management**
   - View all registered users
   - Modify user roles
   - Monitor user activity
   - Delete user accounts

3. **System Analytics**
   - Monitor platform performance
   - View user statistics
   - Track file upload patterns
   - Generate system reports

## 📚 API Documentation

### Authentication Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/signup` | Register new user |
| POST | `/api/auth/login` | User login |
| GET | `/api/auth/me` | Get current user info |
| GET | `/api/auth/admin-only` | Admin-only route test |

### File Processing Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/upload` | Upload Excel file |
| GET | `/api/history` | Get user's file history |
| POST | `/api/analysis` | Create data analysis |

### Admin Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/admin/users` | Get all users |
| PATCH | `/api/admin/user/:id/role` | Update user role |
| DELETE | `/api/admin/user/:id` | Delete user |
| GET | `/api/admin/analytics/performance` | Get API performance metrics |
| GET | `/api/admin/analytics/summary` | Get system summary |
| GET | `/api/admin/analytics/signups` | Get user signup trends |

## 🔐 Security Features

- **JWT Authentication**: Secure token-based authentication
- **Password Hashing**: Bcrypt encryption for passwords
- **Input Validation**: Comprehensive input sanitization
- **CORS Protection**: Cross-origin request security
- **Helmet Security**: HTTP header security
- **Role-Based Access**: Granular permission control
- **File Type Validation**: Secure file upload restrictions

## 📁 File Structure

```
integ/Excel-analytics/
├── unified-server.js          # Main backend server
├── package.json               # Backend dependencies
├── start-platform.bat         # Windows startup script
├── start-platform.sh          # Linux/Mac startup script
├── uploads/                   # File upload directory
├── logs/                      # Application logs
├── files/
│   └── client/                # React frontend
│       ├── src/
│       │   ├── pages/         # Page components
│       │   ├── components/    # Reusable components
│       │   ├── contexts/      # React contexts
│       │   └── styles/        # CSS stylesheets
│       ├── public/            # Static assets
│       └── package.json       # Frontend dependencies
└── README.md                  # Project documentation
```

## 🎯 Key Features Summary

### Core Functionality
- ✅ Excel file upload and parsing
- ✅ Data visualization with charts
- ✅ User authentication and authorization
- ✅ Role-based access control
- ✅ File history and management
- ✅ Admin dashboard and user management

### Advanced Features
- ✅ Real-time performance monitoring
- ✅ System analytics and reporting
- ✅ Secure file handling
- ✅ Responsive design
- ✅ Cross-platform compatibility
- ✅ Scalable architecture

### Developer Experience
- ✅ Comprehensive API documentation
- ✅ Modular code structure
- ✅ Error handling and logging
- ✅ Development and production scripts
- ✅ Environment configuration
- ✅ Testing framework ready

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

For support and questions:
- Check the documentation
- Review the API endpoints
- Examine the code structure
- Contact the development team

---

**Excel Analytics Platform** - Transform your Excel data into powerful insights! 📊✨
