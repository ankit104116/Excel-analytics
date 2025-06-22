import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const UserDashboard = () => {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div style={{ padding: '2rem', textAlign: 'center' }}>
      <h2>Welcome to the User Dashboard</h2>
      <p>You are logged in as a user.</p>
      <button onClick={handleLogout} style={{ marginTop: '2rem', padding: '0.7rem 1.5rem', background: '#3498db', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '1rem' }}>
        Logout
      </button>
    </div>
  );
};

export default UserDashboard; 