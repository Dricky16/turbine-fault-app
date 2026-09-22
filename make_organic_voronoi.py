import json
import numpy as np
from scipy.spatial import Voronoi

width, height = 1920, 1080
cols, rows = 45, 30
col_spacing = width / cols
row_spacing = height / rows

centers = []
for row in range(rows):
    for col in range(cols):
        # Staggered grid
        x = col * col_spacing
        if row % 2 != 0:
            x += col_spacing / 2
        y = row * row_spacing
        
        # Jitter to make it organic
        x += np.random.uniform(-col_spacing*0.3, col_spacing*0.3)
        y += np.random.uniform(-row_spacing*0.3, row_spacing*0.3)
        
        centers.append([x / width, y / height])

# Add bounding box points far away
centers.extend([
    [-1, -1], [2, -1], [-1, 2], [2, 2],
    [0.5, -1], [0.5, 2], [-1, 0.5], [2, 0.5]
])

centers_np = np.array(centers)
vor = Voronoi(centers_np)

valid_scales = []

# Smooth polygon corners (Chaikin's algorithm)
def smooth_polygon(points, iterations=2):
    for _ in range(iterations):
        new_points = []
        for i in range(len(points)):
            p1 = points[i]
            p2 = points[(i+1)%len(points)]
            
            q = [0.75*p1[0] + 0.25*p2[0], 0.75*p1[1] + 0.25*p2[1]]
            r = [0.25*p1[0] + 0.75*p2[0], 0.25*p1[1] + 0.75*p2[1]]
            
            new_points.append(q)
            new_points.append(r)
        points = new_points
    return points

for point_idx, region_idx in enumerate(vor.point_region):
    if point_idx >= len(centers) - 8:
        continue
        
    region = vor.regions[region_idx]
    if not region or -1 in region:
        continue
        
    polygon = [vor.vertices[i] for i in region]
    smoothed = smooth_polygon(polygon, 2)
    
    # Check if bounds are somewhat inside screen
    cx, cy = centers[point_idx]
    if cx < -0.1 or cx > 1.1 or cy < -0.1 or cy > 1.1:
        continue
        
    points_dict = [{"x": float(p[0]), "y": float(p[1])} for p in smoothed]
    
    valid_scales.append({
        "center": {"x": float(cx), "y": float(cy)},
        "points": points_dict
    })

print(f"Generated {len(valid_scales)} organic smooth scales")
with open('public/scales_v9.json', 'w') as f:
    json.dump(valid_scales, f)
with open('scales_v9.json', 'w') as f:
    json.dump(valid_scales, f)
