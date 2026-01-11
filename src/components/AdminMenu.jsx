import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import ContentAdmin from './ContentAdmin';
import AgeGroupAdmin from './AgeGroupAdmin';
import './AdminMenu.css';

const AdminMenu = ({ onNavigate }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [adminCode, setAdminCode] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [showContentAdmin, setShowContentAdmin] = useState(false);
  const [showAgeGroupAdmin, setShowAgeGroupAdmin] = useState(false);

  // Simple admin passcode (change this to something secure)
  const ADMIN_PASSCODE = '2025';

  const handleAdminAccess = () => {
    if (adminCode === ADMIN_PASSCODE) {
      setIsAuthenticated(true);
      setAdminCode('');
      // Auto-close popup after 1 second
      setTimeout(() => setIsOpen(false), 500);
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
      <motion.button
        className="admin-toggle-btn"
        onClick={() => setIsOpen(!isOpen)}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        title="Admin Panel"
      >
        {isAuthenticated ? '👨‍💼' : '⚙️'}
      </motion.button>

      {/* Admin Menu Popup */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            className="admin-menu-backdrop"
            onClick={() => setIsOpen(false)}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="admin-menu-popup"
              onClick={(e) => e.stopPropagation()}
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
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
                    <motion.button
                      className="menu-item analytics"
                      onClick={() => handleMenuClick('analytics')}
                      whileHover={{ x: 5, backgroundColor: 'rgba(102, 126, 234, 0.15)' }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <span className="menu-icon">📊</span>
                      <div className="menu-text">
                        <h3>Analytics Dashboard</h3>
                        <p>View heatmaps and statistics</p>
                      </div>
                      <span className="menu-arrow">→</span>
                    </motion.button>

                    <motion.button
                      className="menu-item careers"
                      onClick={() => handleMenuClick('home')}
                      whileHover={{ x: 5, backgroundColor: 'rgba(34, 197, 94, 0.15)' }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <span className="menu-icon">🎓</span>
                      <div className="menu-text">
                        <h3>Back to Kiosk</h3>
                        <p>Return to main application</p>
                      </div>
                      <span className="menu-arrow">→</span>
                    </motion.button>

                    <motion.button
                      className="menu-item content"
                      onClick={() => {
                        setIsOpen(false);
                        setShowContentAdmin(true);
                      }}
                      whileHover={{ x: 5, backgroundColor: 'rgba(236, 72, 153, 0.15)' }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <span className="menu-icon">📝</span>
                      <div className="menu-text">
                        <h3>จัดการเนื้อหา</h3>
                        <p>เพิ่ม/แก้ไข/ลบเนื้อหาที่แสดง</p>
                      </div>
                      <span className="menu-arrow">→</span>
                    </motion.button>

                    <motion.button
                      className="menu-item agegroup"
                      onClick={() => {
                        setIsOpen(false);
                        setShowAgeGroupAdmin(true);
                      }}
                      whileHover={{ x: 5, backgroundColor: 'rgba(245, 158, 11, 0.15)' }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <span className="menu-icon">🎯</span>
                      <div className="menu-text">
                        <h3>จัดการช่วงอายุ</h3>
                        <p>เพิ่ม/แก้ไข/ลบช่วงอายุ</p>
                      </div>
                      <span className="menu-arrow">→</span>
                    </motion.button>

                    <motion.button
                      className="menu-item firebasedb"
                      onClick={() => window.open('https://console.firebase.google.com', '_blank')}
                      whileHover={{ x: 5, backgroundColor: 'rgba(249, 115, 22, 0.15)' }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <span className="menu-icon">🔥</span>
                      <div className="menu-text">
                        <h3>Firebase Console</h3>
                        <p>Manage database directly</p>
                      </div>
                      <span className="menu-arrow">↗️</span>
                    </motion.button>

                    <motion.button
                      className="menu-item stats"
                      onClick={() => alert('📈 Session Management - Coming Soon!')}
                      whileHover={{ x: 5, backgroundColor: 'rgba(168, 85, 247, 0.15)' }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <span className="menu-icon">📈</span>
                      <div className="menu-text">
                        <h3>Session Logs</h3>
                        <p>View user activity history</p>
                      </div>
                      <span className="menu-arrow">→</span>
                    </motion.button>

      {/* Content Admin Panel */}
      {showContentAdmin && (
        <ContentAdmin onClose={() => setShowContentAdmin(false)} />
      )}

      {/* Age Group Admin Panel */}
      {showAgeGroupAdmin && (
        <AgeGroupAdmin onClose={() => setShowAgeGroupAdmin(false)} />
      )}

                    <motion.button
                      className="menu-item settings"
                      onClick={() => alert('⚙️ Settings - Coming Soon!')}
                      whileHover={{ x: 5, backgroundColor: 'rgba(14, 165, 233, 0.15)' }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <span className="menu-icon">⚙️</span>
                      <div className="menu-text">
                        <h3>Kiosk Settings</h3>
                        <p>Configure kiosk parameters</p>
                      </div>
                      <span className="menu-arrow">→</span>
                    </motion.button>
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
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Content Admin Panel */}
      <AnimatePresence>
        {showContentAdmin && (
          <ContentAdmin onClose={() => setShowContentAdmin(false)} />
        )}
      </AnimatePresence>

      {/* Age Group Admin Panel */}
      <AnimatePresence>
        {showAgeGroupAdmin && (
          <AgeGroupAdmin onClose={() => setShowAgeGroupAdmin(false)} />
        )}
      </AnimatePresence>
    </>
  );
};

export default AdminMenu;
