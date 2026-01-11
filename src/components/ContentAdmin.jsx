import React, { useState, useEffect } from 'react';
import { 
  collection, 
  getDocs, 
  addDoc, 
  updateDoc,
  deleteDoc,
  doc,
  query,
  orderBy
} from 'firebase/firestore';
import { db } from '../firebase';
import './ContentAdmin.css';

export default function ContentAdmin({ onClose, standalone = false }) {
  const [contents, setContents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingContent, setEditingContent] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    type: 'scholarship',
    ageGroupId: '',
    priority: 5,
    tags: '',
    imageUrl: '',
    isActive: true
  });

  const contentTypes = [
    { id: 'scholarship', name: 'ทุนการศึกษา', icon: '🎓' },
    { id: 'news', name: 'ข่าวสารทั่วไป', icon: '📰' },
    { id: 'sports', name: 'ข่าวกีฬา', icon: '🏅' },
    { id: 'event', name: 'กิจกรรม', icon: '🎉' },
    { id: 'competition', name: 'การแข่งขัน', icon: '🏆' },
    { id: 'promotion', name: 'โปรโมชั่น', icon: '🎁' },
    { id: 'career', name: 'สาขาวิชา', icon: '💼' },
    { id: 'activity', name: 'กิจกรรมนักศึกษา', icon: '⚽' },
    { id: 'workshop', name: 'เวิร์คช็อป/อบรม', icon: '🛠️' },
    { id: 'seminar', name: 'สัมมนา', icon: '📚' },
    { id: 'kids_program', name: 'กิจกรรมเด็ก', icon: '🎨' },
    { id: 'announcement', name: 'ประกาศ', icon: '📢' }
  ];

  const [ageGroups, setAgeGroups] = useState([]);
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    // Lazy load - only fetch when component mounts
    if (!isInitialized) {
      setIsInitialized(true);
      fetchContents();
      fetchAgeGroups();
    }
  }, [isInitialized]);

  const fetchAgeGroups = async () => {
    if (!db) {
      console.warn('⚠️ Firebase not configured - using default age groups');
      setAgeGroups([
        { id: 'KIDS_3_12', name: 'เด็ก', emoji: '👶', ageMin: 3, ageMax: 12 },
        { id: 'TEENS_13_17', name: 'วัยรุ่น', emoji: '🧒', ageMin: 13, ageMax: 17 },
        { id: 'ADULTS_18_PLUS', name: 'ผู้ใหญ่', emoji: '👨', ageMin: 18, ageMax: 100 }
      ]);
      return;
    }
    try {
      const ageGroupsRef = collection(db, 'age_groups');
      const snapshot = await getDocs(ageGroupsRef);
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      data.sort((a, b) => a.ageMin - b.ageMin);
      setAgeGroups(data);
      
      if (data.length === 0) {
        console.warn('⚠️ No age groups found, please add them in Firebase');
      }
    } catch (error) {
      console.error('Error fetching age groups:', error);
    }
  };

  const fetchContents = async () => {
    if (!db) {
      setLoading(false);
      alert('⚠️ Firebase ยังไม่ได้ตั้งค่า\n\nกรุณาตั้งค่า Firebase ใน src/config.js ก่อนใช้งาน Admin Panel\n\nดูคำแนะนำได้ที่: FIREBASE_SETUP.md');
      return;
    }
    try {
      setLoading(true);
      const contentRef = collection(db, 'content_items');
      const q = query(contentRef, orderBy('createdAt', 'desc'));
      const snapshot = await getDocs(q);
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setContents(data);
    } catch (error) {
      console.error('Error fetching contents:', error);
      alert('เกิดข้อผิดพลาดในการโหลดข้อมูล: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!db) {
      alert('⚠️ Firebase ยังไม่ได้ตั้งค่า');
      return;
    }
    
    try {
      const contentData = {
        ...formData,
        tags: formData.tags.split(',').map(t => t.trim()).filter(t => t),
        createdAt: editingContent ? editingContent.createdAt : new Date(),
        updatedAt: new Date(),
        viewCount: editingContent ? editingContent.viewCount : 0,
        clickCount: editingContent ? editingContent.clickCount : 0
      };

      if (editingContent) {
        // Update existing
        const docRef = doc(db, 'content_items', editingContent.id);
        await updateDoc(docRef, contentData);
        alert('✅ อัปเดตข้อมูลสำเร็จ!');
      } else {
        // Create new
        await addDoc(collection(db, 'content_items'), contentData);
        alert('✅ เพิ่มข้อมูลสำเร็จ!');
      }

      // Reset form
      setFormData({
        title: '',
        description: '',
        type: 'scholarship',
        ageGroupId: '',
        priority: 5,
        tags: '',
        imageUrl: '',
        isActive: true
      });
      setEditingContent(null);
      setShowForm(false);
      fetchContents();

    } catch (error) {
      console.error('Error saving content:', error);
      alert('❌ เกิดข้อผิดพลาด: ' + error.message);
    }
  };

  const handleEdit = (content) => {
    setEditingContent(content);
    setFormData({
      title: content.title,
      description: content.description,
      type: content.type,
      ageGroupId: content.ageGroupId || '',
      priority: content.priority,
      tags: content.tags ? content.tags.join(', ') : '',
      imageUrl: content.imageUrl || '',
      isActive: content.isActive
    });
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!confirm('แน่ใจหรือไม่ที่จะลบข้อมูลนี้?')) return;

    try {
      await deleteDoc(doc(db, 'content_items', id));
      alert('✅ ลบข้อมูลสำเร็จ!');
      fetchContents();
    } catch (error) {
      console.error('Error deleting content:', error);
      alert('❌ เกิดข้อผิดพลาด: ' + error.message);
    }
  };

  const toggleActive = async (content) => {
    try {
      const docRef = doc(db, 'content_items', content.id);
      await updateDoc(docRef, { isActive: !content.isActive });
      fetchContents();
    } catch (error) {
      console.error('Error toggling active:', error);
    }
  };

  return (
    <div 
      className={`content-admin-overlay ${standalone ? 'standalone' : ''}`}
    >
      <div 
        className={`content-admin ${standalone ? 'standalone' : ''}`}
      >
        <div className="admin-header">
          <h1>🎯 จัดการเนื้อหา Content Management</h1>
          {!standalone && <button className="close-btn" onClick={onClose}>✕</button>}
        </div>

        <div className="admin-actions">
          <button 
            className="btn-add"
            onClick={() => {
              setShowForm(!showForm);
              setEditingContent(null);
              setFormData({
                title: '',
                description: '',
                type: 'scholarship',
                ageGroupId: '',
                priority: 5,
                tags: '',
                imageUrl: '',
                isActive: true
              });
            }}
          >
            {showForm ? '❌ ยกเลิก' : '➕ เพิ่มเนื้อหาใหม่'}
          </button>
          <button className="btn-refresh" onClick={fetchContents}>
            🔄 รีเฟรช
          </button>
        </div>

        {/* Form */}
        {showForm && (
          <form 
            className="content-form"
            onSubmit={handleSubmit}
          >
            <h2>{editingContent ? '✏️ แก้ไขเนื้อหา' : '➕ เพิ่มเนื้อหาใหม่'}</h2>
            
            <div className="form-row">
              <div className="form-group">
                <label>หัวข้อ *</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  required
                  placeholder="เช่น ทุนการศึกษา 100%"
                />
              </div>
            </div>

            <div className="form-group">
              <label>คำอธิบาย *</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                required
                rows="4"
                placeholder="รายละเอียดเนื้อหา..."
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>ประเภท</label>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                >
                  {contentTypes.map(type => (
                    <option key={type.id} value={type.id}>
                      {type.icon} {type.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label>กลุ่มอายุ *</label>
                <select
                  value={formData.ageGroupId}
                  onChange={(e) => setFormData({ ...formData, ageGroupId: e.target.value })}
                  required
                >
                  <option value="">-- เลือกกลุ่มอายุ --</option>
                  {ageGroups.map(group => (
                    <option key={group.id} value={group.id}>
                      {group.emoji} {group.name} ({group.ageMin}-{group.ageMax} ปี)
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label>ลำดับความสำคัญ (1-10)</label>
                <input
                  type="number"
                  min="1"
                  max="10"
                  value={formData.priority}
                  onChange={(e) => setFormData({ ...formData, priority: parseInt(e.target.value) })}
                />
              </div>
            </div>

            <div className="form-group">
              <label>Tags (คั่นด้วยเครื่องหมายจุลภาค)</label>
              <input
                type="text"
                value={formData.tags}
                onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                placeholder="ทุน, การศึกษา, ฟรี"
              />
            </div>

            <div className="form-group">
              <label>URL รูปภาพ (ถ้ามี)</label>
              <input
                type="url"
                value={formData.imageUrl}
                onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                placeholder="https://example.com/image.jpg"
              />
            </div>

            <div className="form-group checkbox">
              <label>
                <input
                  type="checkbox"
                  checked={formData.isActive}
                  onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                />
                เปิดใช้งาน
              </label>
            </div>

            <div className="form-actions">
              <button type="submit" className="btn-save">
                {editingContent ? '💾 บันทึกการแก้ไข' : '➕ เพิ่มเนื้อหา'}
              </button>
              <button 
                type="button" 
                className="btn-cancel"
                onClick={() => {
                  setShowForm(false);
                  setEditingContent(null);
                }}
              >
                ยกเลิก
              </button>
            </div>
          </form>
        )}

        {/* Content List */}
        <div className="content-list">
          <h2>📋 รายการเนื้อหาทั้งหมด ({contents.length})</h2>
          
          {loading ? (
            <div className="loading">
              <div className="spinner"></div>
              <p>กำลังโหลด...</p>
            </div>
          ) : contents.length === 0 ? (
            <div className="empty-state">
              <p>ยังไม่มีเนื้อหา</p>
              <p>คลิก "เพิ่มเนื้อหาใหม่" เพื่อเริ่มต้น</p>
            </div>
          ) : (
            <div className="content-grid">
              {contents.map(content => (
                <div 
                  key={content.id} 
                  className={`content-card ${!content.isActive ? 'inactive' : ''}`}
                >
                  <div className="card-header">
                    <span className="type-badge">
                      {contentTypes.find(t => t.id === content.type)?.icon} {content.type}
                    </span>
                    <span className="age-badge">
                      {ageGroups.find(g => g.id === content.ageGroupId)?.emoji || '📌'} 
                      {ageGroups.find(g => g.id === content.ageGroupId)?.name || content.ageGroupId}
                    </span>
                  </div>
                  
                  <h3>{content.title}</h3>
                  <p className="description">{content.description}</p>
                  
                  <div className="card-meta">
                    <span>🔥 Priority: {content.priority}</span>
                    <span>👁️ Views: {content.viewCount || 0}</span>
                    <span>🖱️ Clicks: {content.clickCount || 0}</span>
                  </div>
                  
                  {content.tags && content.tags.length > 0 && (
                    <div className="tags">
                      {content.tags.map((tag, idx) => (
                        <span key={idx} className="tag">#{tag}</span>
                      ))}
                    </div>
                  )}
                  
                  <div className="card-actions">
                    <button 
                      className="btn-toggle"
                      onClick={() => toggleActive(content)}
                    >
                      {content.isActive ? '✅ เปิด' : '❌ ปิด'}
                    </button>
                    <button 
                      className="btn-edit"
                      onClick={() => handleEdit(content)}
                    >
                      ✏️ แก้ไข
                    </button>
                    <button 
                      className="btn-delete"
                      onClick={() => handleDelete(content.id)}
                    >
                      🗑️ ลบ
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
