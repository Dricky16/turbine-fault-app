import cv2
import numpy as np

img = cv2.imread('snakeskin.jpg')
h, w, _ = img.shape

# Inset by 20 pixels on all sides to absolutely guarantee no white borders
y1 = 20
y2 = int(h * 0.4)
x1 = int(w * 0.6)
x2 = w - 20
crop = img[y1:y2, x1:x2]

# Make it uniformly green (remove the bright yellow spine effect)
hsv = cv2.cvtColor(crop, cv2.COLOR_BGR2HSV)
hsv[:, :, 0] = 50 # Green hue
hsv[:, :, 1] = np.clip(hsv[:, :, 1] * 1.2, 0, 255).astype(np.uint8) # Saturate
v = hsv[:, :, 2]
mean_v = np.mean(v)
# Flatten brightness to remove strong highlights that look weird when mirrored
hsv[:, :, 2] = np.clip((v - mean_v) * 0.4 + mean_v, 0, 255).astype(np.uint8)
crop_green = cv2.cvtColor(hsv, cv2.COLOR_HSV2BGR)

# Mirror to make seamless
crop_lr = cv2.flip(crop_green, 1)
row1 = np.hstack((crop_green, crop_lr))
row2 = cv2.flip(row1, 0)
block = np.vstack((row1, row2))

# Tile to 1920x1080
target_h, target_w = 1080, 1920
repeats_y = (target_h // block.shape[0]) + 2
repeats_x = (target_w // block.shape[1]) + 2

tiled = np.tile(block, (repeats_y, repeats_x, 1))
tiled = tiled[0:target_h, 0:target_w]

cv2.imwrite('public/snakeskin_final.jpg', tiled)
cv2.imwrite('snakeskin_final.jpg', tiled)
