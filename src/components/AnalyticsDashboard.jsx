import React, { useEffect, useState } from 'react';
import { db } from '../firebase';
import { collection, query, getDocs, orderBy, limit } from 'firebase/firestore';
import './AnalyticsDashboard.css';

const AnalyticsDashboard = () => {
  const [heatmapData, setHeatmapData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnalyticsData();
  }, []);

  const fetchAnalyticsData = async () => {
    try {
      // Fetch heatmap data - try multiple collections for real data only
      let heatmapPoints = [];
      try {
        // Try heatmap_clicks first
        const heatmapRef = collection(db, 'heatmap_clicks');
        const heatmapQuery = query(heatmapRef, orderBy('timestamp', 'desc'), limit(100));
        const heatmapDocs = await getDocs(heatmapQuery);
        heatmapPoints = heatmapDocs.docs.map(doc => {
          const data = doc.data();
          return {
            ...data,
            id: doc.id,
            timestamp: data.timestamp?.toDate ? data.timestamp.toDate() : new Date(data.timestamp || Date.now())
          };
        });
      } catch (error) {
        console.log('heatmap_clicks not found, trying heatmap collection...');
        try {
          const heatmapRef = collection(db, 'heatmap');
          const heatmapQuery = query(heatmapRef, orderBy('timestamp', 'desc'), limit(100));
          const heatmapDocs = await getDocs(heatmapQuery);
          heatmapPoints = heatmapDocs.docs.map(doc => {
            const data = doc.data();
            return {
              ...data,
              id: doc.id,
              timestamp: data.timestamp?.toDate ? data.timestamp.toDate() : new Date(data.timestamp || Date.now())
            };
          });
        } catch (error2) {
          console.log('No heatmap data available');
          heatmapPoints = [];
        }
      }
      
      // Filter out test data and invalid coordinates
      const validHeatmapData = heatmapPoints.filter(point => {
        // Validate real data only
        return point.x !== undefined && 
               point.y !== undefined && 
               point.x >= 0 && point.x <= 100 &&
               point.y >= 0 && point.y <= 100 &&
               point.timestamp &&
               point.category && 
               point.category !== 'test' && // Remove test data
               !(point.x === 0 && point.y === 0) && // Remove default (0,0) entries
               !(point.x === 50 && point.y === 50 && point.category === 'default'); // Remove center default
      });

      console.log(`📊 Filtered heatmap: ${heatmapPoints.length} total → ${validHeatmapData.length} valid`);
      setHeatmapData(validHeatmapData);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching heatmap data:', error);
      setHeatmapData([]);
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="analytics-loading">
        <div className="loading-spinner"></div>
        <h2>�️ กำลังโหลด Heatmap...</h2>
        <p>กำลังดึงข้อมูลการคลิกจาก Firebase</p>
      </div>
    );
  }

  // Check if we have real heatmap data
  if (heatmapData.length === 0) {
    return (
      <div className="analytics-dashboard">
        <div className="analytics-header">
          <h1>🗺️ Heatmap</h1>
          <p>แสดงตำแหน่งการคลิกจริงของผู้ใช้งาน</p>
        </div>
        
        <div className="no-data-state">
          <div className="no-data-icon">🗺️</div>
          <h3>ยังไม่มีข้อมูลการคลิก</h3>
          <p>เริ่มใช้งานระบบเพื่อดู Heatmap การคลิก</p>
          <button className="refresh-btn" onClick={fetchAnalyticsData}>
            🔄 ตรวจสอบข้อมูลอีกครั้ง
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="analytics-dashboard">
      <div className="analytics-header">
        <h1>🗺️ Click Heatmap</h1>
        <p>ข้อมูลการคลิกจริงจากผู้ใช้งาน (ล่าสุด 100 ครั้ง)</p>
      </div>

      {/* Heatmap Stats */}
      <div className="metrics-grid">
        <div className="metric-card">
          <div className="metric-label">📊 จำนวนการคลิก</div>
          <div className="metric-value">{heatmapData.length}</div>
        </div>
        <div className="metric-card">
          <div className="metric-label">📅 วันล่าสุด</div>
          <div className="metric-value">
            {heatmapData[0]?.timestamp ? 
              new Date(heatmapData[0].timestamp).toLocaleDateString('th-TH') : 
              '-'
            }
          </div>
        </div>
      </div>

      {/* Heatmap Visualization */}
      <div className="analytics-section">
        <h2>🗺️ การแสดงผล Heatmap</h2>
        <p className="section-note">ข้อมูลจริงจาก Firebase - แสดงตำแหน่งที่ผู้ใช้คลิกบนหน้าจอ</p>
        
        <div className="heatmap-stats">
          <div className="heatmap-stat">
            <span className="stat-label">Total Clicks:</span>
            <span className="stat-value">{heatmapData.length}</span>
          </div>
          <div className="heatmap-stat">
            <span className="stat-label">ช่วงเวลา:</span>
            <span className="stat-value">
              {heatmapData[0]?.timestamp ? 
                new Date(heatmapData[0].timestamp).toLocaleTimeString('th-TH') : 
                'N/A'
              }
            </span>
          </div>
        </div>

        <div className="heatmap-visualization">
          <div className="heatmap-canvas">
            {heatmapData.slice(0, 100).map((point, idx) => (
              <div
                key={point.id || idx}
                className="heatmap-point"
                style={{
                  left: `${point.x || Math.random() * 100}%`,
                  top: `${point.y || Math.random() * 100}%`,
                  opacity: Math.max(0.2, 0.8 - (idx / 100))
                }}
                title={`หน้า: ${point.page || 'Unknown'} | เวลา: ${
                  point.timestamp ? 
                    new Date(point.timestamp).toLocaleString('th-TH') : 
                    'N/A'
                }`}
              />
            ))}
          </div>
          <div className="heatmap-legend">
            <span>🔴 ล่าสุด</span>
            <span>🟠 ปานกลาง</span> 
            <span>🟡 เก่า</span>
          </div>
        </div>
      </div>

      {/* Refresh Button */}
      <div className="analytics-footer">
        <button className="refresh-btn" onClick={fetchAnalyticsData}>
          🔄 รีเฟรชข้อมูล
        </button>
        <p className="refresh-note">ข้อมูลจริงจาก Firebase เท่านั้น</p>
      </div>
    </div>
  );
};

export default AnalyticsDashboard;
