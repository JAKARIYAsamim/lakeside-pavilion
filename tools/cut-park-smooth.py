# Section 3 photo, clean version: the family (rembg mask) over a lawn whose top is ONE smooth curve with a soft fade
# into the ivory page (replaces the lumpy focus-based edge of tools/cut-park.py).
# usage: python3 tools/cut-park-smooth.py [edge-at-sides=628] [edge-in-middle=684] [fade=40]
import sys, numpy as np
from PIL import Image, ImageFilter
side = float(sys.argv[1]) if len(sys.argv) > 1 else 628
mid  = float(sys.argv[2]) if len(sys.argv) > 2 else 684
fade = float(sys.argv[3]) if len(sys.argv) > 3 else 40
im = np.asarray(Image.open('assets/source/family-park.png').convert('RGB')); H, W = im.shape[:2]
p = np.asarray(Image.open('assets/source/family-park-people-mask.png').convert('L')).astype(np.float32)/255
p = np.clip((p-0.08)/0.75, 0, 1)
p = np.asarray(Image.fromarray((p*255).astype('uint8')).filter(ImageFilter.MinFilter(3)).filter(ImageFilter.GaussianBlur(0.6))).astype(np.float32)/255
x = np.arange(W)[None, :]; y = np.arange(H)[:, None]
u = (x - W/2) / (W/2)
top = side + (mid - side) * (1 - u*u)          # gentle bowl that follows the photo's own lawn line
t = np.clip((y - (top - fade/2)) / fade, 0, 1)
lawn = t*t*(3-2*t)
alpha = np.maximum(lawn, p)
Image.fromarray(np.dstack([im, (alpha*255).round().astype('uint8')])).save('assets/source/family-park-cut.png')
