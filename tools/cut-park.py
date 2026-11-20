# Cuts assets/source/family-park.png for section 3: keeps the family (rembg isnet-general-use mask) and the in-focus
# lawn; the blurred trees, sky and far lawn become transparent, so the ivory page and the headline show there.
# usage: python3 tools/cut-park.py <people-mask.png> <out.png> [start-row=560] [t0=10] [t1=22] [floor-row=720]
import sys, numpy as np, cv2
from PIL import Image, ImageFilter
mask_path, out = sys.argv[1], sys.argv[2]
start, t0, t1, floor = (int(sys.argv[3]) if len(sys.argv) > 3 else 560), float(sys.argv[4]) if len(sys.argv) > 4 else 10, float(sys.argv[5]) if len(sys.argv) > 5 else 22, int(sys.argv[6]) if len(sys.argv) > 6 else 720
im = np.asarray(Image.open('assets/source/family-park.png').convert('RGB')); H, W = im.shape[:2]
g = cv2.cvtColor(im, cv2.COLOR_RGB2GRAY).astype(np.float32)
e = cv2.GaussianBlur(np.abs(cv2.Laplacian(g, cv2.CV_32F, ksize=3)), (0,0), 3.5)
p = np.asarray(Image.open(mask_path).convert('L')).astype(np.float32)/255
p = np.clip((p-0.08)/0.75, 0, 1)
p = np.asarray(Image.fromarray((p*255).astype('uint8')).filter(ImageFilter.MinFilter(3)).filter(ImageFilter.GaussianBlur(0.6))).astype(np.float32)/255
pd = cv2.dilate((p > 0.05).astype('uint8'), np.ones((11,11), np.uint8)).astype(bool)
s = np.clip((e-t0)/(t1-t0), 0, 1); s = s*s*(3-2*s)
s[pd] = 0; s[:start] = 0
b = cv2.morphologyEx((s > 0.35).astype('uint8'), cv2.MORPH_OPEN, cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (9,9)))
n, lab, st, _ = cv2.connectedComponentsWithStats(b, 8)
good = np.zeros(n, bool); good[1:] = st[1:, cv2.CC_STAT_AREA] > 6000
s = s * cv2.GaussianBlur(cv2.dilate(good[lab].astype('uint8'), np.ones((7,7), np.uint8)).astype(np.float32), (0,0), 2)
s[floor:] = 1
keep = np.maximum.accumulate(s, axis=0)
# round off blocky tufts on the lawn's top edge (thin spikes narrower than ~25 px go)
kb = cv2.morphologyEx((keep > 0.5).astype('uint8'), cv2.MORPH_OPEN, cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (27,27)))
keep = np.minimum(keep, cv2.GaussianBlur(kb.astype(np.float32), (0,0), 2.5))
keep = cv2.GaussianBlur(keep, (0,0), 1.2)
alpha = np.maximum(keep, p)
Image.fromarray(np.dstack([im, (alpha*255).round().astype('uint8')])).save(out)
