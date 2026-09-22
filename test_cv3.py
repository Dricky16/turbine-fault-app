import cv2
import json
import numpy as np

img = cv2.imread('snakeskin.jpg')

# Using the Green channel
b, g, r = cv2.split(img)

# Use adaptive thresholding to capture scales even in the dark shadows on the edges
thresh = cv2.adaptiveThreshold(g, 255, cv2.ADAPTIVE_THRESH_GAUSSIAN_C, cv2.THRESH_BINARY, 61, 2)

# Morphological closing to fill small holes inside scales, and opening to separate them
kernel = np.ones((3,3), np.uint8)
opened = cv2.morphologyEx(thresh, cv2.MORPH_OPEN, kernel, iterations=2)

contours, hierarchy = cv2.findContours(opened, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)

valid_scales = []
height, width = g.shape

for cnt in contours:
    area = cv2.contourArea(cnt)
    # Lower area threshold to catch the tiny cut-off scales at the edges
    if area > 100 and area < (width * height * 0.1): 
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
