"""Sky removal, third pass: grow the certain sky inward, pixel ring by pixel ring, for as long as each
new pixel matches the sky right next to it. The growth stops at real edges (hand, sleeve, scroll, ribbon)."""
import sys, numpy as np, cv2
from PIL import Image
from rembg import remove, new_session
src, out = sys.argv[1], sys.argv[2]
im = Image.open(src).convert('RGB'); W, H = im.size
a = np.asarray(im).astype(np.float32); r, g, b = a[..., 0], a[..., 1], a[..., 2]
ys = np.arange(H, dtype=np.float32)[:, None] * np.ones((1, W), np.float32)
k = lambda n: cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (n, n))
fg0 = np.asarray(remove(im, session=new_session('isnet-general-use'), only_mask=True)).astype(np.float32) / 255
rough = cv2.morphologyEx((fg0 > .3).astype(np.uint8), cv2.MORPH_CLOSE, k(15))
core = cv2.erode(rough, k(31)) > 0                      # certainly subject
lum = .299 * r + .587 * g + .114 * b
land = ((g - np.maximum(r, b) > -2) & ((lum > 45) | (ys > 578))) | ((lum < 150) & (ys > 578) & (g >= b - 2)) | (ys >= 640)
land &= ~(cv2.erode(rough, k(9)) > 0)                 # the grey sleeve is not land
known = (cv2.dilate(rough, k(61)) == 0) & ~land
# sky pockets the growth cannot reach (inside the ribbon loop, between an arm and the tree line)
xs = np.arange(W, dtype=np.float32)[None, :] * np.ones((H, 1), np.float32)
blue = (((b > r + 20) & ~(cv2.erode(rough, k(9)) > 0)) | ((b > r + 8) & (xs > 420))) & ~land
pocket = ((xs > 1000) | (xs < 560) | (ys > 578)) & (lum > 140) & ~land & (cv2.dilate(rough, k(9)) == 0)
known |= blue | pocket          # certainly sky

def dist_to(S):
    d = a - S
    return np.sqrt((d ** 2).sum(-1)) * .6 + np.abs((r - g) - (S[..., 0] - S[..., 1]))
def local_sky(kn, sig):
    kf = kn.astype(np.float32)
    wb = cv2.GaussianBlur(kf, (0, 0), sig); cb = cv2.GaussianBlur(a * kf[..., None], (0, 0), sig)
    return cb / np.maximum(wb, 1e-4)[..., None], wb

TH = float(sys.argv[3]) if len(sys.argv) > 3 else 9
for it in range(600):
    S, wb = local_sky(known, 3)
    ring = cv2.dilate(known.astype(np.uint8), np.ones((3, 3), np.uint8)).astype(bool) & ~known & ~core & ~land
    add = ring & (dist_to(S) < TH)
    if add.sum() < 3: break
    known |= add
print('grew for', it, 'rounds')
S, wb = local_sky(known, 4)
S2, wb2 = local_sky(known, 14); S = np.where((wb > .05)[..., None], S, S2)
S3, wb3 = local_sky(known, 45); S = np.where((wb2 > .05)[..., None], S, S3); wb2 = np.maximum(wb2, (wb3 > .02) * 1.0)   # wider search before giving up on finding sky
subj = ~known & ~land
# drop specks of "subject" floating in the sky, fill pinholes of "sky" inside the subject
n, lab, st, _ = cv2.connectedComponentsWithStats(subj.astype(np.uint8), connectivity=8)
subj = np.isin(lab, [i for i in range(1, n) if st[i, cv2.CC_STAT_AREA] > 1500])
n, lab, st, _ = cv2.connectedComponentsWithStats((~subj).astype(np.uint8), connectivity=4)
for i in range(1, n):
    if st[i, cv2.CC_STAT_AREA] < 150: subj[lab == i] = True
