import React, { useEffect, useState, useRef } from 'react';
import { subscribeToHeatmap, recordHeatmapClick } from '../firebase';
import './Heatmap.css';

const Heatmap = () => {
  const [heatmapData, setHeatmapData] = useState([]);
  const [isVisible, setIsVisible] = useState(false);
  const canvasRef = useRef(null);

  useEffect(() => {
    const unsubscribe = subscribeToHeatmap((data) => {
      setHeatmapData(data);
      drawHeatmap(data);
    });

    return () => unsubscribe();
  }, []);

  const drawHeatmap = (data) => {
    if (!canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const width = canvas.width;
    const height = canvas.height;

    // Clear canvas
    ctx.clearRect(0, 0, width, height);

    // Draw background grid
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)';
    ctx.lineWidth = 1;
    
    for (let i = 0; i < width; i += 50) {
      ctx.beginPath();
      ctx.moveTo(i, 0);
      ctx.lineTo(i, height);
      ctx.stroke();
    }
    
    for (let i = 0; i < height; i += 50) {
      ctx.beginPath();
      ctx.moveTo(0, i);
      ctx.lineTo(width, i);
      ctx.stroke();
    }

    // Draw heatmap points
    data.forEach(point => {
      const x = (point.x / 100) * width;
      const y = (point.y / 100) * height;
      const gradient = ctx.createRadialGradient(x, y, 0, x, y, 30);
      
      gradient.addColorStop(0, 'rgba(251, 191, 36, 0.6)');
      gradient.addColorStop(0.5, 'rgba(16, 185, 129, 0.3)');
      gradient.addColorStop(1, 'rgba(16, 185, 129, 0)');

      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.arc(x, y, 30, 0, Math.PI * 2);
      ctx.fill();
    });
  };

  const handleCanvasClick = (e) => {
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    
    recordHeatmapClick(x, y, 'manual');
  };

  return (
    <div className="heatmap-container">
      <button 
        className="heatmap-toggle"
        onClick={() => setIsVisible(!isVisible)}
      >
        {isVisible ? '📊 ซ่อน Heatmap' : '📊 แสดง Heatmap'}
      </button>

      {isVisible && (
        <div className="heatmap-panel">
          <div className="heatmap-header">
            <h3>🔥 Heatmap แบบ Realtime</h3>
            <span className="data-count">{heatmapData.length} จุด</span>
          </div>

          <canvas
            ref={canvasRef}
            width={400}
            height={300}
            className="heatmap-canvas"
            onClick={handleCanvasClick}
          />

          <div className="heatmap-legend">
            <div className="legend-item">
              <span className="legend-color hot"></span>
              <span>มีการโต้ตอบสูง</span>
            </div>
            <div className="legend-item">
              <span className="legend-color warm"></span>
              <span>มีการโต้ตอบปานกลาง</span>
            </div>
            <div className="legend-item">
              <span className="legend-color cool"></span>
              <span>มีการโต้ตอบน้อย</span>
            </div>
          </div>

          <div className="heatmap-stats">
            <div className="stat-item">
              <span className="stat-label">จุดทั้งหมด:</span>
              <span className="stat-value">{heatmapData.length}</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">อัพเดทล่าสุด:</span>
              <span className="stat-value">
                {heatmapData.length > 0 ? 'เมื่อสักครู่' : 'ไม่มีข้อมูล'}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Heatmap;
