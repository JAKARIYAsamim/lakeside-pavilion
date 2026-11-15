"""Draws the footer illustration: a lakeside scene in thin gold lines (towers, palms, the round pavilion on the
water, a boat, homes, a crane, hills, birds) and writes it into index.html between the FOOT-SCENE markers.
Run: python3 assets/source/footer-scene.py"""
import math, os, re
W, H, SHORE = 1600, 440, 332
P = []                                       # (x for timing, path d, extra attributes)
def add(d, x, fill=False, op=None):
    a = ' class="fs-fill"' if fill else ''
    if op: a += f' opacity="{op}"'
    P.append((x, d, a))
def rect(x, y, w, h): return f'M{x} {y} h{w} v{h} h{-w} Z'

# far hills
add('M-10 262 C90 200 170 196 250 250 S400 222 470 262', 0, op=.4)
add('M300 262 C360 228 410 226 460 250 S560 236 610 262', 300, op=.3)
add('M1010 262 C1080 226 1140 224 1200 252', 1010, op=.3)
add('M1120 262 C1200 205 1290 190 1370 246 S1520 215 1610 258', 1120, op=.4)
# birds
for bx, by, s in ((640, 96, 1), (690, 122, .7), (980, 84, .9), (1040, 110, .65), (455, 128, .7)):
    add(f'M{bx} {by} q{9*s} {-9*s} {18*s} 0 q{9*s} {-9*s} {18*s} 0', bx, op=.7)
# crane (far, behind the homes)
add('M1284 330 V118 M1296 330 V118', 1284, op=.6)
add('M1284 300 L1296 280 L1284 260 L1296 240 L1284 220 L1296 200 L1284 180 L1296 160 L1284 140 L1296 120', 1284, op=.6)
add('M1236 126 H1452 M1290 96 L1236 126 M1290 96 L1452 126 M1290 96 V126', 1236, op=.6)
add('M1320 126 L1335 112 L1350 126 L1365 112 L1380 126 L1395 115 L1410 126', 1320, op=.6)
add('M1418 126 V186 M1412 186 h12 M1418 186 v10 q0 8 -7 8', 1418, op=.6)
add(rect(1244, 126, 22, 14), 1244, op=.6)
# the two towers of the logo, with their lower wings and the arch
add('M150 332 V214 L190 190 V332 Z', 150, fill=True)
add('M322 332 V190 L362 214 V332 Z', 322, fill=True)
add('M190 332 V150 L250 110 V332 Z', 190, fill=True)
add('M262 332 V110 L322 150 V332 Z', 262, fill=True)
add('M206 332 V166 L236 146 V332', 206)
add('M276 332 V146 L306 166 V332', 276)
add('M221 332 V180 M291 332 V180', 221, op=.6)
add('M160 318 Q256 262 352 318', 160, fill=True)
add('M176 332 V307 M200 332 V296 M228 332 V288 M256 332 V285 M284 332 V288 M312 332 V296 M336 332 V307', 176, op=.7)
# palms
def palm(x, y, h, lean, s=1.0, op=None):
    tx, ty = x + lean, y - h
    add(f'M{x} {y} Q{x + lean * .15:.1f} {y - h * .55:.1f} {tx} {ty} M{x + 7} {y} Q{x + 7 + lean * .15:.1f} {y - h * .55:.1f} {tx + 3} {ty}', x, op=op)
    for dx, dy, drop in ((-52, -6, 34), (-40, -30, 22), (-16, -44, 10), (14, -44, 10), (40, -30, 22), (54, -6, 34)):
        ex, ey = tx + dx * s, ty + (dy + drop) * s
        add(f'M{tx + 1} {ty} Q{tx + dx * .55 * s:.1f} {ty + dy * s:.1f} {ex:.1f} {ey:.1f}', x, op=op)
        add(f'M{tx + 1} {ty} Q{tx + dx * .5 * s:.1f} {ty + (dy + 10) * s:.1f} {tx + dx * .86 * s:.1f} {ty + (dy + drop + 6) * s:.1f}', x, op=.55)
