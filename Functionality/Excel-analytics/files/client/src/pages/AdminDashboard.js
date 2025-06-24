import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/Dashboard.css';
import Chart from 'chart.js/auto';

const user = JSON.parse(localStorage.getItem('user') || '{}');

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
  const [selectedUserReports, setSelectedUserReports] = useState(null);
  const [selectedUserActivity, setSelectedUserActivity] = useState(null);
  const [showReportsModal, setShowReportsModal] = useState(false);
  const [showActivityModal, setShowActivityModal] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [toggleRoleLoading, setToggleRoleLoading] = useState({});
  const [roleMessage, setRoleMessage] = useState(null);
  const currentAdminEmail = user?.email;
  const [signupsChart, setSignupsChart] = useState(null);
  const [signupsData, setSignupsData] = useState(null);
  const signupsChartRef = useRef(null);

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

  const fetchSignupsAnalytics = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('http://localhost:5001/api/admin/analytics/signups', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      setSignupsData(data);
    } catch (err) {
      setSignupsData(null);
    }
  };

  useEffect(() => {
    if (showAnalytics) {
      fetchSignupsAnalytics();
    }
  }, [showAnalytics]);

  useEffect(() => {
    if (signupsData && signupsChartRef.current) {
      if (signupsChart) signupsChart.destroy();
      const ctx = signupsChartRef.current.getContext('2d');
      setSignupsChart(new Chart(ctx, {
        type: 'line',
        data: {
          labels: signupsData.labels,
          datasets: [{
            label: 'User Signups (last 30 days)',
            data: signupsData.data,
            fill: true,
            backgroundColor: 'rgba(52, 152, 219, 0.1)',
            borderColor: '#3498db',
            tension: 0.3,
            pointRadius: 3,
          }]
        },
        options: {
          responsive: true,
          plugins: {
            legend: { display: false },
            title: { display: false }
          },
          scales: {
            x: { title: { display: true, text: 'Date' } },
            y: { title: { display: true, text: 'Signups' }, beginAtZero: true }
          }
        }
      }));
    }
    // Cleanup on unmount
    return () => { if (signupsChart) signupsChart.destroy(); };
    // eslint-disable-next-line
  }, [signupsData]);

  // Handler to view reports
  const handleViewReports = async (user) => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`http://localhost:5001/api/admin/user/${user._id}/reports`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      let reports = await res.json();
      if (!Array.isArray(reports)) reports = [];
      setSelectedUserReports({ user, reports });
      setShowReportsModal(true);
    } catch (err) {
      setSelectedUserReports({ user, reports: [], error: 'Failed to fetch reports' });
      setShowReportsModal(true);
    }
  };

  // Handler to view activity log
  const handleViewActivity = async (user) => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`http://localhost:5001/api/admin/user/${user._id}/activity`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      let activity = await res.json();
      if (!Array.isArray(activity)) activity = [];
      setSelectedUserActivity({ user, activity });
      setShowActivityModal(true);
    } catch (err) {
      setSelectedUserActivity({ user, activity: [], error: 'Failed to fetch activity' });
      setShowActivityModal(true);
    }
  };

  // Handler to toggle role
  const handleToggleRole = async (user) => {
    if (user.email === currentAdminEmail && user.role === 'admin') {
      setRoleMessage({ type: 'error', text: "You can't demote yourself." });
      setTimeout(() => setRoleMessage(null), 3000);
      return;
    }
    setToggleRoleLoading(l => ({ ...l, [user._id]: true }));
    try {
      const token = localStorage.getItem('token');
      const newRole = user.role === 'admin' ? 'user' : 'admin';
      const res = await fetch(`http://localhost:5001/api/admin/user/${user._id}/role`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ role: newRole })
      });
      if (res.ok) {
        setUsers(users => users.map(u => u._id === user._id ? { ...u, role: newRole } : u));
        setRoleMessage({ type: 'success', text: `Role updated to ${newRole} for ${user.email}` });
      } else {
        setRoleMessage({ type: 'error', text: 'Failed to update role.' });
      }
    } catch (err) {
      setRoleMessage({ type: 'error', text: 'Failed to update role.' });
    }
    setToggleRoleLoading(l => ({ ...l, [user._id]: false }));
    setTimeout(() => setRoleMessage(null), 3000);
  };

  // Handler to export user data
  const handleExportUsers = async () => {
    setExporting(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('http://localhost:5001/api/admin/users', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const usersData = await res.json();
      // Convert to CSV
      const csv = [
        ['Name', 'Email', 'Role', 'Registered'],
        ...usersData.map(u => [u.name, u.email, u.role, new Date(u.createdAt).toLocaleDateString()])
      ].map(row => row.join(',')).join('\n');
      // Download CSV
      const blob = new Blob([csv], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'users.csv';
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      // Optionally show error
    }
    setExporting(false);
  };

  // Handler to delete user
  const handleDeleteUser = async (user) => {
    if (!window.confirm(`Are you sure you want to delete user ${user.email}?`)) return;
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`http://localhost:5001/api/admin/user/${user._id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        setUsers(users => users.filter(u => u._id !== user._id));
      }
    } catch (err) {
      // Optionally show error
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
          {roleMessage && (
            <div className={`message ${roleMessage.type}`}>{roleMessage.text}</div>
          )}
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
                    <tr key={user._id}>
                      <td>{user.name}</td>
                      <td>{user.email}</td>
                      <td>{user.role}</td>
                      <td>{new Date(user.createdAt).toLocaleDateString()}</td>
                      <td>
                        <button className="dashboard-button secondary" onClick={() => handleViewReports(user)}>View Reports</button>
                        <button
                          className="dashboard-button"
                          onClick={() => handleToggleRole(user)}
                          disabled={toggleRoleLoading[user._id]}
                        >
                          {toggleRoleLoading[user._id]
                            ? 'Updating...'
                            : user.role === 'admin' ? 'Make User' : 'Make Admin'}
                        </button>
                        <button className="dashboard-button secondary" onClick={() => handleViewActivity(user)}>Activity Log</button>
                        <button className="dashboard-button secondary" onClick={handleExportUsers} disabled={exporting}>
                          Export
                        </button>
                        <button className="dashboard-button danger" onClick={() => handleDeleteUser(user)}>
                          Delete
                        </button>
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
              {/* User Signups Chart */}
              <div style={{ background: '#fff', borderRadius: 12, boxShadow: '0 2px 12px rgba(52,152,219,0.07)', padding: 24, marginBottom: 32 }}>
                <h3 style={{ color: '#3498db', marginBottom: 16 }}>User Signups (Last 30 Days)</h3>
                <canvas ref={signupsChartRef} height={120}></canvas>
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

      {/* Reports Modal */}
      {showReportsModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3>Reports for {selectedUserReports.user.name}</h3>
            {selectedUserReports.error ? (
              <div className="message error">{selectedUserReports.error}</div>
            ) : Array.isArray(selectedUserReports.reports) && selectedUserReports.reports.length === 0 ? (
              <div>No reports found.</div>
            ) : Array.isArray(selectedUserReports.reports) ? (
              <ul>
                {selectedUserReports.reports.map(r => (
                  <li key={r._id}>{r.fileName} ({r.chartType}) - {new Date(r.createdAt).toLocaleString()}</li>
                ))}
              </ul>
            ) : (
              <div className="message error">Invalid reports data.</div>
            )}
            <button onClick={() => setShowReportsModal(false)} className="dashboard-button danger">Close</button>
          </div>
        </div>
      )}

      {/* Activity Modal */}
      {showActivityModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3>Activity Log for {selectedUserActivity.user.name}</h3>
            {selectedUserActivity.error ? (
              <div className="message error">{selectedUserActivity.error}</div>
            ) : Array.isArray(selectedUserActivity.activity) && selectedUserActivity.activity.length === 0 ? (
              <div>No activity found.</div>
            ) : Array.isArray(selectedUserActivity.activity) ? (
              <ul>
                {selectedUserActivity.activity.map(a => (
                  <li key={a._id}>{a.fileName} ({a.chartType}) - {new Date(a.createdAt).toLocaleString()}</li>
                ))}
              </ul>
            ) : (
              <div className="message error">Invalid activity data.</div>
            )}
            <button onClick={() => setShowActivityModal(false)} className="dashboard-button danger">Close</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard; 