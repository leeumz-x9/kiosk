import React, { useState } from 'react';
import AnalyticsDashboard from './AnalyticsDashboard';
import ContentAdmin from './ContentAdmin';
import AgeGroupAdmin from './AgeGroupAdmin';
import SessionLogs from './SessionLogs';
import './AdminDashboard.css';

const AdminDashboard = ({ onClose }) => {
  const [activeTab, setActiveTab] = useState('analytics');

  const tabs = [
    { id: 'analytics', name: '📊 Analytics & Heatmap', icon: '📊' },
    { id: 'sessions', name: '📈 Session Logs', icon: '📈' },
    { id: 'content', name: '📝 จัดการเนื้อหา', icon: '📝' },
    { id: 'agegroups', name: '🎯 จัดการช่วงอายุ', icon: '🎯' }
  ];

  return (
    <div className="admin-dashboard-overlay" onClick={onClose}>
      <div className="admin-dashboard-panel" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="admin-dashboard-header">
          <h2>👨‍💼 Admin Dashboard</h2>
          <button className="close-btn" onClick={onClose}>✕</button>
        </div>

        {/* Tab Navigation */}
        <div className="admin-tabs">
          {tabs.map(tab => (
            <button
              key={tab.id}
              className={`tab-btn ${activeTab === tab.id ? 'active' : ''}`}
              onClick={() => setActiveTab(tab.id)}
            >
              <span className="tab-icon">{tab.icon}</span>
              <span className="tab-name">{tab.name}</span>
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="admin-content">
          {activeTab === 'analytics' && (
            <div className="tab-content">
              <AnalyticsDashboard />
            </div>
          )}

          {activeTab === 'sessions' && (
            <div className="tab-content">
              <SessionLogs standalone={true} />
            </div>
          )}

          {activeTab === 'content' && (
            <div className="tab-content">
              <ContentAdmin standalone={true} />
            </div>
          )}

          {activeTab === 'agegroups' && (
            <div className="tab-content">
              <AgeGroupAdmin standalone={true} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
