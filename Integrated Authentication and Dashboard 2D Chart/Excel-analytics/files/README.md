# Authentication Platform

A comprehensive authentication system built with React frontend and Node.js backend, featuring user registration, login, role-based access control, and secure JWT token management.

## 🔐 Authentication Features

### Core Authentication
- **User Registration**: Secure signup with email validation and password hashing
- **User Login**: JWT-based authentication with token storage
- **Password Security**: Bcrypt hashing with salt rounds (12)
- **Email Validation**: Built-in email format validation using validator.js
- **Session Management**: Persistent login state with localStorage

### Role-Based Access Control (RBAC)
- **User Roles**: Support for 'user' and 'admin' roles
- **Protected Routes**: Middleware-based route protection
- **Role Restrictions**: Granular permission control for different user types
- **Admin-Only Routes**: Specialized admin dashboard and functionality

### Security Features
- **JWT Tokens**: Secure token-based authentication
- **Password Hashing**: Bcrypt encryption for password storage
- **Input Validation**: Comprehensive validation for all user inputs
- **CORS Protection**: Configured CORS for secure cross-origin requests
- **Helmet Security**: HTTP headers security middleware
- **Token Expiration**: Configurable token expiration (default: 1 day)

## 🏗️ Project Architecture

### Frontend (React)
```
client/
├── src/
│   ├── components/          # Reusable UI components
│   │   └── ProtectedRoute.js # Route protection component
│   ├── contexts/            # React Context providers
│   │   └── AuthContext.js   # Authentication state management
│   ├── pages/               # Page components
│   │   ├── Login.js         # User login page
│   │   ├── Signup.js        # User registration page
│   │   ├── AdminLogin.js    # Admin-specific login
│   │   ├── UserDashboard.js # User dashboard
│   │   ├── AdminDashboard.js # Admin dashboard
│   │   └── LandingPage.js   # Home page
│   ├── styles/              # CSS and styling files
│   ├── App.js               # Main application component
│   └── index.js             # Application entry point
├── public/                  # Static assets
└── package.json             # Frontend dependencies
```

### Backend (Node.js/Express)
```
server/
├── src/
│   ├── models/              # Database models
│   │   └── user.model.js    # User schema and methods
│   ├── middleware/          # Custom middleware
│   │   └── auth.middleware.js # Authentication middleware
│   ├── routes/              # API routes
│   │   └── auth.routes.js   # Authentication endpoints
│   └── index.js             # Server entry point
├── .env                     # Environment variables
└── package.json             # Backend dependencies
```

## 📁 File Explanations

### Frontend Files

#### `client/src/App.js`
- **Purpose**: Main application component with routing configuration
- **Features**: 
  - Route definitions for all pages
  - Protected route implementation
  - Admin route protection
  - Navigation structure

#### `client/src/contexts/AuthContext.js`
- **Purpose**: Global authentication state management
- **Features**:
  - User state management
  - Login/logout functionality
  - Token storage and retrieval
  - Automatic user data fetching
  - Error handling for auth operations

#### `client/src/components/ProtectedRoute.js`
- **Purpose**: Route protection component
- **Features**:
  - Checks authentication status
  - Redirects unauthenticated users
  - Integrates with AuthContext

#### `client/src/pages/`
- **Login.js**: User login form with validation
- **Signup.js**: User registration form
- **AdminLogin.js**: Admin-specific login interface
- **UserDashboard.js**: Authenticated user dashboard
- **AdminDashboard.js**: Admin-only dashboard
- **LandingPage.js**: Public home page

### Backend Files

#### `server/src/index.js`
- **Purpose**: Main server entry point
- **Features**:
  - Express server setup
  - MongoDB connection
  - Middleware configuration
  - Route registration
  - Error handling

#### `server/src/models/user.model.js`
- **Purpose**: User data model and schema
- **Features**:
  - Mongoose schema definition
  - Password hashing middleware
  - Password comparison method
  - Email validation
  - Role-based user structure

#### `server/src/middleware/auth.middleware.js`
- **Purpose**: Authentication and authorization middleware
- **Features**:
  - JWT token verification
  - User authentication checking
  - Role-based access control
  - Protected route middleware

#### `server/src/routes/auth.routes.js`
- **Purpose**: Authentication API endpoints
- **Features**:
  - User registration endpoint
  - User login endpoint
  - Current user data endpoint
  - Admin-only routes
  - JWT token generation

