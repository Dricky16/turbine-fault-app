import cv2
import numpy as np

img = cv2.imread('snakeskin_uniform.jpg')
h, w, _ = img.shape
# Check horizontal lines
for y in range(h):
    if np.mean(img[y, :, :]) > 100: # if a whole row is very bright
        print(f"Bright horizontal line at y={y}, mean={np.mean(img[y, :, :])}")
# Check vertical lines
for x in range(w):
    if np.mean(img[:, x, :]) > 100:
        print(f"Bright vertical line at x={x}, mean={np.mean(img[:, x, :])}")
