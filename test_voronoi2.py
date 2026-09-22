import cv2
import json
import numpy as np
from scipy.spatial import Voronoi

img = cv2.imread('snakeskin_uniform.jpg')
b, g, r = cv2.split(img)

thresh = cv2.adaptiveThreshold(g, 255, cv2.ADAPTIVE_THRESH_GAUSSIAN_C, cv2.THRESH_BINARY, 41, 2)
kernel = np.ones((3,3), np.uint8)
opened = cv2.morphologyEx(thresh, cv2.MORPH_OPEN, kernel, iterations=1)
contours, hierarchy = cv2.findContours(opened, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)

centers = []
height, width = g.shape

for cnt in contours:
    area = cv2.contourArea(cnt)
    if area > 50 and area < (width * height * 0.05): 
        M = cv2.moments(cnt)
        if M["m00"] != 0:
            cx = M["m10"] / M["m00"]
            cy = M["m01"] / M["m00"]
            centers.append([float(cx)/width, float(cy)/height])

# Add dummy points far outside the image to bound the Voronoi cells on the edges
centers.extend([
    [-1, -1], [2, -1], [-1, 2], [2, 2],
    [0.5, -1], [0.5, 2], [-1, 0.5], [2, 0.5]
])

centers_np = np.array(centers)
vor = Voronoi(centers_np)

valid_scales = []

for point_idx, region_idx in enumerate(vor.point_region):
    # Ignore the dummy boundary points
    if point_idx >= len(centers) - 8:
        continue
        
    region = vor.regions[region_idx]
    if not region or -1 in region:
        continue
        
    polygon = [vor.vertices[i] for i in region]
    
    points = [{"x": float(p[0]), "y": float(p[1])} for p in polygon]
    
    valid_scales.append({
        "center": {"x": float(centers[point_idx][0]), "y": float(centers[point_idx][1])},
        "points": points
    })

print(f"Generated {len(valid_scales)} Voronoi cells")
with open('scales_v7.json', 'w') as f:
    json.dump(valid_scales, f)
