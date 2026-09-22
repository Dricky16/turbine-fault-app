import cv2
import numpy as np
img = cv2.imread('snakeskin.jpg')
for y in range(40):
    print(f"y={y}, mean={np.mean(img[y, 449:739, :])}")
