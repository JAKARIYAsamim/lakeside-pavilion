# Cuts the family photo for section 3: python3 tools/cut-family.py <folder with people-mask-isnet-general-use.png> . 10 22 730
# (people mask = rembg isnet-general-use on assets/source/family-picnic.png). Writes cut2.png into that folder.
import sys, numpy as np, cv2
from PIL import Image, ImageFilter
S = sys.argv[1]; root = sys.argv[2]
im = np.asarray(Image.open(root+'/assets/source/family-picnic.png').convert('RGB'))
H, W = im.shape[:2]
g = cv2.cvtColor(im, cv2.COLOR_RGB2GRAY).astype(np.float32)
lap = np.abs(cv2.Laplacian(g, cv2.CV_32F, ksize=3))
e = cv2.GaussianBlur(lap, (0,0), 3.5)
# people mask (rembg), firmed + 1px choke as before
p = np.asarray(Image.open(S+'/people-mask-isnet-general-use.png').convert('L')).astype(np.float32)/255
p = np.clip((p-0.08)/0.75, 0, 1)
p = np.asarray(Image.fromarray((p*255).astype('uint8')).filter(ImageFilter.MinFilter(3)).filter(ImageFilter.GaussianBlur(0.6))).astype(np.float32)/255
pd = cv2.dilate((p>0.05).astype('uint8'), np.ones((11,11),np.uint8)).astype(bool)
t0, t1 = float(sys.argv[3]), float(sys.argv[4])
s = np.clip((e-t0)/(t1-t0), 0, 1); s = s*s*(3-2*s)
s[pd] = 0            # people never start a fill
s[:440] = 0          # nothing kept above the hedge tops
s[int(sys.argv[5]):] = 1   # always keep the near lawn
# drop small sharp specks (bokeh, far people, trunks): keep only big in-focus areas
b = (s > 0.35).astype('uint8')
b = cv2.morphologyEx(b, cv2.MORPH_OPEN, cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (9,9)))
n, lab, st, _ = cv2.connectedComponentsWithStats(b, 8)
good = np.zeros(n, bool)
for i in range(1, n):
    if st[i, cv2.CC_STAT_AREA] > 6000: good[i] = True
big = cv2.dilate(good[lab].astype('uint8'), np.ones((7,7),np.uint8)).astype(np.float32)
s = s * cv2.GaussianBlur(big, (0,0), 2)
keep = np.maximum.accumulate(s, axis=0)   # once in focus, keep everything below it
# the left planter (hedge + wall) on its own, with a lower focus threshold: its right end is softer
pl = np.clip((e-6)/(12-6), 0, 1); pl = pl*pl*(3-2*pl)
pl[:440] = 0; pl[:462, :120] = 0; pl[:, 445:] = 0; pl[pd] = 0
pb = cv2.morphologyEx((pl > 0.4).astype('uint8'), cv2.MORPH_OPEN, cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (7,7)))
n, lab, st, _ = cv2.connectedComponentsWithStats(pb, 8)
k = 1 + np.argmax(st[1:, cv2.CC_STAT_AREA])
pl = pl * cv2.GaussianBlur(cv2.dilate((lab == k).astype('uint8'), np.ones((7,7),np.uint8)).astype(np.float32), (0,0), 2)
keep = np.maximum(keep, np.maximum.accumulate(pl, axis=0))
# past the wall's corner, slope the lawn edge down to meet the in-focus lawn instead of a vertical cut
yy, xx = np.mgrid[0:H, 0:W]
top = 596 + np.clip(xx - 432, 0, None) * 0.85
ramp = np.clip((yy - top) / 26, 0, 1) * ((xx >= 425) & (xx < 600))
keep = np.maximum(keep, ramp)
keep = cv2.GaussianBlur(keep, (0,0), 1.2)
alpha = np.maximum(keep, p)
rgba = np.dstack([im, (alpha*255).round().astype('uint8')])
Image.fromarray(rgba).save(S+'/cut2.png')
bg = Image.new('RGB', (W,H), (240,233,220)); a = Image.fromarray(rgba); bg.paste(a, (0,0), a)
bg.save(S+'/cut2-prev.png'); bg.crop((0,400,1672,760)).save(S+'/cut2-band.png')
