import cv2
import json
import numpy as np

img = cv2.imread('snakeskin.jpg')
gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)

_, thresh = cv2.threshold(gray, 60, 255, cv2.THRESH_BINARY)
contours, hierarchy = cv2.findContours(thresh, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)

valid_scales = []
height, width = gray.shape

for cnt in contours:
    area = cv2.contourArea(cnt)
    if area > 1000: 
        epsilon = 0.005 * cv2.arcLength(cnt, True)
        approx = cv2.approxPolyDP(cnt, epsilon, True)
        
        points = []
        for p in approx:
            x, y = p[0]
            points.append({"x": float(x)/width, "y": float(y)/height})
            
        M = cv2.moments(cnt)
        if M["m00"] != 0:
            cx = M["m10"] / M["m00"]
            cy = M["m01"] / M["m00"]
            valid_scales.append({
                "center": {"x": float(cx)/width, "y": float(cy)/height},
                "points": points
            })

print(f"Found {len(valid_scales)} valid scales")
with open('scales.json', 'w') as f:
    json.dump(valid_scales, f)
