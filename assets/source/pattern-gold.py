"""Draws assets/pattern-gold.svg: a tile of thin gold line-work, squares with arcs, leaves and arches in them,
which repeats without a seam. Run: python3 assets/source/pattern-gold.py"""
import random
C = 100                      # one square of the grid
N = 6                        # squares across and down in one tile
GOLD, WIDTH, OPACITY = '#D2AE77', 1.15, 0.2
rnd = random.Random(21)

MOTIFS = {
    'quarter':  'M0 100 A100 100 0 0 1 100 0',                                   # a quarter circle, corner to corner
    'leaf':     'M0 100 A100 100 0 0 1 100 0 M0 100 A100 100 0 0 0 100 0',       # two quarter circles: a leaf
    'rings':    'M0 100 A100 100 0 0 1 100 0 M0 56 A56 56 0 0 0 56 0',           # a quarter circle and a smaller one facing it
    'arch':     'M22 100 V52 A28 28 0 0 1 78 52 V100',                           # a doorway arch
    'half':     'M0 100 A50 50 0 0 1 100 100',                                   # a half circle standing on the bottom edge
    'bud':      'M0 100 A50 50 0 0 1 100 100 M50 50 A50 50 0 0 1 0 0 M50 50 A50 50 0 0 0 100 0',   # a half circle with two petals above
    'wave':     'M0 50 A50 50 0 0 1 50 0 M50 100 A50 50 0 0 1 100 50',           # two small arcs: a ripple of water
    'empty':    '',
}
BAG = ['quarter'] * 5 + ['leaf'] * 5 + ['rings'] * 3 + ['arch'] * 3 + ['half'] * 3 + ['bud'] * 3 + ['wave'] * 3 + ['empty'] * 5

cells = []
for r in range(N):
    for c in range(N):
        name = rnd.choice(BAG)
        if not MOTIFS[name]: continue
        turn = rnd.choice((0, 90, 180, 270)) if name not in ('arch',) else rnd.choice((0, 0, 180))
        cells.append(f'<path transform="translate({c * C} {r * C}) rotate({turn} 50 50)" d="{MOTIFS[name]}"/>')
grid = ''.join(f'<path d="M{i * C} 0 V{N * C} M0 {i * C} H{N * C}"/>' for i in range(N))      # the lines of the grid (the last ones belong to the next tile)
svg = (f'<svg xmlns="http://www.w3.org/2000/svg" width="{N * C}" height="{N * C}" viewBox="0 0 {N * C} {N * C}">'
       f'<g fill="none" stroke="{GOLD}" stroke-width="{WIDTH}" stroke-opacity="{OPACITY}" stroke-linecap="round">{grid}{"".join(cells)}</g></svg>')
open(__file__.replace('source/pattern-gold.py', 'pattern-gold.svg'), 'w').write(svg)
print('written', len(svg), 'bytes,', len(cells), 'motifs')