palm(70, 334, 120, 10, .9, .8); palm(420, 334, 132, -12); palm(486, 336, 96, 12, .8)
palm(1010, 336, 104, -10, .85); palm(1076, 334, 138, 12); palm(1500, 334, 126, -10, .95); palm(1560, 334, 92, 8, .75, .8)
# low-rise homes on the right
add(rect(1130, 268, 86, 64), 1130, fill=True); add('M1122 268 H1224', 1122)
add(rect(1150, 236, 56, 32), 1150, fill=True); add('M1144 236 H1212', 1144)
add(rect(1142, 284, 16, 22) + rect(1168, 284, 16, 22) + rect(1194, 290, 12, 42) + rect(1160, 246, 12, 14) + rect(1184, 246, 12, 14), 1142, op=.8)
add(rect(1318, 250, 104, 82), 1318, fill=True); add('M1310 250 H1430', 1310)
add(rect(1422, 284, 56, 48), 1422, fill=True); add('M1416 284 H1484', 1416)
add(rect(1332, 266, 18, 18) + rect(1362, 266, 18, 18) + rect(1392, 266, 18, 18) + rect(1332, 298, 18, 18) + rect(1362, 298, 18, 34) + rect(1392, 298, 18, 18) + rect(1436, 298, 14, 16) + rect(1458, 298, 14, 16), 1332, op=.8)
# the shore, either side of the pavilion's platform
add('M0 334 C200 328 480 334 664 346', 0)
add('M936 346 C1100 334 1400 328 1600 334', 936)
# the round pavilion on its platform over the water
add('M664 346 Q800 318 936 346 Q800 386 664 346 Z', 664, fill=True)
add('M676 352 Q800 388 924 352', 676, op=.6)
add('M700 364 v-12 M740 374 v-12 M800 378 v-12 M860 374 v-12 M900 364 v-12', 700, op=.6)
add('M708 336 H892 M700 344 H900', 700)
add('M722 238 Q800 150 878 238 Z', 722, fill=True)
add(rect(708, 238, 184, 12), 708, fill=True)
for cx in (722, 754, 786, 814, 846, 878):
    add(f'M{cx - 4} 336 V250 M{cx + 4} 336 V250', cx)
add('M744 222 Q800 172 856 222', 744, op=.6)
add('M800 194 V174 M796 170 a4 4 0 1 0 8 0 a4 4 0 1 0 -8 0', 800)
# a boat, and ripples on the lake
add('M508 388 H604 Q590 410 556 410 Q522 410 508 388 Z', 508, fill=True)
add('M530 388 V370 H584 V388 M524 370 Q557 356 590 370', 530)
add('M500 420 h42 M560 424 h64', 500, op=.5)
for rx, ry, rl in ((60, 372, 90), (210, 392, 120), (340, 366, 70), (96, 418, 150), (640, 404, 60), (720, 418, 110), (900, 408, 80), (1010, 380, 120), (1180, 398, 150), (1350, 372, 90), (1440, 414, 120), (1250, 426, 70), (380, 428, 60), (1090, 424, 50)):
    add(f'M{rx} {ry} q{rl / 4:.0f} -4 {rl / 2:.0f} 0 t{rl / 2:.0f} 0', rx, op=.5)

paths = ''.join(f'<path pathLength="1" style="--n:{x / W * 2.8:.2f}"{a} d="{d}"/>' for x, d, a in P)
svg = f'<svg class="foot-art" viewBox="0 0 {W} {H}" preserveAspectRatio="xMidYMax slice" fill="none" stroke-linecap="round" stroke-linejoin="round">{paths}</svg>'
page = os.path.join(os.path.dirname(__file__), '..', '..', 'index.html')
s = open(page).read()
s2, n = re.subn(r'(<!-- FOOT-SCENE-START -->).*?(<!-- FOOT-SCENE-END -->)', lambda m: m.group(1) + '\n    ' + svg + '\n    ' + m.group(2), s, flags=re.S)
assert n == 1, 'markers not found in index.html'
open(page, 'w').write(s2)
print('drawn:', len(P), 'paths,', len(svg) // 1024, 'KB')
