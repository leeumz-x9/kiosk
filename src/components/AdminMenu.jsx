import React, { useState, useEffect } from 'react';
import AdminDashboard from './AdminDashboard';
import './AdminMenu.css';

const AdminMenu = ({ onNavigate }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [adminCode, setAdminCode] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [showDashboard, setShowDashboard] = useState(false);
  const [currentTheme, setCurrentTheme] = useState('cyberpunk');

  // Simple admin passcode (change this to something secure)
  const ADMIN_PASSCODE = '2025';

  // Load theme on mount
  useEffect(() => {
    const savedTheme = localStorage.getItem('kioskTheme') || 'cyberpunk';
    setCurrentTheme(savedTheme);
    applyTheme(savedTheme);
  }, []);

  const themes = {
    cyberpunk: {
      name: '🌃 Cyberpunk',
      colors: {
        '--primary-green': '#00FF41',
        '--primary-yellow': '#39FF14',
        '--primary-blue': '#00FFFF',
        '--accent-red': '#FF0080',
        '--bg-dark': '#000000',
        '--bg-card': '#0A0A0A',
      }
    },
    ocean: {
      name: '🌊 Ocean',
      colors: {
        '--primary-green': '#00D9FF',
        '--primary-yellow': '#1E90FF',
        '--primary-blue': '#4169E1',
        '--accent-red': '#FF6B9D',
        '--bg-dark': '#001B2E',
        '--bg-card': '#003459',
      }
    },
    sunset: {
      name: '🌅 Sunset',
      colors: {
        '--primary-green': '#FF6B35',
        '--primary-yellow': '#FFB347',
        '--primary-blue': '#FF1744',
        '--accent-red': '#D32F2F',
        '--bg-dark': '#1A0F0A',
        '--bg-card': '#3D1F1F',
      }
    },
    purple: {
      name: '💜 Purple Dream',
      colors: {
        '--primary-green': '#D946EF',
        '--primary-yellow': '#F0ABFC',
        '--primary-blue': '#C026D3',
        '--accent-red': '#EC4899',
        '--bg-dark': '#1A0A1F',
        '--bg-card': '#2D1B3D',
      }
    }
  };

  const applyTheme = (themeName) => {
    const theme = themes[themeName];
    if (!theme) return;
    
    const root = document.documentElement;
    Object.entries(theme.colors).forEach(([key, value]) => {
      root.style.setProperty(key, value);
    });
    
    localStorage.setItem('kioskTheme', themeName);
  };

  const handleAdminAccess = () => {
    if (adminCode === ADMIN_PASSCODE) {
      setIsAuthenticated(true);
      setAdminCode('');
      // Don't close menu - keep it open
    } else {
      alert('❌ รหัสผ่านไม่ถูกต้อง');
      setAdminCode('');
    }
  };

  const handleMenuClick = (page) => {
    setIsOpen(false);
    onNavigate(page);
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setIsOpen(false);
  };

  return (
    <>
      {/* Admin Toggle Button (Corner) */}
      <button
        className="admin-toggle-btn"
        onClick={() => setIsOpen(!isOpen)}
        title="Admin Panel"
      >
        {isAuthenticated ? '👨‍💼' : '⚙️'}
      </button>

      {/* Admin Menu Popup */}
      {isOpen && (
        <div
          className="admin-menu-backdrop"
          onClick={() => setIsOpen(false)}
        >
          <div
            className="admin-menu-popup"
            onClick={(e) => e.stopPropagation()}
          >
              {!isAuthenticated ? (
                // Login Form
                <div className="admin-login">
                  <h2>🔐 Admin Access</h2>
                  <p>กรุณากรอกรหัสผ่านเพื่อเข้าสู่แอดมิน</p>
                  
                  <input
                    type="password"
                    placeholder="Enter Admin Code"
                    value={adminCode}
                    onChange={(e) => setAdminCode(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleAdminAccess()}
                    autoFocus
                    className="admin-input"
                  />
                  
                  <button 
                    className="btn-admin"
                    onClick={handleAdminAccess}
                  >
                    เข้าสู่ระบบ
                  </button>
                  
                  <button 
                    className="btn-close"
                    onClick={() => setIsOpen(false)}
                  >
                    ยกเลิก
                  </button>

                  <div className="admin-hint">
                    <p>💡 Hint: Enter the year Lanna Polythentic was founded</p>
                  </div>
                </div>
              ) : (
                // Admin Menu Options
                <div className="admin-menu-content">
                  <div className="admin-header">
                    <h2>📊 Admin Dashboard</h2>
                    <p>Select what you want to view</p>
                  </div>

                  <div className="admin-menu-items">
                    <button
                      className="menu-item analytics"
                      onClick={() => {
                        setIsOpen(false);
                        setShowDashboard(true);
                      }}
                    >
                      <span className="menu-icon">📋</span>
                      <div className="menu-text">
                        <h3>Admin Dashboard</h3>
                        <p>จัดการทุกอย่างที่นี่</p>
                      </div>
                      <span className="menu-arrow">→</span>
                    </button>

                    <button
                      className="menu-item careers"
                      onClick={() => handleMenuClick('home')}
                    >
                      <span className="menu-icon">🎓</span>
                      <div className="menu-text">
                        <h3>Back to Kiosk</h3>
                        <p>Return to main application</p>
                      </div>
                      <span className="menu-arrow">→</span>
                    </button>

                    <button
                      className="menu-item firebasedb"
                      onClick={() => window.open('https://console.firebase.google.com', '_blank')}
                    >
                      <span className="menu-icon">🔥</span>
                      <div className="menu-text">
                        <h3>Firebase Console</h3>
                        <p>Manage database directly</p>
                      </div>
                      <span className="menu-arrow">↗️</span>
                    </button>
                  </div>

                  {/* Theme Selector */}
                  <div className="theme-section">
                    <h3>🎨 เปลี่ยนธีมสี</h3>
                    <div className="theme-grid">
                      {Object.entries(themes).map(([key, theme]) => (
                        <button
                          key={key}
                          className={`theme-option ${currentTheme === key ? 'active' : ''}`}
                          onClick={() => {
                            setCurrentTheme(key);
                            applyTheme(key);
                          }}
                        >
                          {theme.name}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="admin-footer">
                    <button 
                      className="btn-logout"
                      onClick={handleLogout}
                    >
                      🚪 Logout
                    </button>
                  </div>

                  <div className="admin-info">
                    <p>✨ Logged in as: <strong>Administrator</strong></p>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

      {/* Admin Dashboard - All in One */}
      {showDashboard && (
        <AdminDashboard onClose={() => setShowDashboard(false)} />
      )}
    </>
  );
};

export default AdminMenu;
