import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import Chart from 'chart.js/auto';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { saveAs } from 'file-saver';
import '../styles/Dashboard.css';

const UserDashboard = () => {
  const { logout, user } = useAuth();
  const navigate = useNavigate();
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [uploadMessage, setUploadMessage] = useState('');
  const [analysisHistory, setAnalysisHistory] = useState([]);
  const [currentAnalysis, setCurrentAnalysis] = useState(null);
  const [xAxis, setXAxis] = useState('');
  const [yAxis, setYAxis] = useState('');
  const [chartType, setChartType] = useState('bar');
  const [columns, setColumns] = useState([]);
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const chartRef = useRef(null);
  const profileMenuRef = useRef(null);

  // Fetch analysis history on component mount
  useEffect(() => {
    fetchAnalysisHistory();
  }, []);

  // Update chart when analysis data changes
  useEffect(() => {
    if (currentAnalysis && xAxis && yAxis) {
      createChart();
    }
  }, [currentAnalysis, xAxis, yAxis, chartType]);

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

  const fetchAnalysisHistory = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5001/api/history', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      if (response.ok) {
        const data = await response.json();
        setAnalysisHistory(data);
      }
    } catch (error) {
      console.error('Error fetching history:', error);
    }
  };

  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    if (file && (file.type === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' || 
                 file.type === 'application/vnd.ms-excel')) {
      setSelectedFile(file);
      setUploadMessage('');
    } else {
      setUploadMessage('Please select a valid Excel file (.xlsx or .xls)');
    }
  };

  const handleFileUpload = async () => {
    if (!selectedFile) {
      setUploadMessage('Please select a file first');
      return;
    }

    setUploading(true);
    setUploadMessage('');

    const formData = new FormData();
    formData.append('file', selectedFile);

    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5001/api/upload', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formData,
      });

      const data = await response.json();

      if (response.ok) {
        setUploadMessage('File uploaded successfully!');
        setCurrentAnalysis(data);
        
        // Extract column names from the first row of data
        if (data.data && data.data.length > 0) {
          const firstRow = data.data[0];
          setColumns(Object.keys(firstRow));
          setXAxis(Object.keys(firstRow)[0]);
          setYAxis(Object.keys(firstRow)[1] || Object.keys(firstRow)[0]);
        }
        
        // Refresh analysis history
        fetchAnalysisHistory();
      } else {
        setUploadMessage(data.message || 'Upload failed');
      }
    } catch (error) {
      setUploadMessage('Error uploading file');
      console.error('Upload error:', error);
    } finally {
      setUploading(false);
    }
  };

  const createChart = () => {
    if (!currentAnalysis || !xAxis || !yAxis) return;

    const ctx = document.getElementById('analysisChart');
    if (!ctx) return;

    // Destroy existing chart
    if (chartRef.current) {
      chartRef.current.destroy();
    }

    // Prepare data for chart
    const labels = currentAnalysis.data.map(row => row[xAxis]);
    const values = currentAnalysis.data.map(row => {
      const value = row[yAxis];
      return typeof value === 'number' ? value : parseFloat(value) || 0;
    });

    // Create new chart
    chartRef.current = new Chart(ctx, {
      type: chartType,
      data: {
        labels: labels,
        datasets: [{
          label: yAxis,
          data: values,
          backgroundColor: 'rgba(102, 126, 234, 0.6)',
          borderColor: 'rgba(102, 126, 234, 1)',
          borderWidth: 2,
          borderRadius: 8,
          borderSkipped: false,
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          title: {
            display: true,
            text: `${yAxis} vs ${xAxis}`,
            font: {
              size: 18,
              weight: 'bold'
            },
            color: '#1f2937'
          },
          legend: {
            display: true,
            position: 'top',
            labels: {
              usePointStyle: true,
              padding: 20
            }
          }
        },
        scales: {
          y: {
            beginAtZero: true,
            grid: {
              color: 'rgba(0, 0, 0, 0.1)'
            }
          },
          x: {
            grid: {
              color: 'rgba(0, 0, 0, 0.1)'
            }
          }
        }
      }
    });
  };

  const saveAnalysis = async () => {
    if (!currentAnalysis || !xAxis || !yAxis) return;

    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5001/api/analysis', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          analysisId: currentAnalysis.analysisId,
          xAxis,
          yAxis,
          chartType
        }),
      });

      if (response.ok) {
        setUploadMessage('Analysis saved successfully!');
        fetchAnalysisHistory();
      }
    } catch (error) {
      console.error('Error saving analysis:', error);
    }
  };

  const downloadChart = async () => {
    const canvasElement = document.getElementById('analysisChart');
    if (!canvasElement) return;

    try {
      const canvas = await html2canvas(canvasElement);
      
      // Download as PNG
      canvas.toBlob(blob => {
        if (blob) {
          saveAs(blob, 'chart.png');
        }
      });

      // Download as PDF
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF();
      pdf.addImage(imgData, 'PNG', 10, 10, 180, 100);
      pdf.save('chart.pdf');
    } catch (error) {
      console.error('Error downloading chart:', error);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="dashboard-container">
      {/* Header Bar */}
      <div className="dashboard-nav">
        <div>
          <h1 className="dashboard-title">Excel Analytics Dashboard</h1>
          <p className="dashboard-subtitle">Welcome back, {user?.name}!</p>
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

      {/* Upload Section */}
      <div className="dashboard-section upload-section">
        <h2 className="section-title">Upload Your Excel File Here</h2>
        <div className="upload-form">
          <label className="choose-file-label">
            <input
              type="file"
              accept=".xlsx,.xls"
              onChange={handleFileSelect}
              className="file-input"
              style={{ display: 'none' }}
            />
            <span className="dashboard-button secondary">Choose File</span>
          </label>
          {selectedFile && (
            <span className="selected-file-name">{selectedFile.name}</span>
          )}
          {selectedFile && (
            <button
              onClick={handleFileUpload}
              disabled={uploading}
              className="dashboard-button"
            >
              {uploading ? (
                <>
                  <span className="loading-spinner"></span>
                  Uploading...
                </>
              ) : (
                'Upload'
              )}
            </button>
          )}
        </div>
        {uploadMessage && (
          <div className={`message ${uploadMessage.includes('success') ? 'success' : 'error'}`}>
            {uploadMessage}
          </div>
        )}
      </div>

      {/* Analysis Configuration */}
      {currentAnalysis && (
        <div className="dashboard-section">
          <h2 className="section-title">Configure Analysis</h2>
          <div className="config-grid">
            <div className="config-group">
              <label className="config-label">X Axis:</label>
              <select 
                value={xAxis} 
                onChange={(e) => setXAxis(e.target.value)}
                className="dashboard-select"
              >
                {columns.map(col => (
                  <option key={col} value={col}>{col}</option>
                ))}
              </select>
            </div>
            <div className="config-group">
              <label className="config-label">Y Axis:</label>
              <select 
                value={yAxis} 
                onChange={(e) => setYAxis(e.target.value)}
                className="dashboard-select"
              >
                {columns.map(col => (
                  <option key={col} value={col}>{col}</option>
                ))}
              </select>
            </div>
            <div className="config-group">
              <label className="config-label">Chart Type:</label>
              <select 
                value={chartType} 
                onChange={(e) => setChartType(e.target.value)}
                className="dashboard-select"
              >
                <option value="bar">Bar Chart</option>
                <option value="line">Line Chart</option>
                <option value="pie">Pie Chart</option>
                <option value="doughnut">Doughnut Chart</option>
              </select>
            </div>
          </div>
          <div className="action-buttons">
            <button onClick={saveAnalysis} className="dashboard-button">Save Analysis</button>
            <button onClick={downloadChart} className="dashboard-button secondary">Download Chart</button>
          </div>
        </div>
      )}

      {/* Chart Display */}
      {currentAnalysis && xAxis && yAxis && (
        <div className="dashboard-section">
          <h2 className="section-title">Data Visualization</h2>
          <div className="chart-container">
            <canvas id="analysisChart"></canvas>
          </div>
        </div>
      )}

      {/* Analysis History */}
      <div className="dashboard-section">
        <h2 className="section-title">Analysis History</h2>
        {analysisHistory.length > 0 ? (
          <div style={{ overflowX: 'auto' }}>
            <table className="history-table">
              <thead>
                <tr>
                  <th>File Name</th>
                  <th>X Axis</th>
                  <th>Y Axis</th>
                  <th>Chart Type</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                {analysisHistory.map((analysis, index) => (
                  <tr key={index}>
                    <td>{analysis.fileName}</td>
                    <td>{analysis.xAxis || 'Not set'}</td>
                    <td>{analysis.yAxis || 'Not set'}</td>
                    <td>{analysis.chartType || 'Not set'}</td>
                    <td>
                      {new Date(analysis.createdAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="empty-state">
            No analysis history yet. Upload an Excel file to get started!
          </div>
        )}
      </div>
    </div>
  );
};

export default UserDashboard; 