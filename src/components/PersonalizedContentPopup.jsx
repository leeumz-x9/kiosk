import React, { useState, useEffect } from 'react';
import { collection, query, where, getDocs, orderBy, limit } from 'firebase/firestore';
import { db } from '../firebase';
import './PersonalizedContentPopup.css';

const PersonalizedContentPopup = ({ userProfile, onClose }) => {
  const [contents, setContents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (userProfile) {
      fetchPersonalizedContent();
    }
  }, [userProfile]);

  const getAgeGroupId = (age) => {
    if (age >= 3 && age <= 12) return 'KIDS_3_12';
    if (age >= 13 && age <= 17) return 'TEENS_13_17';
    if (age >= 18) return 'ADULTS_18_PLUS';
    return 'ADULTS_18_PLUS'; // default
  };

  const getRecommendedCategories = (age, gender, emotion) => {
    const categories = [];
    
    // Based on age
    if (age >= 3 && age <= 12) {
      categories.push('activity', 'event', 'kids_program');
    } else if (age >= 13 && age <= 17) {
      categories.push('scholarship', 'event', 'sports', 'competition');
    } else {
      categories.push('scholarship', 'career', 'news', 'promotion');
    }

    // Based on emotion
    if (emotion === 'happy') {
      categories.push('event', 'promotion', 'activity');
    } else if (emotion === 'neutral') {
      categories.push('news', 'career', 'scholarship');
    }

    return [...new Set(categories)]; // Remove duplicates
  };

  const fetchPersonalizedContent = async () => {
    if (!db || !userProfile) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      
      const { age, gender, expression } = userProfile;
      const ageGroupId = getAgeGroupId(age);
      const recommendedCategories = getRecommendedCategories(age, gender, expression);

      console.log('🎯 Fetching personalized content for:', {
        age,
        gender,
        expression,
        ageGroupId,
        categories: recommendedCategories
      });

      const contentRef = collection(db, 'content_items');
      
      // Query 1: Get content for age group
      const q1 = query(
        contentRef,
        where('ageGroupId', '==', ageGroupId),
        where('isActive', '==', true),
        orderBy('priority', 'desc'),
        limit(10)
      );

      const snapshot = await getDocs(q1);
      let fetchedContents = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      // Filter by recommended categories if available
      if (recommendedCategories.length > 0) {
        const categorized = fetchedContents.filter(item => 
          recommendedCategories.includes(item.type)
        );
        
        // If we have categorized content, use it. Otherwise use all.
        if (categorized.length > 0) {
          fetchedContents = categorized;
        }
      }

      // Sort by priority
      fetchedContents.sort((a, b) => (b.priority || 0) - (a.priority || 0));

      // Limit to top 5
      setContents(fetchedContents.slice(0, 5));

      console.log(`✅ Found ${fetchedContents.length} personalized contents`);
    } catch (error) {
      console.error('❌ Error fetching personalized content:', error);
    } finally {
      setLoading(false);
    }
  };

  const getEmotionGreeting = () => {
    const emotion = userProfile?.expression || 'neutral';
    const age = userProfile?.age || 20;
    const gender = userProfile?.gender || 'unknown';

    const greetings = {
      happy: '😊 ยินดีต้อนรับค่ะ! เห็นคุณร่าเริงดีจัง',
      sad: '🤗 สวัสดีค่ะ หวังว่าข้อมูลเหล่านี้จะช่วยให้คุณรู้สึกดีขึ้น',
      angry: '😌 สวัสดีค่ะ ขอแนะนำข้อมูลที่น่าสนใจให้',
      surprised: '😮 สวัสดีค่ะ! มีข้อมูลน่าแปลกใจมากมาย',
      neutral: '👋 สวัสดีค่ะ มีข้อมูลที่น่าสนใจสำหรับคุณ'
    };

    return greetings[emotion] || greetings.neutral;
  };

  const getAgeLabel = () => {
    const age = userProfile?.age || 20;
    if (age >= 3 && age <= 12) return '👶 เด็ก';
    if (age >= 13 && age <= 17) return '🧒 วัยรุ่น';
    return '👨 ผู้ใหญ่';
  };

  const getTypeIcon = (type) => {
    const icons = {
      scholarship: '🎓',
      news: '📰',
      event: '🎉',
      promotion: '🎁',
      career: '💼',
      activity: '⚽',
      sports: '🏅',
      competition: '🏆',
      kids_program: '🎨',
      workshop: '🛠️',
      seminar: '📚'
    };
    return icons[type] || '📌';
  };

  const getTypeName = (type) => {
    const names = {
      scholarship: 'ทุนการศึกษา',
      news: 'ข่าวสาร',
      event: 'กิจกรรม',
      promotion: 'โปรโมชั่น',
      career: 'สาขาวิชา',
      activity: 'กิจกรรมนักศึกษา',
      sports: 'ข่าวกีฬา',
      competition: 'การแข่งขัน',
      kids_program: 'กิจกรรมเด็ก',
      workshop: 'เวิร์คช็อป',
      seminar: 'สัมมนา'
    };
    return names[type] || type;
  };

  const handleNext = () => {
    if (currentIndex < contents.length - 1) {
      setCurrentIndex(currentIndex + 1);
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };

  const currentContent = contents[currentIndex];

  if (!userProfile) return null;

  return (
    <div className="personalized-popup-overlay" onClick={onClose}>
      <div className="personalized-popup-container" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="popup-header">
          <div className="popup-header-content">
            <h2>{getEmotionGreeting()}</h2>
            <div className="user-profile-info">
              <span className="profile-badge">{getAgeLabel()}</span>
              <span className="profile-badge">
                {userProfile.gender === 'male' ? '👨 ชาย' : '👩 หญิง'}
              </span>
              <span className="profile-badge age-badge">
                {userProfile.age} ปี
              </span>
            </div>
          </div>
          <button className="popup-close-btn" onClick={onClose}>
            ✕
          </button>
        </div>

        {/* Content */}
        <div className="popup-content">
          {loading ? (
            <div className="popup-loading">
              <div className="loading-spinner"></div>
              <p>🔍 กำลังค้นหาข้อมูลที่เหมาะกับคุณ...</p>
            </div>
          ) : contents.length === 0 ? (
            <div className="popup-no-content">
              <div className="no-content-icon">📭</div>
              <h3>ไม่พบข้อมูลที่เหมาะสม</h3>
              <p>ขณะนี้ยังไม่มีข้อมูลสำหรับช่วงอายุของคุณ</p>
              <p className="hint-text">แต่เรามีข้อมูลอื่นๆ มากมาย ลองสำรวจดูนะคะ!</p>
            </div>
          ) : (
            <>
              {/* Current Content Card */}
              <div className="content-card">
                <div className="content-card-header">
                  <span className="content-type-badge">
                    {getTypeIcon(currentContent.type)} {getTypeName(currentContent.type)}
                  </span>
                  {currentContent.priority >= 8 && (
                    <span className="priority-badge">🔥 แนะนำ</span>
                  )}
                </div>

                {currentContent.imageUrl && (
                  <div className="content-image">
                    <img src={currentContent.imageUrl} alt={currentContent.title} />
                  </div>
                )}

                <div className="content-body">
                  <h3 className="content-title">{currentContent.title}</h3>
                  <p className="content-description">{currentContent.description}</p>

                  {currentContent.tags && (
                    <div className="content-tags">
                      {currentContent.tags.split(' ').filter(t => t).map((tag, idx) => (
                        <span key={idx} className="tag">#{tag}</span>
                      ))}
                    </div>
                  )}
                </div>

                <div className="content-footer">
                  <button className="btn-interested">
                    ✨ สนใจ
                  </button>
                  <button className="btn-more-info">
                    📖 อ่านเพิ่มเติม
                  </button>
                </div>
              </div>

              {/* Navigation */}
              {contents.length > 1 && (
                <div className="popup-navigation">
                  <button 
                    className="nav-btn" 
                    onClick={handlePrev}
                    disabled={currentIndex === 0}
                  >
                    ← ก่อนหน้า
                  </button>
                  <span className="nav-indicator">
                    {currentIndex + 1} / {contents.length}
                  </span>
                  <button 
                    className="nav-btn"
                    onClick={handleNext}
                    disabled={currentIndex === contents.length - 1}
                  >
                    ถัดไป →
                  </button>
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer */}
        <div className="popup-footer">
          <p>💡 ข้อมูลเหล่านี้แนะนำตามอายุและความสนใจของคุณ</p>
        </div>
      </div>
    </div>
  );
};

export default PersonalizedContentPopup;
