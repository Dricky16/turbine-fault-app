import cv2
import numpy as np

img = cv2.imread('snakeskin.jpg')

# Convert to HSV to normalize the color
hsv = cv2.cvtColor(img, cv2.COLOR_BGR2HSV)
# Set hue to a uniform mamba green (around 60 in OpenCV which is 120 degrees)
hsv[:, :, 0] = 50 
# Increase saturation slightly
hsv[:, :, 1] = np.clip(hsv[:, :, 1] * 1.2, 0, 255).astype(np.uint8)

green_img = cv2.cvtColor(hsv, cv2.COLOR_HSV2BGR)

# Apply a very strong blur to the brightness to remove the bright yellow spine effect
# We can normalize the V channel
v = hsv[:, :, 2]
mean_v = np.mean(v)
# Flatten the brightness slightly towards the mean
hsv[:, :, 2] = np.clip((v - mean_v) * 0.5 + mean_v, 0, 255).astype(np.uint8)

green_flat_img = cv2.cvtColor(hsv, cv2.COLOR_HSV2BGR)

cv2.imwrite('public/snakeskin_green.jpg', green_flat_img)
cv2.imwrite('snakeskin_green.jpg', green_flat_img)
