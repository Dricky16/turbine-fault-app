import cv2
img = cv2.imread('snakeskin_uniform.jpg')
print("Image shape:", img.shape)
# Print a small section around the vertical seam (w/2)
h, w, _ = img.shape
mid_w = block_w = img.shape[1] // 2 # wait, the block size in make_uniform.py was crop.shape * 2. 