## 🛠️ Technologies Used

### Frontend Technologies
- **React 19.1.0**: Modern UI library for building user interfaces
- **React Router DOM 7.6.2**: Client-side routing
- **React Context API**: State management for authentication
- **Tailwind CSS 4.1.8**: Utility-first CSS framework
- **Chart.js 4.4.9**: Data visualization library
- **Three.js 0.177.0**: 3D graphics library
- **Redux Toolkit 2.8.2**: State management (available but not used in auth)

### Backend Technologies
- **Node.js**: JavaScript runtime environment
- **Express 4.21.2**: Web application framework
- **MongoDB**: NoSQL database
- **Mongoose 7.8.7**: MongoDB object modeling
- **JWT 9.0.2**: JSON Web Token authentication
- **Bcryptjs 2.4.3**: Password hashing
- **Validator 13.15.15**: Input validation
- **CORS 2.8.5**: Cross-origin resource sharing
- **Helmet 7.2.0**: Security middleware
- **Morgan 1.10.0**: HTTP request logger
- **Dotenv 16.5.0**: Environment variable management
- **Multer 1.4.5-lts.1**: File upload handling
- **XLSX 0.18.5**: Excel file processing

### Development Tools
- **Nodemon 3.0.1**: Development server with auto-restart
- **Jest 29.6.4**: Testing framework
- **React Scripts 5.0.1**: Create React App scripts
- **PostCSS 8.5.4**: CSS processing
- **Autoprefixer 10.4.21**: CSS vendor prefixing

## 🚀 Getting Started

### Prerequisites
- Node.js (v14 or higher)
- MongoDB (local or cloud instance)
- npm or yarn package manager

### Installation

1. **Clone the repository**:
```bash
git clone [repository-url]
cd Authentication
```

2. **Install backend dependencies**:
```bash
cd server
npm install
```

3. **Install frontend dependencies**:
```bash
cd ../client
npm install
```

4. **Set up environment variables**:
   Create `.env` file in the `server` directory:
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/authentication
JWT_SECRET=your_secure_jwt_secret_key_here
NODE_ENV=development
```

5. **Start the development servers**:

**Backend (from server directory)**:
```bash
npm run dev
```

**Frontend (from client directory)**:
```bash
npm start
```

### Application URLs
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:5000

## 🔌 API Endpoints

### Authentication Endpoints
- `POST /api/auth/signup` - Register a new user
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user data (protected)
- `GET /api/auth/admin-only` - Admin-only route (protected)

### Request/Response Examples

#### User Registration
```json
POST /api/auth/signup
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "securepassword123",
  "role": "user"
}
```

#### User Login
```json
POST /api/auth/login
{
  "email": "john@example.com",
  "password": "securepassword123"
}
```

#### Protected Route Access
```json
GET /api/auth/me
Headers: {
  "Authorization": "Bearer <jwt_token>"
}
```

## 🔒 Security Considerations

### Password Security
- Passwords are hashed using bcrypt with 12 salt rounds
- Minimum password length: 8 characters
- Passwords are never stored in plain text

### JWT Security
- Tokens expire after 1 day
- Tokens are stored in localStorage (consider httpOnly cookies for production)
- JWT secret should be a strong, random string

### Input Validation
- Email format validation using validator.js
- Required field validation
- Role-based access control validation

### CORS Configuration
- Configured for development (localhost:3000)
- Should be updated for production deployment

## 🧪 Testing

### Backend Testing
```bash
cd server
npm test
```

### Frontend Testing
```bash
cd client
npm test
```

## 📦 Production Deployment

### Environment Variables for Production
```env
PORT=5000
MONGODB_URI=your_production_mongodb_uri
JWT_SECRET=your_production_jwt_secret
NODE_ENV=production
```

### Build Commands
```bash
# Frontend build
cd client
npm run build

# Backend start
cd server
npm start
```

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🔗 Related Links

- [React Documentation](https://reactjs.org/)
- [Express.js Documentation](https://expressjs.com/)
- [MongoDB Documentation](https://docs.mongodb.com/)
- [JWT.io](https://jwt.io/)
- [Bcrypt Documentation](https://github.com/dcodeIO/bcrypt.js/) 