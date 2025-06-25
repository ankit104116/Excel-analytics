import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import '../styles/AuthForm.css';

const ADMIN_USERNAME = 'admin';
const ADMIN_PASSWORD = 'admin123';

const AdminLogin = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const response = await fetch('http://localhost:5001/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await response.json();
      if (response.ok && data.user.role === 'admin') {
        localStorage.setItem('token', data.token);
        localStorage.setItem('isAdmin', 'true');
        localStorage.setItem('user', JSON.stringify(data.user));
        navigate('/admin-dashboard');
      } else {
        setError('Invalid admin credentials');
      }
    } catch (err) {
      setError('Login failed');
    }
    setLoading(false);
  };

  return (
    <div className="auth-bg">
      <div className="auth-card">
        <div className="auth-header">
          <h2>Admin Login</h2>
          <p>Enter admin credentials to access the dashboard</p>
        </div>
        <form className="auth-form" onSubmit={handleSubmit}>
          {error && <div className="error-message">{error}</div>}
          <div className="form-group">
            <label htmlFor="admin-email">Email address</label>
            <input
              id="admin-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="Enter admin email"
            />
          </div>
          <div className="form-group">
            <label htmlFor="admin-password">Password</label>
            <input
              id="admin-password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="Enter admin password"
            />
          </div>
          <button type="submit" className="auth-button" disabled={loading}>
            {loading ? 'Logging in...' : 'Login as Admin'}
          </button>
          <div className="auth-link">
            <Link to="/login">User Login</Link>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AdminLogin; 