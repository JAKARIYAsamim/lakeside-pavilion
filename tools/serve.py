#!/usr/bin/env python3
"""Local preview server for the Lakeside Pavilion hero.

    python3 tools/serve.py          then open http://127.0.0.1:4800/
    python3 tools/serve.py 5000     to use another port

It serves the folder like any static server and adds one thing: the page's
edit mode (http://127.0.0.1:4800/?edit) can POST the moved positions to
/__layout, and they are written into css/styles.css between the MOVED
markers. It only listens on this computer.
"""
import json, os, re, sys
from functools import partial
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
CSS = os.path.join(ROOT, 'css', 'styles.css')
START, END = '/* MOVED-START', '/* MOVED-END */'
NAME = re.compile(r'^[a-z][a-z0-9-]{0,30}$')


def write_layout(positions):
    lines = []
    for name in sorted(positions):
        p = positions[name]
        if not NAME.match(name) or not isinstance(p, dict):
            raise ValueError('bad piece name')
        x, y = float(p.get('x', 0)), float(p.get('y', 0))
        if not (abs(x) <= 4000 and abs(y) <= 4000):
            raise ValueError('position out of range')
        if x or y:
            lines.append('  [data-move="%s"] { --mx: %s; --my: %s; }' % (name, round(x, 1), round(y, 1)))
    with open(CSS, encoding='utf-8') as f:
        css = f.read()
    a, b = css.find(START), css.find(END)
    if a < 0 or b < a:
        raise ValueError('MOVED markers not found in css/styles.css')
    a = css.index('\n', a) + 1
    css = css[:a] + ('\n'.join(lines) + '\n' if lines else '') + '  ' + css[b:]
    tmp = CSS + '.tmp'
    with open(tmp, 'w', encoding='utf-8') as f:
        f.write(css)
    os.replace(tmp, CSS)
    return len(lines)


class Handler(SimpleHTTPRequestHandler):
    def _json(self, code, body):
        data = json.dumps(body).encode()
        self.send_response(code)
        self.send_header('Content-Type', 'application/json')
        self.send_header('Content-Length', str(len(data)))
        self.send_header('Cache-Control', 'no-store')
        self.end_headers()
        self.wfile.write(data)

    def end_headers(self):
        # always fetch fresh files while previewing
        if not self.path.startswith('/__layout'):
            self.send_header('Cache-Control', 'no-cache')
        super().end_headers()

    def do_GET(self):
        if self.path.split('?')[0] == '/__layout':
            return self._json(200, {'ok': True})
        super().do_GET()

    def do_POST(self):
        if self.path.split('?')[0] != '/__layout':
            return self._json(404, {'ok': False, 'error': 'not found'})
        host = self.headers.get('Host', '')
        origin = self.headers.get('Origin', '')
        # only this page, opened from this computer, may save
        if host.split(':')[0] not in ('127.0.0.1', 'localhost') or (origin and origin != 'http://' + host) \
                or self.headers.get('Content-Type', '').split(';')[0] != 'application/json':
            return self._json(403, {'ok': False, 'error': 'not allowed'})
        try:
            n = int(self.headers.get('Content-Length', '0'))
            if n > 20000:
                raise ValueError('too large')
            positions = json.loads(self.rfile.read(n) or b'{}')
            if not isinstance(positions, dict):
                raise ValueError('bad data')
            moved = write_layout(positions)
        except Exception as e:
            return self._json(400, {'ok': False, 'error': str(e)})
        self._json(200, {'ok': True, 'moved': moved})

    def log_message(self, *args):
        pass


if __name__ == '__main__':
    port = int(sys.argv[1]) if len(sys.argv) > 1 else 4800
    print('Lakeside Pavilion preview: http://127.0.0.1:%d/   (edit mode: add ?edit)' % port)
    ThreadingHTTPServer(('127.0.0.1', port), partial(Handler, directory=ROOT)).serve_forever()