subj |= cv2.erode(rough, k(9)) > 0
subj &= ~blue
su = subj.astype(np.uint8)
inner = cv2.erode(su, k(7)) > 0                                   # safely inside the subject
ring = (cv2.dilate(su, np.ones((3, 3), np.uint8)) > 0) & ~inner & ~land   # its soft rim, plus one pixel outside
# true colour for each rim pixel = the nearest safely-inside pixel; its opacity = how far it sits between sky and that colour
_, lab = cv2.distanceTransformWithLabels((~inner).astype(np.uint8), cv2.DIST_L2, 5, labelType=cv2.DIST_LABEL_PIXEL)
idx = np.zeros(lab.max() + 1, np.int64); yy, xx = np.nonzero(inner); idx[lab[yy, xx]] = yy * W + xx
F = a.reshape(-1, 3)[idx[lab]]
fs = F - S; t = ((a - S) * fs).sum(-1) / np.maximum((fs ** 2).sum(-1), 1e-3)
rim_a = np.clip(t * 1.15 - .05, 0, 1)
rim_a = np.where(wb2 > .05, rim_a, 1)                             # no sky nearby (subject against land): leave solid
fg = np.where(inner, 1, np.where(ring, rim_a, 0)).astype(np.float32)
green = np.clip((g - np.maximum(r, b) + 2) / 8, 0, 1) * land
dark = np.clip((150 - lum) / 40, 0, 1) * (ys > 578) * land
ground = np.clip((ys - 650) / 12, 0, 1)
alpha = np.maximum.reduce([fg, green, dark, ground])
alpha[(lum > 185) & (r > g + 25) & (b > 110) & (ys > 560) & (ys < 640) & ~inner] = 0   # bright peach sky caught between fingers and trees
n, lab, st, _ = cv2.connectedComponentsWithStats((alpha > .1).astype(np.uint8), connectivity=8)
small = np.isin(lab, [i for i in range(1, n) if st[i, cv2.CC_STAT_AREA] < 600])
print('specks removed:', int(small.sum()), 'px')
alpha[small] = 0
alpha = cv2.GaussianBlur(alpha, (0, 0), .45)
rgb = np.where((ring & (wb2 > .05) & (ys < 640))[..., None], F, a)
Image.fromarray(np.dstack([rgb, alpha * 255]).round().astype(np.uint8)).save(out)
bg = np.ones_like(a) * np.array((251, 248, 241), np.float32)
Image.fromarray((rgb * alpha[..., None] + bg * (1 - alpha[..., None])).round().astype(np.uint8)).save(out.replace('.png', '-on-paper.jpg'), quality=93)

