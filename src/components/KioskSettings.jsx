import React, { useState, useEffect } from 'react';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '../firebase';
import './KioskSettings.css';

const KioskSettings = ({ onClose, standalone = false }) => {
  const [settings, setSettings] = useState({
    kioskName: 'Lanna Kiosk',
    welcomeMessage: 'ยินดีต้อนรับสู่ตู้ข้อมูลอัจฉริยะ',
    idleTimeout: 30,
    scanTimeout: 10,
    contentDisplayDuration: 5,
    enableVoice: true,
    voiceVolume: 80,
    enableFaceDetection: true,
    minAge: 3,
    maxAge: 100,
    enablePersonalizedContent: true,
    showAnalytics: true,
    autoRestartDaily: false,
    restartTime: '03:00',
    language: 'th',
    debugMode: false
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      setLoading(true);
      const docRef = doc(db, 'system_settings', 'kiosk_config');
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        const data = docSnap.data();
        setSettings(prev => ({
          ...prev,
          ...data,
          // Ensure boolean values are properly converted
          enableVoice: data.enableVoice !== undefined ? Boolean(data.enableVoice) : prev.enableVoice,
          enableFaceDetection: data.enableFaceDetection !== undefined ? Boolean(data.enableFaceDetection) : prev.enableFaceDetection,
          enablePersonalizedContent: data.enablePersonalizedContent !== undefined ? Boolean(data.enablePersonalizedContent) : prev.enablePersonalizedContent,
          showAnalytics: data.showAnalytics !== undefined ? Boolean(data.showAnalytics) : prev.showAnalytics,
          autoRestartDaily: data.autoRestartDaily !== undefined ? Boolean(data.autoRestartDaily) : prev.autoRestartDaily,
          debugMode: data.debugMode !== undefined ? Boolean(data.debugMode) : prev.debugMode
        }));
      } else {
        // Document doesn't exist, create it with default values
        console.log('Settings document not found, will create with defaults on first save');
      }
    } catch (error) {
      console.error('Error loading settings:', error);
      // Don't show alert, just log the error
    } finally {
      setLoading(false);
    }
  };

  const saveSettings = async () => {
    try {
      setSaving(true);
      const docRef = doc(db, 'system_settings', 'kiosk_config');
      
      // Prepare settings data with proper types
      const settingsToSave = {
        ...settings,
        // Ensure numbers are properly typed
        idleTimeout: Number(settings.idleTimeout) || 30,
        scanTimeout: Number(settings.scanTimeout) || 10,
        contentDisplayDuration: Number(settings.contentDisplayDuration) || 5,
        voiceVolume: Number(settings.voiceVolume) || 80,
        minAge: Number(settings.minAge) || 3,
        maxAge: Number(settings.maxAge) || 100,
        updatedAt: new Date(),
        lastModified: new Date().toISOString()
      };
      
      await setDoc(docRef, settingsToSave);

      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
      console.log('Settings saved successfully:', settingsToSave);
    } catch (error) {
      console.error('Error saving settings:', error);
      alert('เกิดข้อผิดพลาดในการบันทึกการตั้งค่า: ' + error.message);
    } finally {
      setSaving(false);
    }
  };

  const handleChange = (key, value) => {
    setSettings(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const resetToDefaults = () => {
    if (confirm('ต้องการรีเซ็ตการตั้งค่าเป็นค่าเริ่มต้นใช่หรือไม่?')) {
      setSettings({
        kioskName: 'Lanna Kiosk',
        welcomeMessage: 'ยินดีต้อนรับสู่ตู้ข้อมูลอัจฉริยะ',
        idleTimeout: 30,
        scanTimeout: 10,
        contentDisplayDuration: 5,
        enableVoice: true,
        voiceVolume: 80,
        enableFaceDetection: true,
        minAge: 3,
        maxAge: 100,
        enablePersonalizedContent: true,
        showAnalytics: true,
        autoRestartDaily: false,
        restartTime: '03:00',
        language: 'th',
        debugMode: false
      });
    }
  };

  if (loading) {
    return (
      <div className={`kiosk-settings-overlay ${standalone ? 'standalone' : ''}`} onClick={standalone ? undefined : onClose}>
        <div className={`kiosk-settings-panel ${standalone ? 'standalone' : ''}`} onClick={(e) => e.stopPropagation()}>
          <div className="loading-state">
            <div className="spinner"></div>
            <p>กำลังโหลดการตั้งค่า...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`kiosk-settings-overlay ${standalone ? 'standalone' : ''}`} onClick={standalone ? undefined : onClose}>
      <div className={`kiosk-settings-panel ${standalone ? 'standalone' : ''}`} onClick={(e) => e.stopPropagation()}>
        <div className={`settings-header ${standalone ? 'standalone' : ''}`}>
          <h2>⚙️ Kiosk Settings</h2>
          <button className="close-btn" onClick={onClose}>✕</button>
        </div>

        <div className="settings-content">
          {/* General Settings */}
          <section className="settings-section">
            <h3>🏢 ข้อมูลทั่วไป</h3>
            
            <div className="setting-item">
              <label>ชื่อตู้</label>
              <input
                type="text"
                value={settings.kioskName}
                onChange={(e) => handleChange('kioskName', e.target.value)}
                className="setting-input"
              />
            </div>

            <div className="setting-item">
              <label>ข้อความต้อนรับ</label>
              <textarea
                value={settings.welcomeMessage}
                onChange={(e) => handleChange('welcomeMessage', e.target.value)}
                className="setting-textarea"
                rows="2"
              />
            </div>

            <div className="setting-item">
              <label>ภาษา</label>
              <select
                value={settings.language}
                onChange={(e) => handleChange('language', e.target.value)}
                className="setting-select"
              >
                <option value="th">ไทย</option>
                <option value="en">English</option>
              </select>
            </div>
          </section>

          {/* Timeout Settings */}
          <section className="settings-section">
            <h3>⏱️ การตั้งเวลา</h3>
            
            <div className="setting-item">
              <label>เวลารอก่อนกลับหน้าหลัก (วินาที)</label>
              <input
                type="number"
                value={settings.idleTimeout}
                onChange={(e) => handleChange('idleTimeout', Number(e.target.value))}
                className="setting-input"
                min="10"
                max="300"
              />
              <small>หากไม่มีการใช้งาน ระบบจะกลับหน้าหลักอัตโนมัติ</small>
            </div>

            <div className="setting-item">
              <label>เวลาสแกนใบหน้า (วินาที)</label>
              <input
                type="number"
                value={settings.scanTimeout}
                onChange={(e) => handleChange('scanTimeout', Number(e.target.value))}
                className="setting-input"
                min="5"
                max="30"
              />
            </div>

            <div className="setting-item">
              <label>ระยะเวลาแสดงเนื้อหา (วินาที)</label>
              <input
                type="number"
                value={settings.contentDisplayDuration}
                onChange={(e) => handleChange('contentDisplayDuration', Number(e.target.value))}
                className="setting-input"
                min="3"
                max="60"
              />
            </div>
          </section>

          {/* Voice Settings */}
          <section className="settings-section">
            <h3>🔊 เสียง</h3>
            
            <div className="setting-item toggle-item">
              <label>เปิดใช้งานเสียง</label>
              <label className="toggle-switch">
                <input
                  type="checkbox"
                  checked={settings.enableVoice}
                  onChange={(e) => handleChange('enableVoice', e.target.checked)}
                />
                <span className="toggle-slider"></span>
              </label>
            </div>

            {settings.enableVoice && (
              <div className="setting-item">
                <label>ระดับเสียง</label>
                <div className="slider-container">
                  <input
                    type="range"
                    value={settings.voiceVolume}
                    onChange={(e) => handleChange('voiceVolume', Number(e.target.value))}
                    className="setting-slider"
                    min="0"
                    max="100"
                  />
                  <span className="slider-value">{settings.voiceVolume}%</span>
                </div>
              </div>
            )}
          </section>

          {/* Face Detection Settings */}
          <section className="settings-section">
            <h3>👤 การตรวจจับใบหน้า</h3>
            
            <div className="setting-item toggle-item">
              <label>เปิดใช้งานการตรวจจับใบหน้า</label>
              <label className="toggle-switch">
                <input
                  type="checkbox"
                  checked={settings.enableFaceDetection}
                  onChange={(e) => handleChange('enableFaceDetection', e.target.checked)}
                />
                <span className="toggle-slider"></span>
              </label>
            </div>

            {settings.enableFaceDetection && (
              <>
                <div className="setting-item">
                  <label>อายุขั้นต่ำ</label>
                  <input
                    type="number"
                    value={settings.minAge}
                    onChange={(e) => handleChange('minAge', Number(e.target.value))}
                    className="setting-input"
                    min="0"
                    max="100"
                  />
                </div>

                <div className="setting-item">
                  <label>อายุสูงสุด</label>
                  <input
                    type="number"
                    value={settings.maxAge}
                    onChange={(e) => handleChange('maxAge', Number(e.target.value))}
                    className="setting-input"
                    min="0"
                    max="150"
                  />
                </div>

                <div className="setting-item toggle-item">
                  <label>เปิดใช้งานเนื้อหาแนะนำตามบุคลิก</label>
                  <label className="toggle-switch">
                    <input
                      type="checkbox"
                      checked={settings.enablePersonalizedContent}
                      onChange={(e) => handleChange('enablePersonalizedContent', e.target.checked)}
                    />
                    <span className="toggle-slider"></span>
                  </label>
                </div>
              </>
            )}
          </section>

          {/* Analytics Settings */}
          <section className="settings-section">
            <h3>📊 การวิเคราะห์</h3>
            
            <div className="setting-item toggle-item">
              <label>แสดง Analytics Dashboard</label>
              <label className="toggle-switch">
                <input
                  type="checkbox"
                  checked={settings.showAnalytics}
                  onChange={(e) => handleChange('showAnalytics', e.target.checked)}
                />
                <span className="toggle-slider"></span>
              </label>
            </div>
          </section>

          {/* System Settings */}
          <section className="settings-section">
            <h3>🔧 ระบบ</h3>
            
            <div className="setting-item toggle-item">
              <label>รีสตาร์ทอัตโนมัติทุกวัน</label>
              <label className="toggle-switch">
                <input
                  type="checkbox"
                  checked={settings.autoRestartDaily}
                  onChange={(e) => handleChange('autoRestartDaily', e.target.checked)}
                />
                <span className="toggle-slider"></span>
              </label>
            </div>

            {settings.autoRestartDaily && (
              <div className="setting-item">
                <label>เวลารีสตาร์ท</label>
                <input
                  type="time"
                  value={settings.restartTime}
                  onChange={(e) => handleChange('restartTime', e.target.value)}
                  className="setting-input"
                />
              </div>
            )}

            <div className="setting-item toggle-item">
              <label>โหมด Debug</label>
              <label className="toggle-switch">
                <input
                  type="checkbox"
                  checked={settings.debugMode}
                  onChange={(e) => handleChange('debugMode', e.target.checked)}
                />
                <span className="toggle-slider"></span>
              </label>
              <small>แสดงข้อมูล console สำหรับการแก้ไขปัญหา</small>
            </div>
          </section>
        </div>

        <div className="settings-footer">
          <button className="reset-btn" onClick={resetToDefaults}>
            🔄 รีเซ็ต
          </button>
          <button 
            className={`save-btn ${saved ? 'saved' : ''}`}
            onClick={saveSettings}
            disabled={saving}
          >
            {saving ? '⏳ กำลังบันทึก...' : saved ? '✅ บันทึกแล้ว' : '💾 บันทึกการตั้งค่า'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default KioskSettings;
