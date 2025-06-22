import React from 'react';
import { useNavigate } from 'react-router-dom';

const AdminDashboard = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('isAdmin');
    navigate('/admin-login');
  };

  return (
    <div style={{ padding: '2rem', textAlign: 'center' }}>
      <h2>Welcome to the Admin Dashboard</h2>
      <p>You are logged in as an admin.</p>
      <button onClick={handleLogout} style={{ marginTop: '2rem', padding: '0.7rem 1.5rem', background: '#3498db', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '1rem' }}>
        Logout
      </button>
    </div>
  );
};

export default AdminDashboard; 