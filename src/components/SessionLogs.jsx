import React, { useState, useEffect } from 'react';
import { collection, query, orderBy, limit, getDocs } from 'firebase/firestore';
import { db } from '../firebase';
import './SessionLogs.css';

const SessionLogs = ({ onClose, standalone = false }) => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [stats, setStats] = useState({
    total: 0,
    today: 0,
    thisWeek: 0,
    avgAge: 0,
    maleCount: 0,
    femaleCount: 0
  });

  useEffect(() => {
    fetchLogs();
  }, []);

  const fetchLogs = async () => {
    try {
      setLoading(true);
      
      // Fetch face scan sessions (real user scan data)
      let snapshot;
      let sessionsRef;
      
      // Try face_scan_sessions first
      try {
        sessionsRef = collection(db, 'face_scan_sessions');
        const q = query(sessionsRef, orderBy('timestamp', 'desc'), limit(100));
        snapshot = await getDocs(q);
      } catch (error) {
        console.log('face_scan_sessions collection not found, trying user_sessions...');
        // Fallback to user_sessions collection
        try {
          sessionsRef = collection(db, 'user_sessions');
          const q = query(sessionsRef, orderBy('timestamp', 'desc'), limit(100));
          snapshot = await getDocs(q);
        } catch (error2) {
          console.log('user_sessions collection not found, trying scan_logs...');
          try {
            sessionsRef = collection(db, 'scan_logs');
            const q = query(sessionsRef, orderBy('timestamp', 'desc'), limit(100));
            snapshot = await getDocs(q);
          } catch (error3) {
            console.log('No face scan session data available');
            snapshot = { docs: [] };
          }
        }
      }
      
      const logsData = [];
      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const weekAgo = new Date(today);
      weekAgo.setDate(weekAgo.getDate() - 7);
      
      let todayCount = 0;
      let weekCount = 0;
      let totalAge = 0;
      let ageCount = 0;
      let maleCount = 0;
      let femaleCount = 0;

      snapshot.docs.forEach(doc => {
        const data = doc.data();
        
        // Basic validation for face scan data
        if (!data.age || !data.gender) {
          console.log('📝 Skipping entry - missing age/gender:', data);
          return;
        }
        
        // More flexible age validation
        const age = Number(data.age);
        if (isNaN(age) || age < 1 || age > 120) {
          console.log('📝 Skipping entry - invalid age:', age);
          return;
        }
        
        // Accept if we have basic demographic data
        const validGenders = ['male', 'female', 'unknown'];
        if (!validGenders.includes(data.gender.toLowerCase())) {
          console.log('📝 Skipping entry - invalid gender:', data.gender);
          return;
        }
        
        let timestamp = data.timestamp;
        
        // Handle different timestamp formats
        if (timestamp && typeof timestamp.toDate === 'function') {
          timestamp = timestamp.toDate();
        } else if (timestamp && typeof timestamp === 'string') {
          timestamp = new Date(timestamp);
        } else if (timestamp && typeof timestamp === 'number') {
          timestamp = new Date(timestamp);
        } else {
          timestamp = new Date();
        }
        
        logsData.push({
          id: doc.id,
          ...data,
          timestamp,
          age: Number(data.age),
          gender: data.gender.toLowerCase()
        });

        // Calculate stats for today/week
        if (timestamp >= today) {
          todayCount++;
        }
        if (timestamp >= weekAgo) {
          weekCount++;
        }

        // Age statistics
        const ageNum = Number(data.age);
        if (!isNaN(ageNum)) {
          totalAge += ageNum;
          ageCount++;
        }
        
        // Gender statistics
        const genderLower = data.gender.toLowerCase();
        if (genderLower === 'male') maleCount++;
        if (genderLower === 'female') femaleCount++;
      });

      // Sort by timestamp descending
      logsData.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

      setLogs(logsData);
      setStats({
        total: logsData.length,
        today: todayCount,
        thisWeek: weekCount,
        avgAge: ageCount > 0 ? Math.round(totalAge / ageCount) : 0,
        maleCount,
        femaleCount
      });
      
      console.log(`📊 SessionLogs loaded: ${logsData.length} sessions`, {
        total: logsData.length,
        today: todayCount,
        thisWeek: weekCount,
        avgAge: ageCount > 0 ? Math.round(totalAge / ageCount) : 0
      });
      
    } catch (error) {
      console.error('Error fetching logs:', error);
      // Set empty data instead of showing alert
      setLogs([]);
      setStats({
        total: 0,
        today: 0,
        thisWeek: 0,
        avgAge: 0,
        maleCount: 0,
        femaleCount: 0
      });
    } finally {
      setLoading(false);
    }
  };

  const getFilteredLogs = () => {
    if (filter === 'all') return logs;
    
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    
    if (filter === 'today') {
      return logs.filter(log => log.timestamp >= today);
    }
    
    if (filter === 'week') {
      const weekAgo = new Date(today);
      weekAgo.setDate(weekAgo.getDate() - 7);
      return logs.filter(log => log.timestamp >= weekAgo);
    }
    
    return logs;
  };

  const formatTimestamp = (timestamp) => {
    if (!timestamp) return 'ไม่ระบุ';
    return new Date(timestamp).toLocaleString('th-TH', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getGenderEmoji = (gender) => {
    if (gender === 'male') return '👨';
    if (gender === 'female') return '👩';
    return '👤';
  };

  const getEmotionEmoji = (emotion) => {
    const emotions = {
      happy: '😊',
      neutral: '😐',
      sad: '😢',
      angry: '😠',
      surprised: '😮'
    };
    return emotions[emotion] || '😐';
  };

  const filteredLogs = getFilteredLogs();

  return (
    <div className={`session-logs-overlay ${standalone ? 'standalone' : ''}`} onClick={standalone ? undefined : onClose}>
      <div className={`session-logs-panel ${standalone ? 'standalone' : ''}`} onClick={(e) => e.stopPropagation()}>
        <div className={`session-logs-header ${standalone ? 'standalone' : ''}`}>
          <h2>📈 Session Logs</h2>
          <button className="close-btn" onClick={onClose}>✕</button>
        </div>

        {loading ? (
          <div className="loading-state">
            <div className="spinner"></div>
            <p>กำลังโหลดข้อมูล...</p>
          </div>
        ) : logs.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">📊</div>
            <h3>ยังไม่มีข้อมูลการใช้งาน</h3>
            <p>เริ่มใช้งานระบบเพื่อเก็บข้อมูล Session Logs</p>
          </div>
        ) : (
          <>
            {/* Statistics Cards */}
            <div className="stats-grid">
              <div className="stat-card">
                <div className="stat-icon">📊</div>
                <div className="stat-content">
                  <div className="stat-value">{stats.total}</div>
                  <div className="stat-label">การเข้าใช้งานทั้งหมด</div>
                </div>
              </div>

              <div className="stat-card">
                <div className="stat-icon">📅</div>
                <div className="stat-content">
                  <div className="stat-value">{stats.today}</div>
                  <div className="stat-label">วันนี้</div>
                </div>
              </div>

              <div className="stat-card">
                <div className="stat-icon">📆</div>
                <div className="stat-content">
                  <div className="stat-value">{stats.thisWeek}</div>
                  <div className="stat-label">สัปดาห์นี้</div>
                </div>
              </div>

              <div className="stat-card">
                <div className="stat-icon">🎂</div>
                <div className="stat-content">
                  <div className="stat-value">{stats.avgAge} ปี</div>
                  <div className="stat-label">อายุเฉลี่ย</div>
                </div>
              </div>

              <div className="stat-card">
                <div className="stat-icon">👨</div>
                <div className="stat-content">
                  <div className="stat-value">{stats.maleCount}</div>
                  <div className="stat-label">ผู้ชาย</div>
                </div>
              </div>

              <div className="stat-card">
                <div className="stat-icon">👩</div>
                <div className="stat-content">
                  <div className="stat-value">{stats.femaleCount}</div>
                  <div className="stat-label">ผู้หญิง</div>
                </div>
              </div>
            </div>

            {/* Filter Buttons */}
            <div className="filter-buttons">
              <button
                className={`filter-btn ${filter === 'all' ? 'active' : ''}`}
                onClick={() => setFilter('all')}
              >
                ทั้งหมด ({logs.length})
              </button>
              <button
                className={`filter-btn ${filter === 'today' ? 'active' : ''}`}
                onClick={() => setFilter('today')}
              >
                วันนี้ ({stats.today})
              </button>
              <button
                className={`filter-btn ${filter === 'week' ? 'active' : ''}`}
                onClick={() => setFilter('week')}
              >
                สัปดาห์นี้ ({stats.thisWeek})
              </button>
            </div>

            {/* Logs Table */}
            <div className="logs-container">
              {filteredLogs.length === 0 ? (
                <div className="empty-state">
                  <p>ไม่มีข้อมูลการใช้งาน</p>
                </div>
              ) : (
                <table className="logs-table">
                  <thead>
                    <tr>
                      <th>เวลา</th>
                      <th>อายุ</th>
                      <th>เพศ</th>
                      <th>อารมณ์</th>
                      <th>หน้า</th>
                      <th>คลิก</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredLogs.map(log => (
                      <tr key={log.id}>
                        <td className="timestamp-cell">
                          {formatTimestamp(log.timestamp)}
                        </td>
                        <td className="age-cell">
                          {log.age ? `${log.age} ปี` : '-'}
                        </td>
                        <td className="gender-cell">
                          {getGenderEmoji(log.gender)} {log.gender || '-'}
                        </td>
                        <td className="emotion-cell">
                          {getEmotionEmoji(log.emotion)} {log.emotion || '-'}
                        </td>
                        <td className="page-cell">
                          {log.page || 'หน้าหลัก'}
                        </td>
                        <td className="position-cell">
                          {log.x ? `(${Math.round(log.x)}, ${Math.round(log.y)})` : '-'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>

            <div className="logs-footer">
              <button className="refresh-btn" onClick={fetchLogs}>
                🔄 รีเฟรช
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default SessionLogs;
