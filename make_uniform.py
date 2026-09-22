import cv2
import numpy as np

img = cv2.imread('snakeskin.jpg')
h, w, _ = img.shape

# Crop the top-right quadrant where scales are small and uniform
crop = img[0:int(h*0.4), int(w*0.6):w]

# Create a mirrored block to make it seamless
crop_lr = cv2.flip(crop, 1)
row1 = np.hstack((crop, crop_lr))
row2 = cv2.flip(row1, 0)
block = np.vstack((row1, row2))

# Tile the block to create a 1920x1080 image
target_h, target_w = 1080, 1920
repeats_y = (target_h // block.shape[0]) + 2
repeats_x = (target_w // block.shape[1]) + 2

tiled = np.tile(block, (repeats_y, repeats_x, 1))

# Crop exactly to 1920x1080
tiled = tiled[0:target_h, 0:target_w]

cv2.imwrite('public/snakeskin_uniform.jpg', tiled)
cv2.imwrite('snakeskin_uniform.jpg', tiled)
