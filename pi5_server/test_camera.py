import cv2
import time

print("Testing camera...")
cap = cv2.VideoCapture(0, cv2.CAP_V4L2)
print(f"Camera opened: {cap.isOpened()}")

if cap.isOpened():
    time.sleep(1)
    ret, frame = cap.read()
    print(f"Read result: {ret}")
    if ret:
        print(f"Frame shape: {frame.shape}")
    else:
        print("Failed to read frame")
else:
    print("Failed to open camera")

cap.release()
print("Done")