# ---- layers for the hand animation: field (hands painted out), left hand + scroll, right hand ----
if len(sys.argv) > 4:
    pre = sys.argv[4]
    near_r = cv2.dilate(rough, k(15)) > 0
    greenish = (g - np.maximum(r, b) > -2) & ((lum > 45) | (ys > 578))
    SL = subj | (land & ~greenish & (ys < 640) & (cv2.dilate(rough, k(9)) > 0)) | ((ys >= 575) & (r > g + 15) & near_r)
    SL = cv2.morphologyEx(SL.astype(np.uint8), cv2.MORPH_OPEN, k(3))
    n, lab, st, _ = cv2.connectedComponentsWithStats(SL, connectivity=8)
    SL = np.isin(lab, [i for i in range(1, n) if st[i, cv2.CC_STAT_AREA] > 3000]).astype(np.uint8)
    soft = np.clip(cv2.GaussianBlur(cv2.dilate(SL, k(3)).astype(np.float32), (0, 0), .8) * 1.5, 0, 1)
    hand_a = alpha * soft
    n, lab = cv2.connectedComponents(cv2.dilate(SL, k(5)))
    left_id = np.bincount(lab[:, :40].ravel())[1:].argmax() + 1
    is_left = cv2.dilate((lab == left_id).astype(np.uint8), k(5)) > 0
    EXT = 60                                             # extra sleeve/arm past the picture edge, so a small swing never shows a gap
    def save_hand(mask, side, name):
        px = np.dstack([rgb, hand_a * mask * 255]).round().astype(np.uint8)
        pad = ((0, 0), (EXT, 0), (0, 0)) if side == 'l' else ((0, 0), (0, EXT), (0, 0))
        Image.fromarray(np.pad(px, pad, mode='edge')[240:]).save(name, quality=92, method=6)
    save_hand(is_left, 'l', pre + '-left.webp'); save_hand(~is_left, 'r', pre + '-right.webp')
    # the field: land only, with the hands (and the pale halo around them) painted out
    land0 = greenish | ((lum < 150) & (ys > 578) & (g >= b - 2)) | (ys >= 640)
    la0 = np.maximum.reduce([np.clip((g - np.maximum(r, b) + 2) / 8, 0, 1) * land0, np.clip((150 - lum) / 40, 0, 1) * (ys > 578) * land0, ground])
    hole = (cv2.dilate(SL, k(15)) > 0)
    # fill row by row: the scene is layered sky / trees / grass, so each row is bridged from the land either side of the hole
    pm = np.dstack([a * la0[..., None], la0])                       # colour x opacity, opacity
    src = pm.copy()
    for y in range(H):
        hr = hole[y].astype(np.int8)
        if not hr.any(): continue
        edges = np.diff(np.concatenate([[0], hr, [0]]))
        for x0, x1 in zip(np.nonzero(edges == 1)[0], np.nonzero(edges == -1)[0] - 1):      # each run of hole pixels on this row
            xs_ = np.arange(x0, x1 + 1); dl = xs_ - x0 + 1; dr = x1 - xs_ + 1
            li = x0 - dl; ri = x1 + dr                                                      # mirror images in the land to the left / right
            lok = (li >= 0) & ~hole[y, np.clip(li, 0, W - 1)]; rok = (ri < W) & ~hole[y, np.clip(ri, 0, W - 1)]
            wl = lok / dl; wr = rok / dr; tot = wl + wr
            if not (tot > 0).all():
                near_ok = np.nonzero(~hole[y])[0]
                if not len(near_ok): continue
                fb = src[y, near_ok[np.abs(near_ok[None, :] - xs_[:, None]).argmin(1)]]
            L = src[y, np.clip(li, 0, W - 1)]; R = src[y, np.clip(ri, 0, W - 1)]
            mixed = (L * wl[:, None] + R * wr[:, None]) / np.maximum(tot, 1e-6)[:, None]
            pm[y, x0:x1 + 1] = np.where((tot > 0)[:, None], mixed, fb if not (tot > 0).all() else mixed)
    pm = np.where(hole[..., None], cv2.GaussianBlur(pm, (0, 0), .8), pm)
    pm = np.where(hole[..., None], pm * np.clip((ys - 566) / 8, 0, 1)[..., None], pm)   # no filled-in wisps above the tree tops
    la = pm[..., 3]; col = np.clip(pm[..., :3] / np.maximum(la, 1e-3)[..., None], 0, 255)
    col = np.where((la > .01)[..., None], col, a)
    la = cv2.GaussianBlur(la, (0, 0), .45)
    Image.fromarray(np.dstack([col, la * 255]).round().astype(np.uint8)[240:]).save(pre + '-field.webp', quality=92, method=6)
    Image.fromarray((col * la[..., None] + bg * (1 - la[..., None])).round().astype(np.uint8)).save(pre + '-field-on-paper.jpg', quality=92)
    # check: field + hands should equal the single picture
    comp = col * la[..., None] + bg * (1 - la[..., None]); ha = hand_a[..., None]; comp = rgb * ha + comp * (1 - ha)
    Image.fromarray(comp.round().astype(np.uint8)).save(pre + '-recomposed.jpg', quality=92)
    one = rgb * alpha[..., None] + bg * (1 - alpha[..., None])
    d = np.abs(comp - one).max(-1); print('recomposed vs single picture: mean diff %.2f, pixels off by >40: %d' % (d.mean(), int((d > 40).sum())))
