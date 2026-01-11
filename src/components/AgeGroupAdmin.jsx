import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  collection, 
  getDocs, 
  addDoc, 
  updateDoc,
  deleteDoc,
  doc,
  setDoc
} from 'firebase/firestore';
import { db } from '../firebase';
import './AgeGroupAdmin.css';

export default function AgeGroupAdmin({ onClose, standalone = false }) {
  const [ageGroups, setAgeGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingGroup, setEditingGroup] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    id: '',
    name: '',
    ageMin: 0,
    ageMax: 100,
    description: '',
    emoji: '📌',
    color: '#3b82f6'
  });

  useEffect(() => {
    fetchAgeGroups();
  }, []);

  const fetchAgeGroups = async () => {
    if (!db) {
      setLoading(false);
      alert('⚠️ Firebase ยังไม่ได้ตั้งค่า\n\nกรุณาตั้งค่า Firebase ใน src/config.js ก่อนใช้งาน Admin Panel\n\nดูคำแนะนำได้ที่: FIREBASE_SETUP.md');
      return;
    }
    try {
      setLoading(true);
      const ageGroupsRef = collection(db, 'age_groups');
      const snapshot = await getDocs(ageGroupsRef);
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      data.sort((a, b) => a.ageMin - b.ageMin);
      setAgeGroups(data);
    } catch (error) {
      console.error('Error fetching age groups:', error);
      alert('เกิดข้อผิดพลาดในการโหลดข้อมูล: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const validateForm = () => {
    if (!formData.id.trim()) {
      alert('กรุณากรอก ID (ภาษาอังกฤษ ไม่มีช่องว่าง)');
      return false;
    }
    if (!formData.name.trim()) {
      alert('กรุณากรอกชื่อกลุ่มอายุ');
      return false;
    }
    if (formData.ageMin < 0 || formData.ageMax < 0) {
      alert('อายุต้องมากกว่าหรือเท่ากับ 0');
      return false;
    }
    if (formData.ageMin >= formData.ageMax) {
      alert('อายุต่ำสุดต้องน้อยกว่าอายุสูงสุด');
      return false;
    }
    // ตรวจสอบว่า ID ซ้ำไหม (ถ้าเป็นการเพิ่มใหม่)
    if (!editingGroup && ageGroups.some(g => g.id === formData.id)) {
      alert('ID นี้มีอยู่แล้ว กรุณาใช้ ID อื่น');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!db) {
      alert('⚠️ Firebase ยังไม่ได้ตั้งค่า');
      return;
    }
    
    if (!validateForm()) return;

    try {
      const groupData = {
        id: formData.id,
        name: formData.name,
        ageMin: parseInt(formData.ageMin),
        ageMax: parseInt(formData.ageMax),
        description: formData.description,
        emoji: formData.emoji || '📌',
        color: formData.color || '#3b82f6'
      };

      if (editingGroup) {
        // ถ้า ID เปลี่ยน = ลบเก่า สร้างใหม่
        if (editingGroup.id !== formData.id) {
          const oldDocRef = doc(db, 'age_groups', editingGroup.id);
          await deleteDoc(oldDocRef);
          await setDoc(doc(db, 'age_groups', formData.id), groupData);
          alert('✅ เปลี่ยน ID และอัปเดตข้อมูลสำเร็จ!');
        } else {
          // ID ไม่เปลี่ยน = อัปเดตตรงๆ
          const docRef = doc(db, 'age_groups', editingGroup.id);
          await updateDoc(docRef, groupData);
          alert('✅ อัปเดตกลุ่มอายุสำเร็จ!');
        }
      } else {
        // Create new (ใช้ ID ที่กรอกเป็น Document ID)
        await setDoc(doc(db, 'age_groups', formData.id), groupData);
        alert('✅ เพิ่มกลุ่มอายุสำเร็จ!');
      }

      // Reset form
      setFormData({
        id: '',
        name: '',
        ageMin: 0,
        ageMax: 100,
        description: '',
        emoji: '📌',
        color: '#3b82f6'
      });
      setEditingGroup(null);
      setShowForm(false);
      fetchAgeGroups();

    } catch (error) {
      console.error('Error saving age group:', error);
      alert('❌ เกิดข้อผิดพลาด: ' + error.message);
    }
  };

  const handleEdit = (group) => {
    setEditingGroup(group);
    setFormData({
      id: group.id,
      name: group.name,
      ageMin: group.ageMin,
      ageMax: group.ageMax,
      description: group.description || '',
      emoji: group.emoji || '📌',
      color: group.color || '#3b82f6'
    });
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!confirm(`แน่ใจหรือไม่ที่จะลบกลุ่มอายุ "${id}"?\n\n⚠️ คำเตือน: เนื้อหาที่เชื่อมกับกลุ่มนี้จะไม่แสดงผล!`)) return;

    try {
      await deleteDoc(doc(db, 'age_groups', id));
      alert('✅ ลบกลุ่มอายุสำเร็จ!');
      fetchAgeGroups();
    } catch (error) {
      console.error('Error deleting age group:', error);
      alert('❌ เกิดข้อผิดพลาด: ' + error.message);
    }
  };

  const resetForm = () => {
    setFormData({
      id: '',
      name: '',
      ageMin: 0,
      ageMax: 100,
      description: '',
      emoji: '📌',
      color: '#3b82f6'
    });
    setEditingGroup(null);
    setShowForm(false);
  };

  return (
    <motion.div 
      className={`age-group-admin-overlay ${standalone ? 'standalone' : ''}`}
      initial={standalone ? false : { opacity: 0 }}
      animate={standalone ? false : { opacity: 1 }}
    >
      <motion.div 
        className={`age-group-admin ${standalone ? 'standalone' : ''}`}
        initial={standalone ? false : { scale: 0.9, opacity: 0 }}
        animate={standalone ? false : { scale: 1, opacity: 1 }}
      >
        <div className="admin-header">
          <h1>🎯 จัดการช่วงอายุ (Age Groups)</h1>
          {!standalone && <button className="close-btn" onClick={onClose}>✕</button>}
        </div>

        <div className="admin-actions">
          <button 
            className="btn-add"
            onClick={() => {
              resetForm();
              setShowForm(!showForm);
            }}
          >
            {showForm ? '❌ ยกเลิก' : '➕ เพิ่มช่วงอายุใหม่'}
          </button>
          <button className="btn-refresh" onClick={fetchAgeGroups}>
            🔄 รีเฟรช
          </button>
        </div>

        {/* Form */}
        {showForm && (
          <motion.form 
            className="age-group-form"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            onSubmit={handleSubmit}
          >
            <h2>{editingGroup ? '✏️ แก้ไขช่วงอายุ' : '➕ เพิ่มช่วงอายุใหม่'}</h2>
            
            <div className="form-row">
              <div className="form-group">
                <label>ID (ภาษาอังกฤษ) *</label>
                <input
                  type="text"
                  value={formData.id}
                  onChange={(e) => setFormData({ ...formData, id: e.target.value.toUpperCase().replace(/\s/g, '_') })}
                  placeholder="GEN_ALPHA"
                  required
                  pattern="[A-Z_]+"
                  title="ใช้ภาษาอังกฤษตัวใหญ่ และ _ เท่านั้น"
                />
                <small className={editingGroup ? 'warning' : ''}>
                  {editingGroup ? '⚠️ การเปลี่ยน ID จะสร้าง document ใหม่' : 'ใช้เป็น Key ใน database'}
                </small>
              </div>

              <div className="form-group">
                <label>ชื่อกลุ่ม *</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Gen Alpha"
                  required
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>อายุต่ำสุด *</label>
                <input
                  type="number"
                  min="0"
                  max="150"
                  value={formData.ageMin}
                  onChange={(e) => setFormData({ ...formData, ageMin: e.target.value === '' ? '' : Number(e.target.value) })}
                  onBlur={(e) => setFormData({ ...formData, ageMin: Number(e.target.value) || 0 })}
                  required
                />
              </div>

              <div className="form-group">
                <label>อายุสูงสุด *</label>
                <input
                  type="number"
                  min="0"
                  max="150"
                  value={formData.ageMax}
                  onChange={(e) => setFormData({ ...formData, ageMax: e.target.value === '' ? '' : Number(e.target.value) })}
                  onBlur={(e) => setFormData({ ...formData, ageMax: Number(e.target.value) || 0 })}
                  required
                />
              </div>

              <div className="form-group">
                <label>Emoji</label>
                <input
                  type="text"
                  value={formData.emoji}
                  onChange={(e) => setFormData({ ...formData, emoji: e.target.value })}
                  placeholder="🎓"
                  maxLength="2"
                />
              </div>

              <div className="form-group">
                <label>สีประจำกลุ่ม</label>
                <input
                  type="color"
                  value={formData.color}
                  onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                />
              </div>
            </div>

            <div className="form-group">
              <label>คำอธิบาย</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows="3"
                placeholder="เนื้อหาสำหรับวัยรุ่น เช่น สาขาวิชา ทุน โปรโมชั่น"
              />
            </div>

            <div className="form-actions">
              <button type="submit" className="btn-save">
                {editingGroup ? '💾 บันทึกการแก้ไข' : '➕ เพิ่มช่วงอายุ'}
              </button>
              <button 
                type="button" 
                className="btn-cancel"
                onClick={resetForm}
              >
                ยกเลิก
              </button>
            </div>
          </motion.form>
        )}

        {/* Age Groups List */}
        <div className="age-groups-list">
          <h2>📋 รายการช่วงอายุ ({ageGroups.length})</h2>
          
          {loading ? (
            <div className="loading">
              <div className="spinner"></div>
              <p>กำลังโหลด...</p>
            </div>
          ) : ageGroups.length === 0 ? (
            <div className="empty-state">
              <p>ยังไม่มีช่วงอายุ</p>
              <p>คลิก "เพิ่มช่วงอายุใหม่" เพื่อเริ่มต้น</p>
            </div>
          ) : (
            <div className="age-groups-grid">
              {ageGroups.map(group => (
                <motion.div 
                  key={group.id} 
                  className="age-group-card"
                  style={{ borderLeftColor: group.color }}
                  whileHover={{ scale: 1.02 }}
                >
                  <div className="card-header">
                    <div className="group-info">
                      <span className="emoji">{group.emoji}</span>
                      <div>
                        <h3>{group.name}</h3>
                        <span className="group-id">ID: {group.id}</span>
                      </div>
                    </div>
                    <div className="age-range" style={{ backgroundColor: group.color }}>
                      {group.ageMin}-{group.ageMax} ปี
                    </div>
                  </div>
                  
                  {group.description && (
                    <p className="description">{group.description}</p>
                  )}
                  
                  <div className="card-actions">
                    <button 
                      className="btn-edit"
                      onClick={() => handleEdit(group)}
                    >
                      ✏️ แก้ไข
                    </button>
                    <button 
                      className="btn-delete"
                      onClick={() => handleDelete(group.id)}
                    >
                      🗑️ ลบ
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}
