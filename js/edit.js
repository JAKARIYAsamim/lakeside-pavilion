/* Lakeside Pavilion hero: EDIT MODE.
   Open the page with ?edit at the end of the address (for example
   http://127.0.0.1:4800/?edit) to move the text and interface pieces.

   - Drag a piece, or click it and use the arrow keys (Shift = 10 at a time).
   - Every move is kept in this browser straight away, so a reload keeps it.
   - "Save to site" writes the positions into css/styles.css so they become the
     real layout for everyone. It needs the local preview server (tools/serve.py).
   - Positions are offsets in design pixels (the 1672 x 941 desktop frame).
     The phone layout is a stacked column and is not affected. */
(function () {
  var KEY = 'lp-layout-draft';
  var DESIGN_WIDTH = 1672;
  var frame = document.querySelector('.frame');
  var items = Array.prototype.slice.call(document.querySelectorAll('[data-move]'));
  var selected = null;
  var canSaveToSite = false;

  /* ---- positions --------------------------------------------------------- */
  function read(el) {       /* current offset of a piece, from the stylesheet or the draft */
    var cs = getComputedStyle(el);
    return { x: parseFloat(cs.getPropertyValue('--mx')) || 0, y: parseFloat(cs.getPropertyValue('--my')) || 0 };
  }
  function write(el, x, y) {
    el.style.setProperty('--mx', Math.round(x * 10) / 10);
    el.style.setProperty('--my', Math.round(y * 10) / 10);
  }
  function all() {
    var out = {};
    items.forEach(function (el) { var p = read(el); out[el.getAttribute('data-move')] = { x: p.x, y: p.y }; });
    return out;
  }
  function loadDraft() {
    try { return JSON.parse(localStorage.getItem(KEY) || 'null'); } catch (e) { return null; }
  }
  function saveDraft() {
    try { localStorage.setItem(KEY, JSON.stringify(all())); } catch (e) { /* private window: moves last until reload */ }
  }
  function clearDraft() {
    try { localStorage.removeItem(KEY); } catch (e) {}
  }

  var draft = loadDraft();
  if (draft) items.forEach(function (el) {
    var p = draft[el.getAttribute('data-move')];
    if (p && isFinite(p.x) && isFinite(p.y)) write(el, p.x, p.y);
  });

  /* ---- toolbar ----------------------------------------------------------- */
  var bar = document.createElement('div');
  bar.className = 'lp-edit-bar';
  bar.innerHTML =
    '<strong>Edit mode</strong>' +
    '<span class="lp-edit-info">Drag a piece, or click it and use the arrow keys</span>' +
    '<button type="button" data-act="reset-one" disabled>Reset this</button>' +
    '<button type="button" data-act="reset-all">Reset all</button>' +
    '<button type="button" data-act="save" class="lp-edit-primary">Save to site</button>' +
    '<button type="button" data-act="flip" title="Move this bar to the other edge">Move bar</button>' +
    '<button type="button" data-act="exit">Exit</button>';
  document.body.appendChild(bar);
  var info = bar.querySelector('.lp-edit-info');
  var saveBtn = bar.querySelector('[data-act="save"]');
  var resetOneBtn = bar.querySelector('[data-act="reset-one"]');

  function say(text) { info.textContent = text; }
  function describe() {
    if (!selected) { say('Drag a piece, or click it and use the arrow keys'); return; }
    var p = read(selected);
    say(selected.getAttribute('data-move') + ':  ' + (p.x >= 0 ? '+' : '') + p.x + ' across,  ' + (p.y >= 0 ? '+' : '') + p.y + ' down');
  }
  function select(el) {
    if (selected) selected.classList.remove('lp-edit-on');
    selected = el;
    if (el) el.classList.add('lp-edit-on');
    resetOneBtn.disabled = !el;
    describe();
  }

  /* Is the local preview server here to write the stylesheet? */
  fetch('__layout', { cache: 'no-store' }).then(function (r) { return r.ok ? r.json() : null; }).then(function (j) {
    canSaveToSite = !!(j && j.ok);
    if (!canSaveToSite) saveBtn.textContent = 'Copy positions';
  }).catch(function () { saveBtn.textContent = 'Copy positions'; });

  function cssBlock(pos) {
    return Object.keys(pos).filter(function (k) { return pos[k].x || pos[k].y; }).map(function (k) {
      return '[data-move="' + k + '"] { --mx: ' + pos[k].x + '; --my: ' + pos[k].y + '; }';
    }).join('\n');
  }

  bar.addEventListener('click', function (e) {
    var act = e.target.getAttribute && e.target.getAttribute('data-act');
    if (!act) return;
    if (act === 'reset-one' && selected) { write(selected, 0, 0); saveDraft(); describe(); }
    if (act === 'reset-all') { items.forEach(function (el) { write(el, 0, 0); }); saveDraft(); describe(); say('Everything is back at its original place. Save to site to keep that.'); }
    if (act === 'flip') { bar.classList.toggle('lp-edit-top'); }
    if (act === 'exit') { location.href = location.pathname; }
    if (act === 'save') {
      var pos = all();
      if (!canSaveToSite) {
        var text = cssBlock(pos) || '/* nothing has been moved */';
        (navigator.clipboard ? navigator.clipboard.writeText(text) : Promise.reject()).then(function () {
          say('Copied. Paste it between the MOVED markers at the end of css/styles.css.');
        }, function () { window.prompt('Copy these lines into css/styles.css, between the MOVED markers:', text); });
        return;
      }
      saveBtn.disabled = true; say('Saving...');
      fetch('__layout', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(pos) })
        .then(function (r) { return r.json().then(function (j) { if (!r.ok || !j.ok) throw new Error(j.error || 'save failed'); return j; }); })
        .then(function (j) {
          /* the stylesheet now holds these positions, so the browser draft is no longer needed */
          clearDraft();
          say('Saved to css/styles.css (' + j.moved + ' piece' + (j.moved === 1 ? '' : 's') + ' moved). This is now the layout for everyone.');
        })
        .catch(function (err) { say('Could not save: ' + err.message + '. Your moves are still kept in this browser.'); })
        .then(function () { saveBtn.disabled = false; });
    }
  });

  /* ---- dragging ---------------------------------------------------------- */
  function scale() { return frame.getBoundingClientRect().width / DESIGN_WIDTH; }
  function isDesktop() { return window.matchMedia('(min-width: 641px)').matches; }
  var drag = null;

  document.addEventListener('pointerdown', function (e) {
    if (bar.contains(e.target)) return;
    var el = e.target.closest && e.target.closest('[data-move]');
    if (!isDesktop()) { say('Edit mode works on the desktop layout. Make the window wider.'); return; }
    select(el || null);
    if (!el) return;
    e.preventDefault();
    var p = read(el);
    drag = { el: el, id: e.pointerId, sx: e.clientX, sy: e.clientY, ox: p.x, oy: p.y, k: scale() };
    document.documentElement.classList.add('lp-edit-dragging');
  }, true);
  document.addEventListener('pointermove', function (e) {
    if (!drag || e.pointerId !== drag.id) return;
    write(drag.el, drag.ox + (e.clientX - drag.sx) / drag.k, drag.oy + (e.clientY - drag.sy) / drag.k);
    describe();
  }, true);
  function endDrag(e) {
    if (!drag || (e && e.pointerId !== drag.id)) return;
    drag = null;
    document.documentElement.classList.remove('lp-edit-dragging');
    saveDraft();
  }
  document.addEventListener('pointerup', endDrag, true);
  document.addEventListener('pointercancel', endDrag, true);

  /* links, buttons and the form do nothing while editing */
  ['click', 'submit', 'dragstart'].forEach(function (type) {
    document.addEventListener(type, function (e) {
      if (bar.contains(e.target)) return;
      e.preventDefault(); e.stopPropagation();
    }, true);
  });

  document.addEventListener('keydown', function (e) {
    if (!selected) return;
    var step = e.shiftKey ? 10 : 1;
    var d = { ArrowLeft: [-step, 0], ArrowRight: [step, 0], ArrowUp: [0, -step], ArrowDown: [0, step] }[e.key];
    if (e.key === 'Escape') { select(null); return; }
    if (!d) return;
    e.preventDefault();
    var p = read(selected);
    write(selected, p.x + d[0], p.y + d[1]);
    saveDraft(); describe();
  });
})();
