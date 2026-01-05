import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { TUITION_INFO } from '../config';
import './TuitionInfo.css';

const TuitionInfo = ({ onClose }) => {
  const [activeTab, setActiveTab] = useState('certificate'); // certificate, diploma, scholarships
  const [showMap, setShowMap] = useState(false);
  const [showOnlineAdmission, setShowOnlineAdmission] = useState(false);

  const formatPrice = (price) => {
    return new Intl.NumberFormat('th-TH').format(price);
  };

  const handleMapClick = () => {
    setShowMap(true);
  };

  const handleCloseMap = () => {
    setShowMap(false);
  };

  const handleOnlineAdmissionClick = () => {
    setShowOnlineAdmission(true);
  };

  const handleCloseOnlineAdmission = () => {
    setShowOnlineAdmission(false);
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
                <div 
                  key={method.method} 
                  className="method-item clickable"
                  onClick={() => {
                    if (method.method === 'walk-in') {
                      handleMapClick();
                    } else if (method.method === 'online') {
                      handleOnlineAdmissionClick();
                    }
                  }}
                >
                  <span className="method-icon">{method.icon}</span>
                  <div>
                    <strong>{method.name}</strong>
                    <p>{method.description}</p>
                  </div>
                  <span className="method-arrow">→</span>
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

      {/* Online Admission Modal */}
      <AnimatePresence>
        {showOnlineAdmission && (
          <motion.div 
            className="external-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleCloseOnlineAdmission}
          >
            <motion.div 
              className="external-modal"
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="external-header">
                <h3>📝 สมัครเรียนออนไลน์</h3>
                <button className="back-btn" onClick={handleCloseOnlineAdmission}>
                  ← กลับ
                </button>
              </div>
              <iframe
                src="https://www.lannapoly.ac.th/admission/#/?from=website"
                className="admission-iframe"
                title="Online Admission"
                allowFullScreen
                loading="lazy"
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Google Maps Modal */}
      <AnimatePresence>
        {showMap && (
          <motion.div 
            className="external-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleCloseMap}
          >
            <motion.div 
              className="external-modal"
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="external-header">
                <h3>📍 ที่ตั้งวิทยาลัย</h3>
                <button className="back-btn" onClick={handleCloseMap}>
                  ← กลับ
                </button>
              </div>
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m14!1m8!1m3!1d15107.211230282383!2d98.9912912!3d18.8069393!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x30da3bcb57f2cda3%3A0x5a42c69f9e85016a!2z4Lin4Li04LiX4Lii4Liy4Lil4Lix4Lii4LmA4LiX4LiE4LmC4LiZ4LmC4Lil4Lii4Li14LmC4Lib4Lil4Li04LmA4LiX4LiE4LiZ4Li04LiE4Lil4Liy4LiZ4LiZ4LiyIOC5gOC4iuC4teC4ouC4h-C5g-C4q-C4oeC5iA!5e0!3m2!1sth!2sth!4v1766587427769!5m2!1sth!2sth"
                className="admission-iframe"
                title="Google Maps - วิทยาลัยเทคโนโลยีโปลิเทคนิคลานนา"
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                style={{ border: 0 }}
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default TuitionInfo;
