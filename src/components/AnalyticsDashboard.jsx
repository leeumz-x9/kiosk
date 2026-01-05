import React, { useEffect, useState } from 'react';
import { db } from '../firebase';
import { collection, query, getDocs, orderBy, limit } from 'firebase/firestore';
import { getConversionFunnel, getSessionAnalytics } from '../firebaseService';
import './AnalyticsDashboard.css';

const AnalyticsDashboard = () => {
  const [analytics, setAnalytics] = useState(null);
  const [heatmapData, setHeatmapData] = useState([]);
  const [careerStats, setCareerStats] = useState([]);
  const [conversionFunnel, setConversionFunnel] = useState(null);
  const [sessionMetrics, setSessionMetrics] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnalyticsData();
  }, []);

  const fetchAnalyticsData = async () => {
    try {
      // Fetch analytics summary
      const analyticsRef = collection(db, 'analytics');
      const analyticsDocs = await getDocs(analyticsRef);
      const analyticsData = analyticsDocs.docs[0]?.data();
      setAnalytics(analyticsData);

      // Fetch heatmap data
      const heatmapRef = collection(db, 'heatmap');
      const heatmapQuery = query(heatmapRef, orderBy('timestamp', 'desc'), limit(100));
      const heatmapDocs = await getDocs(heatmapQuery);
      const heatmapPoints = heatmapDocs.docs.map(doc => doc.data());
      setHeatmapData(heatmapPoints);

      // Calculate career statistics
      const careerMap = {};
      heatmapPoints.forEach(point => {
        if (point.page) {
          careerMap[point.page] = (careerMap[point.page] || 0) + 1;
        }
      });
      const careerArray = Object.entries(careerMap).map(([page, count]) => ({
        page,
        count,
        percentage: ((count / heatmapPoints.length) * 100).toFixed(1)
      })).sort((a, b) => b.count - a.count);
      setCareerStats(careerArray);

      // Fetch conversion funnel data
      const funnel = await getConversionFunnel();
      setConversionFunnel(funnel);

      // Fetch session analytics
      const sessionData = await getSessionAnalytics();
      setSessionMetrics(sessionData);

      setLoading(false);
    } catch (error) {
      console.error('Error fetching analytics:', error);
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="analytics-loading">📊 Loading Analytics...</div>;
  }

  return (
    <div className="analytics-dashboard">
      <div className="analytics-header">
        <h1>📊 Kiosk Analytics Dashboard</h1>
        <p>Real-time performance and user engagement metrics</p>
      </div>

      {/* Key Metrics */}
      <div className="metrics-grid">
        <div className="metric-card">
          <div className="metric-label">👥 Total Visits</div>
          <div className="metric-value">{analytics?.totalVisits || 0}</div>
        </div>
        <div className="metric-card">
          <div className="metric-label">🔗 Total Sessions</div>
          <div className="metric-value">{analytics?.totalSessions || 0}</div>
        </div>
        <div className="metric-card">
          <div className="metric-label">🎯 Unique Visitors</div>
          <div className="metric-value">{analytics?.uniqueVisitors || 0}</div>
        </div>
        <div className="metric-card">
          <div className="metric-label">⭐ Top Career</div>
          <div className="metric-value">{analytics?.topCareer || '-'}</div>
        </div>
      </div>

      {/* Heatmap Visualization */}
      <div className="analytics-section">
        <h2>🗺️ Click Heatmap</h2>
        <div className="heatmap-container">
          {heatmapData.length > 0 ? (
            <div className="heatmap-points">
              {heatmapData.slice(0, 50).map((point, idx) => (
                <div
                  key={idx}
                  className="heatmap-point"
                  style={{
                    left: `${(point.x % 640) / 640 * 100}%`,
                    top: `${(point.y % 480) / 480 * 100}%`,
                  }}
                  title={`Page: ${point.page || 'unknown'}`}
                />
              ))}
            </div>
          ) : (
            <p className="no-data">No heatmap data yet</p>
          )}
        </div>
        <p className="heatmap-note">Last 50 clicks shown (darker = more recent)</p>
      </div>

      {/* Career Interest Stats */}
      <div className="analytics-section">
        <h2>🎓 Career Interest Distribution</h2>
        <div className="career-stats">
          {careerStats.length > 0 ? (
            careerStats.map((stat, idx) => (
              <div key={idx} className="stat-row">
                <div className="stat-name">{stat.page}</div>
                <div className="stat-bar">
                  <div 
                    className="stat-fill"
                    style={{ width: `${stat.percentage}%` }}
                  >
                    <span className="stat-percentage">{stat.percentage}%</span>
                  </div>
                </div>
                <div className="stat-count">{stat.count} clicks</div>
              </div>
            ))
          ) : (
            <p className="no-data">No career data yet</p>
          )}
        </div>
      </div>

      {/* Session Details */}
      <div className="analytics-section">
        <h2>📋 Conversion Funnel</h2>
        {conversionFunnel ? (
          <div className="funnel-container">
            <div className="funnel-step">
              <div className="funnel-label">👁️ Visits</div>
              <div className="funnel-bar" style={{ width: '100%' }}>
                <span className="funnel-value">{conversionFunnel.total}</span>
              </div>
            </div>
            <div className="funnel-step">
              <div className="funnel-label">📷 Scanned</div>
              <div className="funnel-bar" style={{ width: `${conversionFunnel.scanRate || 0}%` }}>
                <span className="funnel-value">{conversionFunnel.scanned || 0}</span>
              </div>
              <div className="funnel-rate">{conversionFunnel.scanRate?.toFixed(1)}%</div>
            </div>
            <div className="funnel-step">
              <div className="funnel-label">🎯 Clicked Career</div>
              <div className="funnel-bar" style={{ width: `${conversionFunnel.clickRate || 0}%` }}>
                <span className="funnel-value">{conversionFunnel.clicked || 0}</span>
              </div>
              <div className="funnel-rate">{conversionFunnel.clickRate?.toFixed(1)}%</div>
            </div>
            <div className="funnel-step">
              <div className="funnel-label">💬 Chatted</div>
              <div className="funnel-bar" style={{ width: `${conversionFunnel.chatRate || 0}%` }}>
                <span className="funnel-value">{conversionFunnel.chatted || 0}</span>
              </div>
              <div className="funnel-rate">{conversionFunnel.chatRate?.toFixed(1)}%</div>
            </div>
            <div className="funnel-step">
              <div className="funnel-label">📋 Form Completed</div>
              <div className="funnel-bar" style={{ width: `${(conversionFunnel.form_filled / conversionFunnel.total * 100) || 0}%` }}>
                <span className="funnel-value">{conversionFunnel.form_filled || 0}</span>
              </div>
              <div className="funnel-rate">{((conversionFunnel.form_filled / conversionFunnel.total * 100) || 0).toFixed(1)}%</div>
            </div>
          </div>
        ) : (
          <p className="no-data">No conversion data yet</p>
        )}
      </div>

      {/* Session Analytics */}
      <div className="analytics-section">
        <h2>⏱️ Session Analytics</h2>
        {sessionMetrics ? (
          <div className="session-metrics">
            <div className="metric-row">
              <span className="metric-name">Total Sessions:</span>
              <span className="metric-data">{sessionMetrics.sessionCount || 0}</span>
            </div>
            <div className="metric-row">
              <span className="metric-name">Average Session Duration:</span>
              <span className="metric-data">{sessionMetrics.avgSessionDuration ? (sessionMetrics.avgSessionDuration / 1000).toFixed(1) : '0'}s</span>
            </div>
            <div className="metric-row">
              <span className="metric-name">Total Page Views:</span>
              <span className="metric-data">{sessionMetrics.totalPageViews || 0}</span>
            </div>
            <div className="metric-row">
              <span className="metric-name">Top Pages:</span>
              <span className="metric-data">
                {sessionMetrics.pageMetrics && sessionMetrics.pageMetrics.length > 0
                  ? sessionMetrics.pageMetrics.slice(0, 3).map(p => p.page).join(', ')
                  : 'No data'}
              </span>
            </div>
          </div>
        ) : (
          <p className="no-data">No session data yet</p>
        )}
      </div>

      {/* Latest Sessions Info */}
      <div className="analytics-section">
        <h2>📋 Click Tracking</h2>
        <p className="section-note">Click tracking data from the last 24 hours</p>
        <p className="last-updated">
          Last updated: {analytics?.lastUpdated ? new Date(analytics.lastUpdated.toDate()).toLocaleString() : 'N/A'}
        </p>
      </div>

      {/* Refresh Button */}
      <div className="analytics-footer">
        <button className="refresh-btn" onClick={fetchAnalyticsData}>
          🔄 Refresh Data
        </button>
        <p className="refresh-note">Auto-refresh every 60 seconds</p>
      </div>
    </div>
  );
};

export default AnalyticsDashboard;
