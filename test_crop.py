import cv2
img = cv2.imread('snakeskin.jpg')
h, w, _ = img.shape
# Crop 10% of the image from the top right
x_start = int(w * 0.80)
x_end = int(w * 0.90)
y_start = int(h * 0.10) # 0.1 from top
y_end = int(h * 0.20)
crop = img[y_start:y_end, x_start:x_end]
cv2.imwrite('public/single_scale_test.jpg', crop)
