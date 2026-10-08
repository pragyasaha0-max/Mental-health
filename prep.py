"""Cuts the photos used by the page out of the design mock-up and wipes the baked-in text and cards."""
import cv2, numpy as np
SRC = 'img/design-reference.png'
im = cv2.imread(SRC)

def save(name, img, scale=2):
    big = cv2.resize(img, None, fx=scale, fy=scale, interpolation=cv2.INTER_LANCZOS4)
    cv2.imwrite(f'img/{name}.jpg', big, [cv2.IMWRITE_JPEG_QUALITY, 90])

def row_fill(img, y0, y1, x0, x1, sample=8, blur=10):
    """cover a rectangle by blending, row by row, between the clean pixels on either side of it"""
    a = img[y0:y1, max(0, x0 - sample):x0].astype(np.float32).mean(axis=1)
    b = img[y0:y1, x1:min(img.shape[1], x1 + sample)].astype(np.float32).mean(axis=1)
    a = cv2.GaussianBlur(a, (0, 0), sigmaX=0.1, sigmaY=9)     # smooth down the rows so no streaks show
    b = cv2.GaussianBlur(b, (0, 0), sigmaX=0.1, sigmaY=9)
    t = np.linspace(0, 1, x1 - x0)[None, :, None]
    band = a[:, None, :] * (1 - t) + b[:, None, :] * t
    img[y0:y1, x0:x1] = band.astype(np.uint8)
    pad = 16
    ys, ye, xs, xe = max(0, y0 - pad), min(img.shape[0], y1 + pad), max(0, x0 - pad), min(img.shape[1], x1 + pad)
    soft = cv2.GaussianBlur(img[ys:ye, xs:xe], (0, 0), blur / 3)
    m = np.zeros((ye - ys, xe - xs), np.float32)
    m[y0 - ys:y1 - ys, x0 - xs:x1 - xs] = 1
    m = cv2.GaussianBlur(m, (0, 0), 3)[..., None]
    img[ys:ye, xs:xe] = (img[ys:ye, xs:xe] * (1 - m) + soft * m).astype(np.uint8)

# ---- hero: wipe the headline block on the left and the skills card on the right
hero = im[57:383].copy()
row_fill(hero, 30, 162, 34, 424)      # headline lines run a little further right
row_fill(hero, 162, 316, 34, 398)     # copy, buttons, avatars (the books start at x=403)
row_fill(hero, 30, 304, 782, 1000, sample=6)
save('hero', hero)

# ---- six service photos (the round badge overlaps the bottom edge, so stop above it)
for i, (a, b) in enumerate([(45, 192), (208, 352), (367, 509), (524, 666), (681, 825), (840, 982)], 1):
    save(f's{i}', im[658:741, a:b])

# ---- about photo: lake and stones, minus the play button and the caption
ab = im[901:1121, 46:440].copy()
row_fill(ab, 70, 196, 14, 236, sample=6, blur=14)
save('about', ab)

# ---- avatars for the experience cards (plant, stones, sunset)
for i, cx in enumerate([82, 396, 719], 1):
    save(f'p{i}', im[1207:1253, cx - 23:cx + 23], 3)

# ---- closing banner: the leaves on the right
save('cta', im[1334:1437, 470:979])
