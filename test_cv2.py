import cv2
import json
import numpy as np

img = cv2.imread('snakeskin.jpg')

# Using the Green channel might provide better contrast since it's a green snake
b, g, r = cv2.split(img)

# Use adaptive thresholding to handle uneven lighting
thresh = cv2.adaptiveThreshold(g, 255, cv2.ADAPTIVE_THRESH_GAUSSIAN_C, cv2.THRESH_BINARY, 51, 5)

# A morphological open operation removes tiny connections between scales
kernel = np.ones((5,5), np.uint8)
opened = cv2.morphologyEx(thresh, cv2.MORPH_OPEN, kernel)

contours, hierarchy = cv2.findContours(opened, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)

valid_scales = []
height, width = g.shape

# Let's save a debug image to see the contours
debug_img = img.copy()

for cnt in contours:
    area = cv2.contourArea(cnt)
    if area > 400: # Smaller threshold for smaller edge scales
        epsilon = 0.005 * cv2.arcLength(cnt, True)
        approx = cv2.approxPolyDP(cnt, epsilon, True)
        
        cv2.drawContours(debug_img, [approx], -1, (0, 0, 255), 2)
        
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
cv2.imwrite('debug_contours.jpg', debug_img)
with open('scales.json', 'w') as f:
    json.dump(valid_scales, f)
