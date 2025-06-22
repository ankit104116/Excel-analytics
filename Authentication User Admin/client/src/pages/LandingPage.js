import React from 'react';
import { Link } from 'react-router-dom';
import '../styles/LandingPage.css';

const features = [
  {
    title: 'Upload Excel Files',
    desc: 'Easily upload your Excel spreadsheets.'
  },
  {
    title: 'Interactive Charts',
    desc: 'Visualize your data with 2D & 3D charts.'
  },
  {
    title: 'Custom Data Mapping',
    desc: 'Choose X and Y axes for your analysis.'
  },
  {
    title: 'Downloadable Reports',
    desc: 'Export your charts as PNG or PDF.'
  },
  {
    title: 'Personal Dashboard',
    desc: 'View your upload & analysis history.'
  },
  {
    title: 'Secure Login',
    desc: 'Your data and privacy are protected.'
  }
];

const LandingPage = () => (
  <div className="landing-bg">
    {/* Navbar */}
    <nav className="landing-navbar">
      <div className="landing-logo">Excel Analytics Platform</div>
      <div className="landing-nav-links">
        <Link to="/login" className="landing-nav-btn">Login</Link>
        <Link to="/signup" className="landing-nav-btn primary">Sign Up</Link>
      </div>
    </nav>

    {/* Main Content */}
    <main className="landing-main">
      <section className="landing-header">
        <h1>Excel Analytics Platform</h1>
        <p className="landing-desc">
          Effortlessly upload, analyze, and visualize your Excel data with interactive charts and smart insights. Enjoy a secure, modern dashboard experience designed for you.
        </p>
      </section>

      <section className="landing-section features">
        <h2>Key Features</h2>
        <div className="features-grid">
          {features.map((feature, idx) => (
            <div className="feature-card" key={idx}>
              <div className="feature-title">{feature.title}</div>
              <div className="feature-desc">{feature.desc}</div>
            </div>
          ))}
        </div>
      </section>
    </main>

    <footer className="landing-footer">
      <Link to="/admin-login" className="landing-admin-link">Admin Login</Link>
      &copy; {new Date().getFullYear()} Excel Analytics Platform
    </footer>
  </div>
);

export default LandingPage; 