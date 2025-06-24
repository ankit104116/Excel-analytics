import React, { useState, useEffect, useRef } from 'react';
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
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const profileMenuRef = useRef(null);
  const [users, setUsers] = useState([]);
  const [usersLoading, setUsersLoading] = useState(false);
  const [usersError, setUsersError] = useState('');
  const [showAnalytics, setShowAnalytics] = useState(false);
  const [analyticsSummary, setAnalyticsSummary] = useState(null);
  const [analyticsPerformance, setAnalyticsPerformance] = useState(null);
  const [analyticsLoading, setAnalyticsLoading] = useState(false);
  const [analyticsError, setAnalyticsError] = useState('');

  // Fetch real stats for System Overview
  const fetchSystemOverview = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5001/api/admin/analytics/summary', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        setStats({
          totalUsers: data.totalUsers,
          recentUploads: data.totalFiles
        });
      }
    } catch (err) {
      // Optionally handle error
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSystemOverview();
  }, []);

  // Close profile menu on outside click
  useEffect(() => {
    function handleClickOutside(event) {
      if (profileMenuRef.current && !profileMenuRef.current.contains(event.target)) {
        setProfileMenuOpen(false);
      }
    }
    if (profileMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    } else {
      document.removeEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [profileMenuOpen]);

  const handleLogout = () => {
    localStorage.removeItem('isAdmin');
    navigate('/admin-login');
  };

  // Fetch users for User Management
  const fetchUsers = async () => {
    setUsersLoading(true);
    setUsersError('');
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5001/api/admin/users', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        setUsers(data);
      } else {
        setUsersError('Failed to fetch users');
      }
    } catch (err) {
      setUsersError('Failed to fetch users');
    } finally {
      setUsersLoading(false);
    }
  };

  // Only fetch users when User Management is opened
  const [showUserManagement, setShowUserManagement] = useState(false);
  const handleUserManagement = () => {
    setShowUserManagement(true);
    fetchUsers();
  };
  const handleCloseUserManagement = () => setShowUserManagement(false);

  const handleSystemSettings = () => {
    // TODO: Implement system settings
    alert('System settings feature coming soon!');
  };

  const handleAnalytics = () => {
    setShowAnalytics(true);
    fetchAnalytics();
  };
  const handleCloseAnalytics = () => setShowAnalytics(false);

  const fetchAnalytics = async () => {
    setAnalyticsLoading(true);
    setAnalyticsError('');
    try {
      const token = localStorage.getItem('token');
      const [summaryRes, perfRes] = await Promise.all([
        fetch('http://localhost:5001/api/admin/analytics/summary', { headers: { 'Authorization': `Bearer ${token}` } }),
        fetch('http://localhost:5001/api/admin/analytics/performance', { headers: { 'Authorization': `Bearer ${token}` } })
      ]);
      const summary = await summaryRes.json();
      const perf = await perfRes.json();
      if (!summaryRes.ok || !perfRes.ok) throw new Error('Failed to fetch analytics');
      setAnalyticsSummary(summary);
      setAnalyticsPerformance(perf);
    } catch (err) {
      setAnalyticsError('Failed to fetch analytics');
    } finally {
      setAnalyticsLoading(false);
    }
  };

  return (
    <div className="dashboard-container">
      {/* Header Bar */}
      <div className="dashboard-nav">
        <div>
          <h1 className="dashboard-title">Admin Dashboard</h1>
          <p className="dashboard-subtitle">System Administration & Analytics</p>
        </div>
        <div className="profile-menu-wrapper" ref={profileMenuRef}>
          <button className="profile-icon-btn" onClick={() => setProfileMenuOpen(v => !v)} aria-label="Profile menu">
            {/* Simple SVG profile icon */}
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="8" r="4"/><path d="M21 20c0-2.8-4-5-9-5s-9 2.2-9 5"/></svg>
          </button>
          {profileMenuOpen && (
            <div className="profile-dropdown">
              <button onClick={handleLogout} className="profile-dropdown-item logout">
                Logout
              </button>
            </div>
          )}
        </div>
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

      {/* User Management Modal/Section */}
      {showUserManagement && (
        <div className="dashboard-section" style={{ position: 'relative', zIndex: 10, marginTop: '2rem' }}>
          <h2 className="section-title">User Management</h2>
          <button onClick={handleCloseUserManagement} className="dashboard-button danger" style={{ position: 'absolute', top: 20, right: 20 }}>Close</button>
          {usersLoading ? (
            <div style={{ textAlign: 'center', padding: '2rem' }}>
              <div className="loading-spinner" style={{ width: '40px', height: '40px', margin: '0 auto' }}></div>
              <p style={{ marginTop: '1rem', color: '#6b7280' }}>Loading users...</p>
            </div>
          ) : usersError ? (
            <div className="message error">{usersError}</div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table className="dashboard-table">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Role</th>
                    <th>Registered</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map(user => (
                    <tr key={user.id}>
                      <td>{user.name}</td>
                      <td>{user.email}</td>
                      <td>{user.role}</td>
                      <td>{new Date(user.createdAt).toLocaleDateString()}</td>
                      <td>
                        {/* Future: Role/status controls go here */}
                        <span style={{ color: '#aaa' }}>Coming soon</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Analytics Dashboard Modal/Section */}
      {showAnalytics && (
        <div className="dashboard-section" style={{ position: 'relative', zIndex: 10, marginTop: '2rem' }}>
          <h2 className="section-title">Analytics Dashboard</h2>
          <button onClick={handleCloseAnalytics} className="dashboard-button danger" style={{ position: 'absolute', top: 20, right: 20 }}>Close</button>
          {analyticsLoading ? (
            <div style={{ textAlign: 'center', padding: '2rem' }}>
              <div className="loading-spinner" style={{ width: '40px', height: '40px', margin: '0 auto' }}></div>
              <p style={{ marginTop: '1rem', color: '#6b7280' }}>Loading analytics...</p>
            </div>
          ) : analyticsError ? (
            <div className="message error">{analyticsError}</div>
          ) : analyticsSummary && analyticsPerformance ? (
            <>
              <div className="dashboard-stats" style={{ marginBottom: '2rem' }}>
                <div className="stat-card">
                  <div className="stat-number">{analyticsSummary.totalUsers}</div>
                  <div className="stat-label">Total Users</div>
                </div>
                <div className="stat-card">
                  <div className="stat-number">{analyticsSummary.activeUsers}</div>
                  <div className="stat-label">Active Users (24h)</div>
                </div>
                <div className="stat-card">
                  <div className="stat-number">{analyticsSummary.totalFiles}</div>
                  <div className="stat-label">Files Uploaded</div>
                </div>
              </div>
              <h3 style={{ marginTop: '2rem', marginBottom: '1rem', color: '#3498db' }}>API Response Times (ms)</h3>
              <table className="dashboard-table">
                <thead>
                  <tr>
                    <th>Endpoint</th>
                    <th>Avg. Response Time (ms)</th>
                  </tr>
                </thead>
                <tbody>
                  {Object.entries(analyticsPerformance).map(([endpoint, ms]) => (
                    <tr key={endpoint}>
                      <td>{endpoint}</td>
                      <td>{ms !== null ? ms : 'N/A'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </>
          ) : null}
        </div>
      )}

      {/* Quick Actions */}
      <div className="dashboard-section">
        <h2 className="section-title">Quick Actions</h2>
        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
          <button 
            style={{
              background: '#374151',
              color: 'white',
              border: 'none',
              padding: '0.75rem 1.5rem',
              borderRadius: '12px',
              fontSize: '1rem',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              boxShadow: '0 4px 15px rgba(55, 65, 81, 0.3)'
            }}
            onClick={() => window.open('http://localhost:5001/api/test', '_blank')}
          >
            API Status
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