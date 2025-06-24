import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/Dashboard.css';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalAnalyses: 0,
    recentUploads: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate fetching admin stats
    setTimeout(() => {
      setStats({
        totalUsers: 42,
        totalAnalyses: 156,
        recentUploads: 23
      });
      setLoading(false);
    }, 1000);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('isAdmin');
    navigate('/admin-login');
  };

  const handleUserManagement = () => {
    // TODO: Implement user management
    alert('User management feature coming soon!');
  };

  const handleSystemSettings = () => {
    // TODO: Implement system settings
    alert('System settings feature coming soon!');
  };

  const handleAnalytics = () => {
    // TODO: Implement analytics dashboard
    alert('Analytics dashboard feature coming soon!');
  };

  return (
    <div className="dashboard-container">
      {/* Header */}
      <div className="dashboard-header">
        <div>
          <h1 className="dashboard-title">Admin Dashboard</h1>
          <p className="dashboard-subtitle">System Administration & Analytics</p>
        </div>
        <button onClick={handleLogout} className="logout-btn">
          Logout
        </button>
      </div>

      {/* Stats Overview */}
      <div className="dashboard-section">
        <h2 className="section-title">System Overview</h2>
        {loading ? (
          <div style={{ textAlign: 'center', padding: '2rem' }}>
            <div className="loading-spinner" style={{ width: '40px', height: '40px', margin: '0 auto' }}></div>
            <p style={{ marginTop: '1rem', color: '#6b7280' }}>Loading system statistics...</p>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem' }}>
            <div style={{ 
              background: 'linear-gradient(135deg, #3b82f6, #1d4ed8)', 
              color: 'white', 
              padding: '1.5rem', 
              borderRadius: '16px',
              textAlign: 'center'
            }}>
              <h3 style={{ margin: '0 0 0.5rem 0', fontSize: '2rem', fontWeight: '700' }}>{stats.totalUsers}</h3>
              <p style={{ margin: 0, opacity: 0.9 }}>Total Users</p>
            </div>
            <div style={{ 
              background: 'linear-gradient(135deg, #10b981, #059669)', 
              color: 'white', 
              padding: '1.5rem', 
              borderRadius: '16px',
              textAlign: 'center'
            }}>
              <h3 style={{ margin: '0 0 0.5rem 0', fontSize: '2rem', fontWeight: '700' }}>{stats.totalAnalyses}</h3>
              <p style={{ margin: 0, opacity: 0.9 }}>Total Analyses</p>
            </div>
            <div style={{ 
              background: 'linear-gradient(135deg, #f59e0b, #d97706)', 
              color: 'white', 
              padding: '1.5rem', 
              borderRadius: '16px',
              textAlign: 'center'
            }}>
              <h3 style={{ margin: '0 0 0.5rem 0', fontSize: '2rem', fontWeight: '700' }}>{stats.recentUploads}</h3>
              <p style={{ margin: 0, opacity: 0.9 }}>Recent Uploads</p>
            </div>
          </div>
        )}
      </div>

      {/* Admin Actions */}
      <div className="dashboard-section">
        <h2 className="section-title">Administrative Actions</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem' }}>
          <button 
            onClick={handleUserManagement}
            style={{
              background: 'linear-gradient(135deg, #8b5cf6, #7c3aed)',
              color: 'white',
              border: 'none',
              padding: '1.5rem',
              borderRadius: '16px',
              fontSize: '1.1rem',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              boxShadow: '0 4px 15px rgba(139, 92, 246, 0.3)'
            }}
            onMouseEnter={(e) => {
              e.target.style.transform = 'translateY(-5px)';
              e.target.style.boxShadow = '0 8px 25px rgba(139, 92, 246, 0.4)';
            }}
            onMouseLeave={(e) => {
              e.target.style.transform = 'translateY(0)';
              e.target.style.boxShadow = '0 4px 15px rgba(139, 92, 246, 0.3)';
            }}
          >
            👥 User Management
          </button>
          
          <button 
            onClick={handleSystemSettings}
            style={{
              background: 'linear-gradient(135deg, #06b6d4, #0891b2)',
              color: 'white',
              border: 'none',
              padding: '1.5rem',
              borderRadius: '16px',
              fontSize: '1.1rem',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              boxShadow: '0 4px 15px rgba(6, 182, 212, 0.3)'
            }}
            onMouseEnter={(e) => {
              e.target.style.transform = 'translateY(-5px)';
              e.target.style.boxShadow = '0 8px 25px rgba(6, 182, 212, 0.4)';
            }}
            onMouseLeave={(e) => {
              e.target.style.transform = 'translateY(0)';
              e.target.style.boxShadow = '0 4px 15px rgba(6, 182, 212, 0.3)';
            }}
          >
            ⚙️ System Settings
          </button>
          
          <button 
            onClick={handleAnalytics}
            style={{
              background: 'linear-gradient(135deg, #f97316, #ea580c)',
              color: 'white',
              border: 'none',
              padding: '1.5rem',
              borderRadius: '16px',
              fontSize: '1.1rem',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              boxShadow: '0 4px 15px rgba(249, 115, 22, 0.3)'
            }}
            onMouseEnter={(e) => {
              e.target.style.transform = 'translateY(-5px)';
              e.target.style.boxShadow = '0 8px 25px rgba(249, 115, 22, 0.4)';
            }}
            onMouseLeave={(e) => {
              e.target.style.transform = 'translateY(0)';
              e.target.style.boxShadow = '0 4px 15px rgba(249, 115, 22, 0.3)';
            }}
          >
            📊 Analytics Dashboard
          </button>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="dashboard-section">
        <h2 className="section-title">Quick Actions</h2>
        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
          <button 
            onClick={() => navigate('/dashboard')}
            style={{
              background: 'linear-gradient(135deg, #10b981, #059669)',
              color: 'white',
              border: 'none',
              padding: '0.75rem 1.5rem',
              borderRadius: '12px',
              fontSize: '1rem',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              boxShadow: '0 4px 15px rgba(16, 185, 129, 0.3)'
            }}
            onMouseEnter={(e) => {
              e.target.style.transform = 'translateY(-2px)';
              e.target.style.boxShadow = '0 8px 25px rgba(16, 185, 129, 0.4)';
            }}
            onMouseLeave={(e) => {
              e.target.style.transform = 'translateY(0)';
              e.target.style.boxShadow = '0 4px 15px rgba(16, 185, 129, 0.3)';
            }}
          >
            📈 View User Dashboard
          </button>
          
          <button 
            onClick={() => window.open('http://localhost:5000/api/test', '_blank')}
            style={{
              background: 'linear-gradient(135deg, #6b7280, #4b5563)',
              color: 'white',
              border: 'none',
              padding: '0.75rem 1.5rem',
              borderRadius: '12px',
              fontSize: '1rem',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              boxShadow: '0 4px 15px rgba(107, 114, 128, 0.3)'
            }}
            onMouseEnter={(e) => {
              e.target.style.transform = 'translateY(-2px)';
              e.target.style.boxShadow = '0 8px 25px rgba(107, 114, 128, 0.4)';
            }}
            onMouseLeave={(e) => {
              e.target.style.transform = 'translateY(0)';
              e.target.style.boxShadow = '0 4px 15px rgba(107, 114, 128, 0.3)';
            }}
          >
            🔗 API Status
          </button>
        </div>
      </div>

      {/* System Info */}
      <div className="dashboard-section">
        <h2 className="section-title">System Information</h2>
        <div style={{ 
          background: 'linear-gradient(135deg, rgba(102, 126, 234, 0.05), rgba(118, 75, 162, 0.05))',
          padding: '1.5rem',
          borderRadius: '16px',
          border: '1px solid rgba(102, 126, 234, 0.1)'
        }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
            <div>
              <strong style={{ color: '#374151' }}>Platform:</strong>
              <p style={{ margin: '0.25rem 0 0 0', color: '#6b7280' }}>Excel Analytics Platform</p>
            </div>
            <div>
              <strong style={{ color: '#374151' }}>Version:</strong>
              <p style={{ margin: '0.25rem 0 0 0', color: '#6b7280' }}>1.0.0</p>
            </div>
            <div>
              <strong style={{ color: '#374151' }}>Status:</strong>
              <p style={{ margin: '0.25rem 0 0 0', color: '#10b981' }}>🟢 Online</p>
            </div>
            <div>
              <strong style={{ color: '#374151' }}>Last Updated:</strong>
              <p style={{ margin: '0.25rem 0 0 0', color: '#6b7280' }}>{new Date().toLocaleDateString()}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard; 