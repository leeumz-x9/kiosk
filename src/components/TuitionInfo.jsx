import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { TUITION_INFO } from '../config';
import './TuitionInfo.css';

const TuitionInfo = ({ onClose }) => {
  const [activeTab, setActiveTab] = useState('certificate'); // certificate, diploma, scholarships

  const formatPrice = (price) => {
    return new Intl.NumberFormat('th-TH').format(price);
  };

  return (
    <motion.div 
      className="tuition-overlay"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <motion.div 
        className="tuition-modal"
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="tuition-header">
          <h2>💰 ค่าเทอม & ทุนการศึกษา</h2>
          <button className="close-btn" onClick={onClose}>✕</button>
        </div>

        {/* Tabs */}
        <div className="tuition-tabs">
          <button 
            className={`tab-btn ${activeTab === 'certificate' ? 'active' : ''}`}
            onClick={() => setActiveTab('certificate')}
          >
            📚 ปวช.
          </button>
          <button 
            className={`tab-btn ${activeTab === 'diploma' ? 'active' : ''}`}
            onClick={() => setActiveTab('diploma')}
          >
            🎓 ปวส.
          </button>
          <button 
            className={`tab-btn ${activeTab === 'scholarships' ? 'active' : ''}`}
            onClick={() => setActiveTab('scholarships')}
          >
            ⭐ ทุนการศึกษา
          </button>
        </div>

        {/* Content */}
        <div className="tuition-content">
          <AnimatePresence mode="wait">
            {/* ปวช. */}
            {activeTab === 'certificate' && (
              <motion.div
                key="certificate"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="tab-content"
              >
                <h3>📚 ระดับ ปวช. (รับผู้จบ ม.3 หรือเทียบเท่า)</h3>
                
                <div className="fee-cards">
                  {Object.entries(TUITION_INFO.certificate).map(([key, info]) => (
                    <div key={key} className="fee-card">
                      <h4>{info.name}</h4>
                      <div className="fee-details">
                        <div className="fee-row">
                          <span>ค่าเทอม:</span>
                          <strong>{formatPrice(info.tuition)} บาท/เทอม</strong>
                        </div>
                        <div className="fee-row">
                          <span>ค่าแรกเข้า + ชุด + หนังสือ:</span>
                          <strong>{formatPrice(info.entrance)} บาท</strong>
                        </div>
                        <div className="fee-row total">
                          <span>รวมทั้งหมด:</span>
                          <strong className="total-price">{formatPrice(info.total)} บาท</strong>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

            {/* ปวส. */}
            {activeTab === 'diploma' && (
              <motion.div
                key="diploma"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="tab-content"
              >
                <h3>🎓 ระดับ ปวส. (รับผู้จบ ปวช.3, ม.6 หรือเทียบเท่า)</h3>
                
                <div className="fee-cards">
                  {Object.entries(TUITION_INFO.diploma).map(([key, info]) => (
                    <div key={key} className="fee-card">
                      <h4>{info.name}</h4>
                      <div className="fee-details">
                        <div className="fee-row">
                          <span>ค่าเทอม:</span>
                          <strong>{formatPrice(info.tuition)} บาท/เทอม</strong>
                        </div>
                        <div className="fee-row">
                          <span>ค่าแรกเข้า + ชุด + หนังสือ:</span>
                          <strong>{formatPrice(info.entrance)} บาท</strong>
                        </div>
                        <div className="fee-row total">
                          <span>รวมทั้งหมด:</span>
                          <strong className="total-price">{formatPrice(info.total)} บาท</strong>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

            {/* ทุนการศึกษา */}
            {activeTab === 'scholarships' && (
              <motion.div
                key="scholarships"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="tab-content"
              >
                <h3>⭐ ทุนการศึกษา</h3>
                
                <div className="scholarship-grid">
                  {TUITION_INFO.scholarships.map((scholarship) => (
                    <div 
                      key={scholarship.id} 
                      className="scholarship-card"
                      style={{ borderColor: scholarship.color }}
                    >
                      <div className="scholarship-icon" style={{ color: scholarship.color }}>
                        {scholarship.icon}
                      </div>
                      <h4>{scholarship.name}</h4>
                      <p>{scholarship.description}</p>
                    </div>
                  ))}
                </div>

                {/* สิ่งที่จะได้รับ */}
                <div className="benefits-section">
                  <h4>🎁 สิ่งที่นักศึกษาจะได้รับ</h4>
                  <ul className="benefits-list">
                    {TUITION_INFO.benefits.map((benefit, index) => (
                      <li key={index}>✅ {benefit}</li>
                    ))}
                  </ul>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Footer Info */}
        <div className="tuition-footer">
          <div className="footer-section">
            <h4>📄 เอกสารสมัคร</h4>
            <ul className="doc-list">
              {TUITION_INFO.documents.map((doc, index) => (
                <li key={index}>{doc}</li>
              ))}
            </ul>
          </div>

          <div className="footer-section">
            <h4>📝 ช่องทางสมัคร</h4>
            <div className="method-list">
              {TUITION_INFO.applicationMethods.map((method) => (
                <div key={method.method} className="method-item">
                  <span className="method-icon">{method.icon}</span>
                  <div>
                    <strong>{method.name}</strong>
                    <p>{method.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="notes-section">
            {TUITION_INFO.notes.map((note, index) => (
              <div key={index} className="note-item">💡 {note}</div>
            ))}
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default TuitionInfo;
