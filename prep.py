"""Cuts the photos used by the page out of the design mock-up and cleans the baked-in text."""
import cv2, numpy as np
SRC = '/root/.claude/uploads/bf046f21-02dc-5525-b4de-a1670223633b/2bdef36a-image.png'
im = cv2.imread(SRC)

def save(name, img, scale=2):
    big = cv2.resize(img, None, fx=scale, fy=scale, interpolation=cv2.INTER_LANCZOS4)
    cv2.imwrite(f'img/{name}.jpg', big, [cv2.IMWRITE_JPEG_QUALITY, 90])

def soft_fill(img, mask, sigma=26):
    """replace masked pixels with a blur of the surrounding (unmasked) pixels"""
    m = (mask == 0).astype(np.float32)
    f = img.astype(np.float32)
    num = cv2.GaussianBlur(f * m[..., None], (0, 0), sigma)
    den = cv2.GaussianBlur(m, (0, 0), sigma)[..., None]
    fill = num / np.maximum(den, 1e-3)
    out = f.copy()
    k = cv2.GaussianBlur((mask > 0).astype(np.float32), (0, 0), 6)[..., None]
    out = out * (1 - k) + fill * k
    return out.astype(np.uint8)

# ---- hero: wipe the text block on the left, and the handwritten line on the right
y0, y1 = 52, 395
hero = im[y0:y1].copy()
# the left side is a smooth gradient, so fill each row by blending between a clean strip on either side
xa, xb = 440, 28
left = hero[:, xb - 8:xb].mean(axis=1)
right = hero[:, xa:xa + 8].mean(axis=1)
t = np.linspace(0, 1, xa - xb)[None, :, None]
band = (left[:, None, :] * (1 - t) + right[:, None, :] * t)
band = cv2.GaussianBlur(band.astype(np.float32), (0, 0), 14)
hero[:, xb:xa] = band.astype(np.uint8)
hero[:, xb:xa] = cv2.GaussianBlur(hero[:, xb - 20:xa + 20], (0, 0), 3)[:, 20:-20]
# handwriting: pale strokes on the plant
r = hero[110:215, 810:945]
g = cv2.cvtColor(r, cv2.COLOR_BGR2GRAY)
hm = np.zeros(hero.shape[:2], np.uint8)
hm[110:215, 810:945] = (g > 205).astype(np.uint8) * 255
hm = cv2.dilate(hm, np.ones((5, 5), np.uint8), iterations=2)
hero = cv2.inpaint(hero, hm, 5, cv2.INPAINT_TELEA)
save('hero', hero)

# ---- about photo: remove the play button
ab = im[917:1122, 75:369].copy()
pm = np.zeros(ab.shape[:2], np.uint8)
cv2.circle(pm, (225 - 75, 1030 - 917), 24, 255, -1)
ab = soft_fill(ab, pm, 9)
save('about', ab)

# ---- closing banner photo
save('cta', im[1350:1467, 330:770])  # mountains only, the hiker is cropped out
