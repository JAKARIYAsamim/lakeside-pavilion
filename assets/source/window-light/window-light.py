"""Draws assets/window-light.svg: a soft pool of sunlight with the shadows of palm fronds and
broad-leafed plants cut out of it (no window frame). Run: python3 assets/source/window-light.py"""
import math, random
W, H = 1600, 1000
rnd = random.Random(11)

def almond(x, y, ang, length, width):
    """one leaflet: a thin pointed leaf starting at (x, y), pointing along ang (degrees)"""
    a = math.radians(ang); dx, dy = math.cos(a), math.sin(a); nx, ny = -dy, dx
    tx, ty = x + dx * length, y + dy * length
    mx, my = x + dx * length * .45, y + dy * length * .45
    return (f'M{x:.1f} {y:.1f} Q{mx + nx * width:.1f} {my + ny * width:.1f} {tx:.1f} {ty:.1f} '
            f'Q{mx - nx * width:.1f} {my - ny * width:.1f} {x:.1f} {y:.1f}Z')

def frond(x0, y0, ang, length, bend, n=26, leaf=150):
    """a palm frond: a curved stem with leaflets on both sides, longest in the middle"""
    out = []; a0 = math.radians(ang)
    pts = []
    for i in range(n + 1):
        t = i / n; a = a0 + math.radians(bend) * t * t
        pts.append((x0 + math.cos(a0 + math.radians(bend) * t * .5) * length * t, y0 + math.sin(a0 + math.radians(bend) * t * .5) * length * t, math.degrees(a)))
    d = 'M' + ' L'.join(f'{x:.1f} {y:.1f}' for x, y, _ in pts)
    out.append(f'<path d="{d}" fill="none" stroke="#000" stroke-width="7" stroke-linecap="round"/>')
    for i in range(2, n + 1):
        t = i / n; x, y, a = pts[i]
        L = leaf * (math.sin(math.pi * min(t * 1.05, 1)) ** .6 * .9 + .18) * (1 + rnd.uniform(-.12, .12))
        spread = 62 - 34 * t
        for side in (-1, 1):
            out.append(f'<path d="{almond(x, y, a + side * (spread + rnd.uniform(-6, 6)), L, L * .075)}"/>')
    return '\n'.join(out)

def broadleaf(x, y, ang, size):
    """a big oval leaf with a notch or two, on a stalk"""
    a = math.radians(ang); dx, dy = math.cos(a), math.sin(a)
    cx, cy = x + dx * size * .9, y + dy * size * .9
    return (f'<path d="M{x:.1f} {y:.1f} L{cx:.1f} {cy:.1f}" stroke="#000" stroke-width="8" fill="none" stroke-linecap="round"/>'
            f'<g transform="translate({cx:.1f} {cy:.1f}) rotate({ang + 90:.1f})"><path d="M0 {size*.75:.1f} C{size*.62:.1f} {size*.5:.1f} {size*.6:.1f} {-size*.45:.1f} 0 {-size*.8:.1f} '
            f'C{-size*.6:.1f} {-size*.45:.1f} {-size*.62:.1f} {size*.5:.1f} 0 {size*.75:.1f}Z"/>'
            f'<path d="M{size*.5:.1f} {size*.1:.1f} L{size*.12:.1f} {size*.02:.1f} L{size*.5:.1f} {-size*.1:.1f}Z M{-size*.5:.1f} {-size*.2:.1f} L{-size*.12:.1f} {-size*.26:.1f} L{-size*.5:.1f} {-size*.4:.1f}Z" fill="#fff"/></g>')

leaves = '\n'.join([
    # kept light on purpose: one palm frond from the left, one from the right
    frond(-70, 560, -24, 700, -20, leaf=170),
    frond(1680, 480, 192, 700, 26, leaf=170),
])
svg = f'''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {W} {H}" preserveAspectRatio="xMidYMid slice">
<defs>
  <radialGradient id="pool" cx=".46" cy=".34" r=".8"><stop offset="0" stop-color="#fff3d6"/><stop offset=".55" stop-color="#ffe9bd" stop-opacity=".7"/><stop offset="1" stop-color="#ffe2a8" stop-opacity="0"/></radialGradient>
  <filter id="soft" x="-10%" y="-10%" width="120%" height="120%"><feGaussianBlur stdDeviation="9"/></filter>
  <filter id="softer" x="-10%" y="-10%" width="120%" height="120%"><feGaussianBlur stdDeviation="5"/></filter>
  <mask id="plants"><rect width="{W}" height="{H}" fill="#fff"/><g fill="#000" filter="url(#softer)">{leaves}</g></mask>
</defs>
<rect width="{W}" height="{H}" fill="url(#pool)" filter="url(#soft)" mask="url(#plants)"/>
</svg>'''
open(__file__.replace('source/window-light.py', 'window-light.svg'), 'w').write(svg)
print('written', len(svg) // 1024, 'KB')
