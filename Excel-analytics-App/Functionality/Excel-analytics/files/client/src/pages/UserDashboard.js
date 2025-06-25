import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import Chart from 'chart.js/auto';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { saveAs } from 'file-saver';
import '../styles/Dashboard.css';
import * as THREE from 'three';
import { OrbitControls } from 'three-stdlib';

const BAR_COLORS = [
  0x4e79a7, 0xf28e2b, 0xe15759, 0x76b7b2, 0x59a14f,
  0xedc949, 0xaf7aa1, 0xff9da7, 0x9c755f, 0xbab0ab
];

function makeTextSprite(message, parameters = {}) {
  const fontface = parameters.fontface || 'Arial';
  const fontsize = parameters.fontsize || 32;
  const borderThickness = parameters.borderThickness || 2;
  const borderColor = parameters.borderColor || { r:0, g:0, b:0, a:1.0 };
  const backgroundColor = parameters.backgroundColor || { r:255, g:255, b:255, a:1.0 };
  const textColor = parameters.textColor || 'rgba(0,0,0,1.0)';
  const canvas = document.createElement('canvas');
  const context = canvas.getContext('2d');
  context.font = fontsize + 'px ' + fontface;
  const metrics = context.measureText(message);
  const textWidth = metrics.width;
  context.fillStyle = `rgba(${backgroundColor.r},${backgroundColor.g},${backgroundColor.b},${backgroundColor.a})`;
  context.fillRect(0, 0, textWidth + 18, fontsize + 18);
  context.strokeStyle = `rgba(${borderColor.r},${borderColor.g},${borderColor.b},${borderColor.a})`;
  context.lineWidth = borderThickness;
  context.strokeRect(0, 0, textWidth + 18, fontsize + 18);
  context.fillStyle = textColor;
  context.fillText(message, 9, fontsize + 9);
  const texture = new THREE.Texture(canvas);
  texture.needsUpdate = true;
  const spriteMaterial = new THREE.SpriteMaterial({ map: texture, transparent: true });
  const sprite = new THREE.Sprite(spriteMaterial);
  sprite.scale.set(textWidth / 8, fontsize / 8, 1);
  return sprite;
}

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
  const [showDownloadDropdown, setShowDownloadDropdown] = useState(false);
  const chartRef = useRef(null);
  const profileMenuRef = useRef(null);
  const [chartDimension, setChartDimension] = useState('2D');
  const threeContainerRef = useRef(null);
  let threeRenderer = null, threeScene = null, threeCamera = null;

  const pieColors = [
    '#4e79a7', '#f28e2b', '#e15759', '#76b7b2', '#59a14f',
    '#edc949', '#af7aa1', '#ff9da7', '#9c755f', '#bab0ab'
  ];

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

  // Helper to render 3D bar chart
  const render3DBarChart = (labels, values) => {
    if (!threeContainerRef.current) return;
    if (threeRenderer) {
      threeRenderer.dispose && threeRenderer.dispose();
      threeContainerRef.current.innerHTML = '';
    }
    threeScene = new THREE.Scene();
    threeCamera = new THREE.PerspectiveCamera(75, 600/350, 0.1, 1000);
    threeRenderer = new THREE.WebGLRenderer({ antialias: true });
    threeRenderer.setClearColor(0xffffff, 1); // White background
    threeRenderer.setSize(600, 350);
    threeContainerRef.current.appendChild(threeRenderer.domElement);
    // OrbitControls
    const controls = new OrbitControls(threeCamera, threeRenderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.1;
    controls.enablePan = false;
    controls.minDistance = 5;
    controls.maxDistance = 40;
    // Lighting
    const light = new THREE.DirectionalLight(0xffffff, 1);
    light.position.set(0, 10, 10);
    threeScene.add(light);
    // Bars with color palette
    const barWidth = 0.6, barDepth = 0.6, gap = 0.4;
    const maxVal = Math.max(...values, 1);
    labels.forEach((label, i) => {
      const height = (values[i] / maxVal) * 5 + 0.1;
      const geometry = new THREE.BoxGeometry(barWidth, height, barDepth);
      const material = new THREE.MeshPhongMaterial({ color: BAR_COLORS[i % BAR_COLORS.length] });
      const bar = new THREE.Mesh(geometry, material);
      bar.position.x = i * (barWidth + gap);
      bar.position.y = height / 2;
      threeScene.add(bar);
      // X axis label (under bar)
      const labelSprite = makeTextSprite(label, { fontsize: 36, textColor: 'rgba(0,0,0,1.0)', backgroundColor: { r:255, g:255, b:255, a:1.0 } });
      labelSprite.position.set(bar.position.x, -0.7, 0);
      labelSprite.center.set(0.5, 1);
      threeScene.add(labelSprite);
    });
    // Y axis label
    const yLabelSprite = makeTextSprite('Value', { fontsize: 48, textColor: 'rgba(0,0,0,1.0)', backgroundColor: { r:255, g:255, b:255, a:1.0 } });
    yLabelSprite.position.set(-1.8, 3, 0);
    yLabelSprite.center.set(0.5, 0.5);
    yLabelSprite.material.rotation = -Math.PI / 2;
    threeScene.add(yLabelSprite);
    // Add grid lines (Y axis)
    const gridLines = 5;
    for (let i = 0; i <= gridLines; i++) {
      const y = (i / gridLines) * 5;
      const gridMat = new THREE.LineBasicMaterial({ color: 0xcccccc });
      const gridGeo = new THREE.BufferGeometry().setFromPoints([
        new THREE.Vector3(-0.5, y, 0),
        new THREE.Vector3(labels.length * (0.6 + 0.4) - 0.4, y, 0)
      ]);
      const gridLine = new THREE.Line(gridGeo, gridMat);
      threeScene.add(gridLine);
    }
    // X axis base line
    const baseMat = new THREE.LineBasicMaterial({ color: 0x888888 });
    const baseGeo = new THREE.BufferGeometry().setFromPoints([
      new THREE.Vector3(-0.5, 0, 0),
      new THREE.Vector3(labels.length * (0.6 + 0.4) - 0.4, 0, 0)
    ]);
    const baseLine = new THREE.Line(baseGeo, baseMat);
    threeScene.add(baseLine);
    // Camera
    threeCamera.position.set(labels.length * 0.5, 5, 12);
    threeCamera.lookAt(labels.length * 0.5, 0, 0);
    // Animate
    function animate() {
      requestAnimationFrame(animate);
      controls.update();
      threeRenderer.render(threeScene, threeCamera);
    }
    animate();
  };

  // 3D Pie Chart
  const render3DPieChart = (labels, values) => {
    if (!threeContainerRef.current) return;
    if (threeRenderer) {
      threeRenderer.dispose && threeRenderer.dispose();
      threeContainerRef.current.innerHTML = '';
    }
    threeScene = new THREE.Scene();
    threeCamera = new THREE.PerspectiveCamera(75, 600/350, 0.1, 1000);
    threeRenderer = new THREE.WebGLRenderer({ antialias: true });
    threeRenderer.setClearColor(0xffffff, 1);
    threeRenderer.setSize(600, 350);
    threeContainerRef.current.appendChild(threeRenderer.domElement);
    const controls = new OrbitControls(threeCamera, threeRenderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.1;
    controls.enablePan = false;
    controls.minDistance = 5;
    controls.maxDistance = 40;
    const light = new THREE.DirectionalLight(0xffffff, 1);
    light.position.set(0, 10, 10);
    threeScene.add(light);
    // Pie slices
    const total = values.reduce((a, b) => a + b, 0) || 1;
    let startAngle = 0;
    const radius = 3;
    for (let i = 0; i < labels.length; i++) {
      const angle = (values[i] / total) * Math.PI * 2;
      const shape = new THREE.Shape();
      shape.moveTo(0, 0);
      shape.absarc(0, 0, radius, startAngle, startAngle + angle, false);
      shape.lineTo(0, 0);
      const geometry = new THREE.ExtrudeGeometry(shape, { depth: 0.7, bevelEnabled: false });
      const material = new THREE.MeshPhongMaterial({ color: BAR_COLORS[i % BAR_COLORS.length] });
      const mesh = new THREE.Mesh(geometry, material);
      mesh.rotation.x = -Math.PI / 2;
      threeScene.add(mesh);
      // Label
      const midAngle = startAngle + angle / 2;
      const labelSprite = makeTextSprite(labels[i], { fontsize: 28, textColor: 'rgba(0,0,0,1.0)', backgroundColor: { r:255, g:255, b:255, a:1.0 } });
      labelSprite.position.set(Math.cos(midAngle) * (radius + 0.7), 0.5, Math.sin(midAngle) * (radius + 0.7));
      threeScene.add(labelSprite);
      startAngle += angle;
    }
    threeCamera.position.set(0, 6, 7);
    threeCamera.lookAt(0, 0, 0);
    function animate() {
      requestAnimationFrame(animate);
      controls.update();
      threeRenderer.render(threeScene, threeCamera);
    }
    animate();
  };

  // 3D Doughnut Chart
  const render3DDoughnutChart = (labels, values) => {
    if (!threeContainerRef.current) return;
    if (threeRenderer) {
      threeRenderer.dispose && threeRenderer.dispose();
      threeContainerRef.current.innerHTML = '';
    }
    threeScene = new THREE.Scene();
    threeCamera = new THREE.PerspectiveCamera(75, 600/350, 0.1, 1000);
    threeRenderer = new THREE.WebGLRenderer({ antialias: true });
    threeRenderer.setClearColor(0xffffff, 1);
    threeRenderer.setSize(600, 350);
    threeContainerRef.current.appendChild(threeRenderer.domElement);
    const controls = new OrbitControls(threeCamera, threeRenderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.1;
    controls.enablePan = false;
    controls.minDistance = 5;
    controls.maxDistance = 40;
    const light = new THREE.DirectionalLight(0xffffff, 1);
    light.position.set(0, 10, 10);
    threeScene.add(light);
    // Doughnut segments
    const total = values.reduce((a, b) => a + b, 0) || 1;
    let startAngle = 0;
    const radius = 3, tube = 1.1;
    for (let i = 0; i < labels.length; i++) {
      const angle = (values[i] / total) * Math.PI * 2;
      const geometry = new THREE.TorusGeometry((radius + tube) / 2, (radius - tube) / 2, 32, 32, angle);
      const material = new THREE.MeshPhongMaterial({ color: BAR_COLORS[i % BAR_COLORS.length] });
      const mesh = new THREE.Mesh(geometry, material);
      mesh.rotation.x = -Math.PI / 2;
      mesh.rotation.z = startAngle;
      threeScene.add(mesh);
      // Label
      const midAngle = startAngle + angle / 2;
      const labelSprite = makeTextSprite(labels[i], { fontsize: 28, textColor: 'rgba(0,0,0,1.0)', backgroundColor: { r:255, g:255, b:255, a:1.0 } });
      labelSprite.position.set(Math.cos(midAngle) * (radius + 0.7), 0.5, Math.sin(midAngle) * (radius + 0.7));
      threeScene.add(labelSprite);
      startAngle += angle;
    }
    threeCamera.position.set(0, 6, 7);
    threeCamera.lookAt(0, 0, 0);
    function animate() {
      requestAnimationFrame(animate);
      controls.update();
      threeRenderer.render(threeScene, threeCamera);
    }
    animate();
  };

  // 3D Line Chart
  const render3DLineChart = (labels, values) => {
    if (!threeContainerRef.current) return;
    if (threeRenderer) {
      threeRenderer.dispose && threeRenderer.dispose();
      threeContainerRef.current.innerHTML = '';
    }
    threeScene = new THREE.Scene();
    threeCamera = new THREE.PerspectiveCamera(75, 600/350, 0.1, 1000);
    threeRenderer = new THREE.WebGLRenderer({ antialias: true });
    threeRenderer.setClearColor(0xffffff, 1);
    threeRenderer.setSize(600, 350);
    threeContainerRef.current.appendChild(threeRenderer.domElement);
    const controls = new OrbitControls(threeCamera, threeRenderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.1;
    controls.enablePan = false;
    controls.minDistance = 5;
    controls.maxDistance = 40;
    const light = new THREE.DirectionalLight(0xffffff, 1);
    light.position.set(0, 10, 10);
    threeScene.add(light);
    // Line
    const points = values.map((v, i) => new THREE.Vector3(i, (v / Math.max(...values, 1)) * 5, 0));
    const lineGeo = new THREE.BufferGeometry().setFromPoints(points);
    const lineMat = new THREE.LineBasicMaterial({ color: 0x3498db, linewidth: 3 });
    const line = new THREE.Line(lineGeo, lineMat);
    threeScene.add(line);
    // Dots
    points.forEach((pt, i) => {
      const dotGeo = new THREE.SphereGeometry(0.13, 16, 16);
      const dotMat = new THREE.MeshPhongMaterial({ color: BAR_COLORS[i % BAR_COLORS.length] });
      const dot = new THREE.Mesh(dotGeo, dotMat);
      dot.position.copy(pt);
      threeScene.add(dot);
      // X axis label
      const labelSprite = makeTextSprite(labels[i], { fontsize: 24, textColor: 'rgba(0,0,0,1.0)', backgroundColor: { r:255, g:255, b:255, a:1.0 } });
      labelSprite.position.set(pt.x, -0.7, 0);
      labelSprite.center.set(0.5, 1);
      threeScene.add(labelSprite);
    });
    // Y axis label
    const yLabelSprite = makeTextSprite('Value', { fontsize: 36, textColor: 'rgba(0,0,0,1.0)', backgroundColor: { r:255, g:255, b:255, a:1.0 } });
    yLabelSprite.position.set(-1.8, 3, 0);
    yLabelSprite.center.set(0.5, 0.5);
    yLabelSprite.material.rotation = -Math.PI / 2;
    threeScene.add(yLabelSprite);
    // Grid lines (Y)
    const gridLines = 5;
    for (let i = 0; i <= gridLines; i++) {
      const y = (i / gridLines) * 5;
      const gridMat = new THREE.LineBasicMaterial({ color: 0xcccccc });
      const gridGeo = new THREE.BufferGeometry().setFromPoints([
        new THREE.Vector3(-0.5, y, 0),
        new THREE.Vector3(labels.length - 0.5, y, 0)
      ]);
      const gridLine = new THREE.Line(gridGeo, gridMat);
      threeScene.add(gridLine);
    }
    // X axis base line
    const baseMat = new THREE.LineBasicMaterial({ color: 0x888888 });
    const baseGeo = new THREE.BufferGeometry().setFromPoints([
      new THREE.Vector3(-0.5, 0, 0),
      new THREE.Vector3(labels.length - 0.5, 0, 0)
    ]);
    const baseLine = new THREE.Line(baseGeo, baseMat);
    threeScene.add(baseLine);
    threeCamera.position.set(labels.length * 0.5, 5, 12);
    threeCamera.lookAt(labels.length * 0.5, 0, 0);
    function animate() {
      requestAnimationFrame(animate);
      controls.update();
      threeRenderer.render(threeScene, threeCamera);
    }
    animate();
  };

  // Update useEffect to render correct 3D chart type
  useEffect(() => {
    if (chartDimension === '3D' && currentAnalysis && xAxis && yAxis) {
      const labels = currentAnalysis.data.map(row => row[xAxis]);
      const values = currentAnalysis.data.map(row => {
        const value = row[yAxis];
        return typeof value === 'number' ? value : parseFloat(value) || 0;
      });
      if (chartType === 'bar') render3DBarChart(labels, values);
      else if (chartType === 'pie') render3DPieChart(labels, values);
      else if (chartType === 'doughnut') render3DDoughnutChart(labels, values);
      else if (chartType === 'line') render3DLineChart(labels, values);
    }
    // Cleanup on unmount
    return () => {
      if (threeRenderer && threeRenderer.dispose) threeRenderer.dispose();
      if (threeContainerRef.current) threeContainerRef.current.innerHTML = '';
    };
    // eslint-disable-next-line
  }, [chartDimension, chartType, currentAnalysis, xAxis, yAxis]);

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
          backgroundColor: chartType === 'pie' || chartType === 'doughnut'
            ? labels.map((_, i) => pieColors[i % pieColors.length])
            : 'rgba(102, 126, 234, 0.6)',
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

  const downloadChartAsPNG = async () => {
    const canvasElement = document.getElementById('analysisChart');
    if (!canvasElement) return;
    try {
      const canvas = await html2canvas(canvasElement);
      canvas.toBlob(blob => {
        if (blob) {
          saveAs(blob, 'chart.png');
        }
      });
    } catch (error) {
      console.error('Error downloading chart as PNG:', error);
    }
  };

  const downloadChartAsPDF = async () => {
    const canvasElement = document.getElementById('analysisChart');
    if (!canvasElement) return;
    try {
      const canvas = await html2canvas(canvasElement);
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF();
      pdf.addImage(imgData, 'PNG', 10, 10, 180, 100);
      pdf.save('chart.pdf');
    } catch (error) {
      console.error('Error downloading chart as PDF:', error);
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
            <div className="config-group">
              <label className="config-label">Chart Dimension:</label>
              <select
                value={chartDimension}
                onChange={e => setChartDimension(e.target.value)}
                className="dashboard-select"
              >
                <option value="2D">2D</option>
                <option value="3D">3D</option>
              </select>
            </div>
          </div>
          <div className="action-buttons">
            <button onClick={saveAnalysis} className="dashboard-button">Save Analysis</button>
            <div style={{ position: 'relative', display: 'inline-block' }}>
              <button
                onClick={() => setShowDownloadDropdown(v => !v)}
                className="dashboard-button secondary"
                type="button"
              >
                Download ▼
              </button>
              {showDownloadDropdown && (
                <div style={{
                  position: 'absolute',
                  top: '100%',
                  left: 0,
                  background: '#fff',
                  border: '1px solid #ddd',
                  borderRadius: 6,
                  boxShadow: '0 2px 8px rgba(0,0,0,0.07)',
                  zIndex: 100,
                  minWidth: 140
                }}>
                  <button
                    className="dashboard-button secondary"
                    style={{ width: '100%', border: 'none', borderRadius: 0, textAlign: 'left', padding: '0.7rem 1rem' }}
                    onClick={() => { downloadChartAsPNG(); setShowDownloadDropdown(false); }}
                  >
                    Download as PNG
                  </button>
                  <button
                    className="dashboard-button secondary"
                    style={{ width: '100%', border: 'none', borderRadius: 0, textAlign: 'left', padding: '0.7rem 1rem' }}
                    onClick={() => { downloadChartAsPDF(); setShowDownloadDropdown(false); }}
                  >
                    Download as PDF
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Chart Display */}
      {currentAnalysis && xAxis && yAxis && (
        <div className="dashboard-section">
          <h2 className="section-title">Data Visualization</h2>
          {chartDimension === '2D' ? (
            <div className="chart-container">
              <canvas id="analysisChart"></canvas>
            </div>
          ) : (
            <div ref={threeContainerRef} style={{ width: 600, height: 350, margin: '0 auto' }}></div>
          )}
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