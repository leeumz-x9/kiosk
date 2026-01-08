"""
Face Analysis with Age, Gender, and Emotion Detection
Using DeepFace library for comprehensive face analysis
"""

import cv2
import numpy as np
from deepface import DeepFace
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


class FaceAnalyzer:
    """Analyze faces for age, gender, and emotions"""
    
    def __init__(self):
        """Initialize the face analyzer"""
        self.face_cascade = cv2.CascadeClassifier(
            cv2.data.haarcascades + 'haarcascade_frontalface_default.xml'
        )
        logger.info("✅ Face Analyzer initialized")
    
    def detect_faces(self, frame):
        """
        Detect faces in the given frame
        
        Args:
            frame: Input image frame (numpy array)
            
        Returns:
            List of face bounding boxes [(x, y, w, h), ...]
        """
        gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
        faces = self.face_cascade.detectMultiScale(
            gray,
            scaleFactor=1.1,
            minNeighbors=5,
            minSize=(30, 30)
        )
        return faces
    
    def analyze_face(self, frame):
        """
        Analyze face for age, gender, and emotion
        
        Args:
            frame: Input image frame (numpy array)
            
        Returns:
            Dictionary with analysis results:
            {
                'age': int,
                'gender': str ('Male' or 'Female'),
                'emotion': str,
                'dominant_emotion': str,
                'all_emotions': dict,
                'faces_detected': int,
                'face_regions': list
            }
        """
        try:
            # Detect faces first
            faces = self.detect_faces(frame)
            
            if len(faces) == 0:
                return {
                    'success': False,
                    'error': 'No face detected',
                    'faces_detected': 0
                }
            
            # Use DeepFace for comprehensive analysis
            # Actions: age, gender, emotion, race
            analysis = DeepFace.analyze(
                frame,
                actions=['age', 'gender', 'emotion'],
                enforce_detection=False,
                detector_backend='opencv'
            )
            
            # Handle single face or multiple faces
            if isinstance(analysis, list):
                result = analysis[0]  # Take first face
            else:
                result = analysis
            
            # Extract information
            age = result.get('age', 'Unknown')
            gender = result.get('dominant_gender', 'Unknown')
            emotion = result.get('dominant_emotion', 'Unknown')
            all_emotions = result.get('emotion', {})
            
            # Get face region
            region = result.get('region', {})
            
            return {
                'success': True,
                'age': int(age) if isinstance(age, (int, float)) else None,
                'gender': gender.capitalize(),
                'emotion': emotion.capitalize(),
                'dominant_emotion': emotion.capitalize(),
                'all_emotions': all_emotions,
                'faces_detected': len(faces),
                'face_regions': [{
                    'x': int(region.get('x', 0)),
                    'y': int(region.get('y', 0)),
                    'width': int(region.get('w', 0)),
                    'height': int(region.get('h', 0))
                }],
                'confidence': {
                    'gender': result.get('gender', {}).get(gender, 0) if isinstance(result.get('gender'), dict) else 0,
                    'emotion': all_emotions.get(emotion, 0) if all_emotions else 0
                }
            }
            
        except Exception as e:
            logger.error(f"❌ Error analyzing face: {e}")
            return {
                'success': False,
                'error': str(e),
                'faces_detected': 0
            }
    
    def analyze_frame_with_detection(self, frame):
        """
        Analyze frame and return both detection and analysis results
        
        Args:
            frame: Input image frame (numpy array)
            
        Returns:
            Dictionary with complete analysis including face detection boxes
        """
        # First detect faces
        faces = self.detect_faces(frame)
        
        if len(faces) == 0:
            return {
                'success': False,
                'error': 'No human face detected',
                'faces_detected': 0,
                'is_human': False
            }
        
        # Then analyze the face
        analysis = self.analyze_face(frame)
        
        # Add detection boxes
        if analysis.get('success'):
            analysis['detection_boxes'] = [
                {
                    'x': int(x),
                    'y': int(y),
                    'width': int(w),
                    'height': int(h)
                }
                for (x, y, w, h) in faces
            ]
            analysis['is_human'] = True
        
        return analysis
    
    def draw_analysis_on_frame(self, frame, analysis):
        """
        Draw analysis results on the frame
        
        Args:
            frame: Input image frame (numpy array)
            analysis: Analysis results from analyze_face()
            
        Returns:
            Frame with drawn annotations
        """
        if not analysis.get('success'):
            return frame
        
        # Draw face rectangles
        for box in analysis.get('detection_boxes', []):
            x, y, w, h = box['x'], box['y'], box['width'], box['height']
            
            # Draw rectangle
            cv2.rectangle(frame, (x, y), (x + w, y + h), (0, 255, 0), 2)
            
            # Prepare text
            age = analysis.get('age', 'N/A')
            gender = analysis.get('gender', 'N/A')
            emotion = analysis.get('emotion', 'N/A')
            
            # Draw text background
            text = f"Age: {age} | Gender: {gender}"
            text2 = f"Mood: {emotion}"
            
            cv2.rectangle(frame, (x, y - 60), (x + w, y), (0, 0, 0), -1)
            
            # Draw text
            cv2.putText(frame, text, (x + 5, y - 35),
                       cv2.FONT_HERSHEY_SIMPLEX, 0.5, (255, 255, 255), 1)
            cv2.putText(frame, text2, (x + 5, y - 15),
                       cv2.FONT_HERSHEY_SIMPLEX, 0.5, (0, 255, 255), 1)
        
        return frame


# Singleton instance
_face_analyzer = None


def get_face_analyzer():
    """Get or create the face analyzer instance"""
    global _face_analyzer
    if _face_analyzer is None:
        _face_analyzer = FaceAnalyzer()
    return _face_analyzer
