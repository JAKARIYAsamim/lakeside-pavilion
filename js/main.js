/* Lakeside Pavilion hero: small behaviours.
   1. The two "register" buttons move the cursor to the email field.
   2. The sign-up form checks the email and shows a message.
   3. The opening animation (at the bottom of this file). Its timing lives in
      the OPENING ANIMATION part of css/styles.css.

   The form is NOT connected to anything yet. To collect emails, replace the
   marked block below with a request to your own endpoint or mailing-list
   service, and show the success message only after that request succeeds. */

(function () {
  var form = document.getElementById('notify');
  var email = document.getElementById('email');
  var note = document.getElementById('note');

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    var value = email.value.trim();

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
      note.textContent = 'Enter a valid email, for example name@example.com.';
      email.focus();
      return;
    }

    /* ---- REPLACE THIS BLOCK when the form is connected -------------------
       Example:
       fetch('https://your-endpoint.example/subscribe', {
         method: 'POST',
         headers: { 'Content-Type': 'application/json' },
         body: JSON.stringify({ email: value })
       })
         .then(function (r) { if (!r.ok) throw new Error(); note.textContent = 'Thank you. We will email you when we launch.'; form.reset(); })
         .catch(function () { note.textContent = 'That did not go through. Please try again.'; });
    ----------------------------------------------------------------------- */
    note.textContent = 'Design preview: sign-ups are not connected yet, so nothing was sent.';
  });

  document.querySelectorAll('[data-focus-email]').forEach(function (link) {
    link.addEventListener('click', function (e) {
      e.preventDefault();
      email.focus();
    });
  });
})();

/* ---- Opening animation ---------------------------------------------------
   Splits the giant name into letters and the tagline into lines so each can
   move on its own, then starts the animation once the fonts have loaded. */
(function () {
  var root = document.documentElement;
  if (!root.classList.contains('intro-wait')) return;   /* motion turned off */
  var started = false;

  /* Wrap each letter of a word in <span class="ch">. Separate letters lose the
     font's fine spacing between pairs such as "AV", so each letter is nudged
     back to exactly where it sat before. */
  function splitLetters(word) {
    var text = word.textContent;
    var node = word.firstChild;
    var range = document.createRange();
    var before = [];
    var i;
    for (i = 0; i < text.length; i++) {
      range.setStart(node, i);
      range.setEnd(node, i + 1);
      before.push(range.getBoundingClientRect().left);
    }
    word.textContent = '';
    var letters = text.split('').map(function (c, n) {
      var s = document.createElement('span');
      s.className = 'ch';
      s.textContent = c;
      s.style.setProperty('--i', n);
      word.appendChild(s);
      return s;
    });
    var size = parseFloat(getComputedStyle(word).fontSize);
    var after = letters.map(function (s) { return s.getBoundingClientRect().left; });
    var moved = 0;
    for (i = 1; i < letters.length; i++) {
      var gap = (before[i] - before[0]) - (after[i] - after[0]) - moved;
      if (Math.abs(gap) > 0.01) letters[i].style.marginLeft = (gap / size).toFixed(4) + 'em';
      moved += gap;
    }
  }

  /* Wrap each line of the tagline (lines are separated by <br>). */
  function splitLines(el) {
    el.innerHTML = el.innerHTML.split(/<br\s*\/?>/i).map(function (line, n) {
      return '<span class="ln"><span style="--i:' + n + '">' + line.trim() + '</span></span>';
    }).join('');
  }

  function start() {
    if (started) return;
    started = true;
    try {
      /* each word of the headline is split into letters; the letter count runs on along the line so they rise in order */
      document.querySelectorAll('.giant .gl').forEach(function (line) {
        var count = 0;
        Array.prototype.forEach.call(line.querySelectorAll('.gw'), function (word) {
          splitLetters(word);
          Array.prototype.forEach.call(word.querySelectorAll('.ch'), function (c) { c.style.setProperty('--i', count++); });
          word.style.setProperty('--n', count);
          count++;
        });
      });
      document.querySelectorAll('.tag').forEach(splitLines);
    } catch (e) { /* if anything goes wrong the text simply fades in whole */ }
    root.classList.remove('intro-wait');
    root.classList.add('intro-play');
  }

  if (document.fonts && document.fonts.ready) document.fonts.ready.then(start);
  setTimeout(start, 1200);   /* do not wait longer than this for the fonts */
})();

/* ---- About section: rise into view once ------------------------------------
   The section is hidden a little ("is-waiting") only when this script can also
   show it again, and never for visitors who turn motion off or in edit mode. */
(function () {
  var about = document.querySelector('.about');
  if (!about || !('IntersectionObserver' in window)) return;
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches || /[?&]edit\b/.test(location.search)) return;
  about.classList.add('is-waiting');
  var seen = new IntersectionObserver(function (entries) {
    if (!entries[0].isIntersecting) return;
    about.classList.remove('is-waiting');
    seen.disconnect();
  }, { threshold: 0.22 });
  seen.observe(about);
})();

/* ---- Trust strip: make the row loop without a gap ---------------------------
   The row of badges in index.html is repeated enough times to fill any screen,
   and the animation slides it by exactly one row's width, so the loop never
   shows a seam. Visitors who turn motion off get one still row instead. */
(function () {
  var strip = document.querySelector('.trust');
  var track = strip && strip.querySelector('.trust-track');
  if (!track || !track.children.length) return;
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  var originals = Array.prototype.slice.call(track.children);
  function rowWidth() { return originals[originals.length - 1].getBoundingClientRect().right - originals[0].getBoundingClientRect().left + parseFloat(getComputedStyle(originals[0]).marginRight || 0); }
  function fill() {
    var w = rowWidth();
    if (!w) return;
    var copies = Math.ceil(Math.max(window.innerWidth, 1600) / w) + 1;
    while (track.children.length < originals.length * copies) {
      originals.forEach(function (item) {
        var copy = item.cloneNode(true);
        copy.setAttribute('aria-hidden', 'true');
        track.appendChild(copy);
      });
    }
    track.style.setProperty('--trust-shift', w + 'px');
    strip.classList.add('is-moving');
  }
  fill();
  window.addEventListener('resize', fill);
  window.addEventListener('load', fill);   /* logo images may change the width once they load */
})();

/* ---- Ownership offer: split the headline into letters ---------------------------
   Same idea as the hero name: each letter gets its own box (.dc) inside a word
   box (.dw) so the letters can rise one after another when the section is first
   seen. The timing is in the OWNERSHIP OFFER part of css/styles.css. */
(function () {
  var title = document.querySelector('.deed-title');
  if (!title || !('IntersectionObserver' in window)) return;
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  try {
    var n = 0;
    title.setAttribute('aria-label', title.textContent.replace(/\s+/g, ' ').trim());
    (function walk(node) {
      Array.prototype.slice.call(node.childNodes).forEach(function (child) {
        if (child.nodeType === 1 && child.classList.contains('deed-price')) {   /* the price rises as one piece, so its number can count */
          var box = document.createElement('span'), inner = document.createElement('span');
          box.className = 'dw'; inner.className = 'dc'; inner.style.setProperty('--i', n); n += 4;
          node.replaceChild(box, child); inner.appendChild(child); box.appendChild(inner);
          return;
        }
        if (child.nodeType === 1) { walk(child); return; }
        if (child.nodeType !== 3 || !child.textContent.trim()) return;
        var frag = document.createDocumentFragment();
        child.textContent.split(/(\s+)/).forEach(function (part) {
          if (!part) return;
          if (/^\s+$/.test(part)) { frag.appendChild(document.createTextNode(' ')); return; }
          var word = document.createElement('span');
          word.className = 'dw';
          Array.from(part).forEach(function (c) {
            var letter = document.createElement('span');
            letter.className = 'dc';
            letter.textContent = c;
            letter.style.setProperty('--i', n++);
            word.appendChild(letter);
          });
          frag.appendChild(word);
        });
        node.replaceChild(frag, child);
      });
    })(title);
    title.classList.add('is-split');
  } catch (e) { /* if anything goes wrong the headline simply fades in whole */ }
})();

/* ---- Number strip, offer and gallery: rise into view and count the numbers up, once ---------------
   Each number in index.html is written out in full, so it reads correctly
   without this script. Here it restarts from zero and counts up when the
   section is first seen. Skipped for visitors who turn motion off. */
['.stats', '.deed', '.gallery', '.reels', '.door', '.foot'].forEach(function (name) {
  var area = document.querySelector(name);
  if (!area || !('IntersectionObserver' in window)) return;
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  var nums = Array.prototype.slice.call(area.querySelectorAll('[data-count]'));
  function show(el, value) {
    var d = parseInt(el.getAttribute('data-decimals'), 10) || 0;
    el.textContent = value.toLocaleString('en-US', { minimumFractionDigits: d, maximumFractionDigits: d });
  }
  function count(el, delay) {
    var to = parseFloat(el.getAttribute('data-count'));
    var from = parseFloat(el.getAttribute('data-from')) || 0;      /* data-from above data-count makes it count down */
    var start = null;
    var length = parseFloat(el.getAttribute('data-length')) || 1600;
    if (el.hasAttribute('data-delay')) delay = parseFloat(el.getAttribute('data-delay'));
    function step(now) {
      if (start === null) start = now + delay;
      var t = Math.min(Math.max((now - start) / length, 0), 1);
      show(el, from + (to - from) * (1 - Math.pow(1 - t, 4)));      /* fast at first, easing into the final number */
      if (t < 1) requestAnimationFrame(step); else show(el, to);
    }
    requestAnimationFrame(step);
  }
  area.classList.add('is-waiting');
  nums.forEach(function (el) { show(el, parseFloat(el.getAttribute('data-from')) || 0); });
  var seen = new IntersectionObserver(function (entries) {
    if (!entries[0].isIntersecting) return;
    area.classList.remove('is-waiting');
    nums.forEach(function (el, i) { count(el, 160 + i * 80); });
    seen.disconnect();
  }, { threshold: name === '.gallery' ? 0.08 : 0.18 });
  seen.observe(area);
});

/* ---- Gallery: pictures on a curved wall ---------------------------------------
   The pictures stand on the inside of a cylinder and the viewer is at its
   centre, so the middle picture looks smallest and the side ones lean in. The
   wall turns slowly by itself; drag it to turn it by hand. Visitors who turn
   motion off get a still wall they can still drag. */
(function () {
  var arc = document.querySelector('.arc');
  if (!arc) return;
  var cards = Array.prototype.slice.call(arc.children);
  if (cards.length < 5) return;                       /* too few to wrap round: leave the simple row */
  var still = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var speed = parseFloat(getComputedStyle(arc.parentNode).getPropertyValue('--arc-speed')) || 0;
  var turn = 0, eye = 0, step = 0, span = 0, onScreen = false, held = false, lastX = 0, glide = 0, last = 0;
  var rows = cards.length >= 24 ? 3 : 1, perRow = Math.ceil(cards.length / rows), rowGap = 0;   /* enough pictures: three rows */

  function measure() {
    var w = arc.clientWidth || window.innerWidth;
    var wide = w >= 900;
    step = rows > 1 ? (wide ? 15 : 20) : (wide ? 22.5 : 27);   /* degrees between pictures */
    eye = w * (wide ? 0.41 : 0.78);                   /* distance from the viewer to the wall */
    span = step * perRow;
    var cw = 2 * eye * Math.tan(step * Math.PI / 360) * 0.93, ch = cw * 4 / 3;
    var edge = Math.min(Math.atan(w / 2 / eye), 62 * Math.PI / 180);
    arc.style.setProperty('--arc-w', cw.toFixed(1) + 'px');
    arc.style.setProperty('--arc-h', ch.toFixed(1) + 'px');
    rowGap = ch * 1.06;                               /* from the middle of one row to the middle of the next */
    /* one row: tall enough for the leaning pictures at the sides. Three rows: a little shorter than that,
       so the top and bottom rows run off the edge at the sides and the wall feels bigger than the window. */
    arc.style.height = (rows > 1 ? (rowGap * (rows - 1) + ch) * 1.16 : ch / Math.cos(edge) * 1.04).toFixed(0) + 'px';
    arc.style.perspective = eye.toFixed(1) + 'px';
    glass(w, parseFloat(arc.style.height));
    place();
  }
  function place() {
    for (var i = 0; i < cards.length; i++) {
      var row = Math.floor(i / perRow), lift = (row - (rows - 1) / 2) * rowGap;
      var a = (((i % perRow) * step + (row % 2 ? 0 : step / 2) * (rows > 1) + turn) % span + span) % span;   /* outer rows sit half a step across, like bricks */
      if (a > span / 2) a -= span;                    /* now between -span/2 and +span/2, 0 = straight ahead */
      if (Math.abs(a) > 70) { cards[i].style.visibility = 'hidden'; continue; }
      cards[i].style.visibility = '';
      cards[i].style.transform = 'translateZ(' + eye.toFixed(1) + 'px) rotateY(' + a.toFixed(3) + 'deg) translate3d(0,' + lift.toFixed(1) + 'px,' + (-eye).toFixed(1) + 'px)';
    }
  }
  function frame(now) {
    var dt = Math.min((now - last) / 1000, 0.05); last = now;
    if (!held) {
      if (Math.abs(glide) > 0.5) { turn += glide * dt; glide *= Math.pow(0.04, dt); }   /* coast after a drag */
      else if (!still) turn += speed * dt;
      place();
    }
    if (onScreen) requestAnimationFrame(frame);
  }

  /* Pixel mosaic: the gallery is shown as big square "pixels". An SVG filter makes every point inside a
     square show the colour at the centre of that square: it moves each pixel by an amount read from a
     map picture (red = how far sideways, green = how far up or down), which is drawn on a canvas here. */
  var NS = 'http://www.w3.org/2000/svg', glassMap = null;
  function glass(w, h) {
    try {
      var across = parseFloat(getComputedStyle(arc.parentNode).getPropertyValue('--pixels'));   /* squares across the screen */
      if (!(across > 0)) { arc.classList.remove('is-fluted'); return; }
      w = Math.round(w); h = Math.round(h);
      var size = Math.round(Math.min(Math.max(w / across, 4), 200));            /* one square, in whole screen pixels */
      if (!glassMap) {
        glassMap = document.createElementNS(NS, 'svg');
        glassMap.setAttribute('width', '0'); glassMap.setAttribute('height', '0'); glassMap.setAttribute('aria-hidden', 'true');
        glassMap.style.position = 'absolute';
        document.body.appendChild(glassMap);
      }
      var r = 1;
      var c = document.createElement('canvas'); c.width = Math.round(w * r); c.height = Math.round(h * r);
      var g = c.getContext('2d'), img = g.createImageData(c.width, c.height), d = img.data;
      var left = (w - Math.ceil(w / size) * size) / 2;                          /* centre the grid */
      var sx = new Uint8Array(c.width), sy = new Uint8Array(c.height), i;
      for (i = 0; i < c.width; i++) { var x = (i + 0.5) / r; sx[i] = 128 + Math.round((Math.floor((x - left) / size) + 0.5) * size + left - x); }
      for (i = 0; i < c.height; i++) { var y = (i + 0.5) / r; sy[i] = 128 + Math.round((Math.floor(y / size) + 0.5) * size - y); }
      for (var py = 0, o = 0; py < c.height; py++) for (var px = 0; px < c.width; px++, o += 4) { d[o] = sx[px]; d[o + 1] = sy[py]; d[o + 3] = 255; }
      g.putImageData(img, 0, 0);
      var u = c.toDataURL('image/png');
      glassMap.innerHTML = '<filter id="lp-flute" xmlns:xlink="http://www.w3.org/1999/xlink" x="0" y="0" width="100%" height="100%" color-interpolation-filters="sRGB">' +
        '<feImage result="map" preserveAspectRatio="none" x="0" y="0" width="' + w + '" height="' + h + '" href="' + u + '" xlink:href="' + u + '"/>' +
        '<feDisplacementMap in="SourceGraphic" in2="map" scale="255" xChannelSelector="R" yChannelSelector="G"/></filter>';
      arc.classList.add('is-fluted');
    } catch (e) { arc.classList.remove('is-fluted'); }                          /* plain blur stays as the fallback */
  }

  arc.classList.add('is-3d');
  turn = -step * 2;                                   /* start with the third picture in the middle */
  measure();
  window.addEventListener('resize', measure);

  arc.addEventListener('pointerdown', function (e) { held = true; lastX = e.clientX; glide = 0; arc.classList.add('is-held'); arc.setPointerCapture(e.pointerId); });
  arc.addEventListener('pointermove', function (e) {
    if (!held) return;
    var d = (e.clientX - lastX) / eye * 180 / Math.PI;                                  /* pixels dragged, as degrees of turn */
    lastX = e.clientX; turn -= d; glide = -d * 60; place();
  });
  function letGo() { held = false; arc.classList.remove('is-held'); }
  arc.addEventListener('pointerup', letGo);
  arc.addEventListener('pointercancel', letGo);

  if ('IntersectionObserver' in window) {
    new IntersectionObserver(function (entries) {
      var was = onScreen; onScreen = entries[0].isIntersecting;
      if (onScreen && !was) { last = performance.now(); requestAnimationFrame(frame); }
    }).observe(arc);
  } else { onScreen = true; requestAnimationFrame(frame); }
})();

/* ---- Gold pattern: draw itself when a green section is first seen -------------
   The pattern picture (assets/pattern-gold.svg) is read once and placed in the
   page as real line-work, laid like tiles over each green area. Every line
   starts undrawn; when the area scrolls into view the lines are traced one
   after another (timing in the GOLD PATTERN DRAWS part of css/styles.css).
   The closing section's tiles start where the tiles above it stop, so the grid
   runs on without a break. If the picture cannot be read, the still pattern in
   the background stays instead. Visitors who turn motion off see it drawn. */
(function () {
  var zone = document.querySelector('.dark-zone'), door = document.querySelector('.door');
  if (!zone || !door || !window.fetch || !('IntersectionObserver' in window)) return;
  var NS = 'http://www.w3.org/2000/svg';
  var still = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  fetch('assets/pattern-gold.svg').then(function (r) { if (!r.ok) throw new Error(); return r.text(); }).then(function (text) {
    var src = new DOMParser().parseFromString(text, 'image/svg+xml').documentElement;
    var tile = parseFloat(src.getAttribute('width')) || 600;                 /* the picture's own size: one repeat */
    var group = src.querySelector('g');
    if (!group) return;
    var layers = [zone, door].map(function (host, n) {
      var svg = document.createElementNS(NS, 'svg');
      svg.setAttribute('class', 'gold-pattern'); svg.setAttribute('aria-hidden', 'true');
      var g = document.importNode(group, true);                             /* one repeat of the pattern, kept as the master copy */
      Array.prototype.forEach.call(g.querySelectorAll('path'), function (path, k) {
        path.setAttribute('pathLength', '1');                                /* so "1" always means the whole line, whatever its length */
        var at = /translate\(([\d.]+)[ ,]+([\d.]+)\)/.exec(path.getAttribute('transform') || '');
        var col = at ? parseFloat(at[1]) / 100 : k % 6, row = at ? parseFloat(at[2]) / 100 : 0;
        path.style.setProperty('--n', (at ? 0.35 + row * 0.5 + col * 0.3 : k * 0.25).toFixed(2));   /* grid lines first, then shapes, sweeping down and across */
      });
      host.insertBefore(svg, host.firstChild);
      return { host: host, svg: svg, master: g };
    });

    function lay() {
      var size = parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--pattern-size')) || 660;
      var k = size / tile, carry = zone.offsetHeight % size;
      layers.forEach(function (L, n) {
        var w = L.host.offsetWidth, h = L.host.offsetHeight;
        L.svg.setAttribute('width', w); L.svg.setAttribute('height', h); L.svg.setAttribute('viewBox', '0 0 ' + w + ' ' + h);
        var x0 = (w - size) / 2; x0 -= Math.ceil(x0 / size) * size;          /* centred, like the still background was */
        var y0 = n === 1 ? -carry : 0;                                       /* the closing section carries on from the area above */
        while (L.svg.firstChild) L.svg.removeChild(L.svg.firstChild);
        for (var y = y0; y < h; y += size) for (var x = x0; x < w; x += size) {
          var copy = L.master.cloneNode(true);                               /* a real copy of every line, so each can be drawn */
          copy.setAttribute('transform', 'translate(' + x.toFixed(1) + ' ' + y.toFixed(1) + ') scale(' + k.toFixed(4) + ')');
          L.svg.appendChild(copy);
        }
      });
    }
    lay();
    document.documentElement.style.setProperty('--pattern-on', 'none');      /* the drawn lines replace the still background pattern */
    var t; function relay() { clearTimeout(t); t = setTimeout(lay, 120); }
    window.addEventListener('resize', relay); window.addEventListener('load', lay);
    if ('ResizeObserver' in window) { var ro = new ResizeObserver(relay); ro.observe(zone); ro.observe(door); }

    layers.forEach(function (L) {
      if (still) { L.svg.classList.add('is-drawn', 'is-still'); return; }
      var seen = new IntersectionObserver(function (entries) {
        if (!entries[0].isIntersecting) return;
        L.svg.classList.add('is-drawn'); seen.disconnect();
      }, { rootMargin: '0px 0px -18% 0px' });                                /* start once a good part of it is on screen */
      seen.observe(L.host);
    });
  }).catch(function () { /* keep the still background pattern */ });
})();

/* ---- Reels: play a card when it is pressed --------------------------------------
   Pressing a card (or its round button) plays that video with sound and stops
   any other; pressing again pauses it. A video also pauses when it scrolls off
   the screen. If a card's video file is missing, the card shows "Video coming
   soon" instead of a play button. */
(function () {
  var cards = Array.prototype.slice.call(document.querySelectorAll('[data-reel]'));
  if (!cards.length) return;
  function stop(card) { var v = card.querySelector('video'); if (v && !v.paused) v.pause(); card.classList.remove('is-playing'); }
  cards.forEach(function (card) {
    var video = card.querySelector('video'), btn = card.querySelector('.reel-play');
    if (!video) return;
    function empty() { card.classList.add('is-empty'); if (btn) btn.setAttribute('aria-hidden', 'true'); }
    video.addEventListener('error', empty);
    /* ask only for the file's first bytes, to learn whether it exists, without downloading the video */
    if (window.fetch) fetch(video.getAttribute('src'), { method: 'HEAD' }).then(function (r) { if (!r.ok) empty(); }).catch(empty);
    function toggle() {
      if (card.classList.contains('is-empty')) return;
      if (!video.paused) { stop(card); return; }
      cards.forEach(function (other) { if (other !== card) stop(other); });
      var started = video.play();
      card.classList.add('is-playing');
      if (started && started.catch) started.catch(function () { card.classList.remove('is-playing'); });
    }
    card.addEventListener('click', toggle);
    video.addEventListener('pause', function () { card.classList.remove('is-playing'); });
    video.addEventListener('play', function () { card.classList.add('is-playing'); });
    if ('IntersectionObserver' in window) new IntersectionObserver(function (entries) { if (!entries[0].isIntersecting) stop(card); }, { threshold: 0.15 }).observe(card);
  });
})();

/* ---- Reels: the gold line round each card ----------------------------------------
   Draws a thin gold outline to fit each card (a rounded rectangle starting at the
   top middle and running clockwise). css/styles.css makes it trace itself when
   the section is first seen. Redrawn whenever a card changes size. */
(function () {
  var cards = Array.prototype.slice.call(document.querySelectorAll('.reel'));
  if (!cards.length) return;
  var NS = 'http://www.w3.org/2000/svg';
  function outline(card, i) {
    var w = card.clientWidth, h = card.clientHeight;
    if (!w || !h) return;
    var svg = card.querySelector('.reel-line');
    if (!svg) {
      svg = document.createElementNS(NS, 'svg'); svg.setAttribute('class', 'reel-line'); svg.setAttribute('aria-hidden', 'true');
      var path = document.createElementNS(NS, 'path'); path.setAttribute('pathLength', '1'); path.style.setProperty('--i', i);
      svg.appendChild(path); card.appendChild(svg);
    }
    var r = Math.max(parseFloat(getComputedStyle(card).borderTopLeftRadius) - 1, 0), a = 1, b = w - 1, c = h - 1;   /* 1px inside the card's edge */
    svg.setAttribute('viewBox', '0 0 ' + w + ' ' + h);
    svg.firstChild.setAttribute('d', 'M' + (w / 2) + ' ' + a + ' H' + (b - r) + ' A' + r + ' ' + r + ' 0 0 1 ' + b + ' ' + (a + r) + ' V' + (c - r) +
      ' A' + r + ' ' + r + ' 0 0 1 ' + (b - r) + ' ' + c + ' H' + (a + r) + ' A' + r + ' ' + r + ' 0 0 1 ' + a + ' ' + (c - r) + ' V' + (a + r) +
      ' A' + r + ' ' + r + ' 0 0 1 ' + (a + r) + ' ' + a + ' Z');
  }
  function all() { cards.forEach(outline); }
  all();
  window.addEventListener('resize', all); window.addEventListener('load', all);
  if ('ResizeObserver' in window) { var ro = new ResizeObserver(all); cards.forEach(function (c) { ro.observe(c); }); }
})();

/* ---- Countdown to the launch (hero and footer) ---------------------------------------
   The launch moment is written once, in data-launch on the countdown in the hero
   (index.html). Every countdown on the page shows the days, hours, minutes and
   seconds left, updated each second. When the moment has passed, each shows the
   words from data-done on the hero countdown instead. */
(function () {
  var first = document.querySelector('[data-launch]');
  if (!first) return;
  var boxes = Array.prototype.slice.call(document.querySelectorAll('[data-launch], [data-count-follow]'));
  var when = new Date(first.getAttribute('data-launch')).getTime(), done = first.getAttribute('data-done') || '';
  if (isNaN(when)) { boxes.forEach(function (b) { b.style.display = 'none'; }); return; }   /* no usable date: show nothing rather than wrong numbers */
  function two(n) { return n < 10 ? '0' + n : String(n); }
  var timer;
  function tick() {
    var left = Math.floor((when - Date.now()) / 1000);
    boxes.forEach(function (box) {
      if (left <= 0) {
        box.classList.add('is-done');
        (box.querySelector('.count-in') || box).textContent = done;
        return;
      }
      var v = { d: Math.floor(left / 86400), h: Math.floor(left % 86400 / 3600), m: Math.floor(left % 3600 / 60), s: left % 60 };
      Array.prototype.forEach.call(box.querySelectorAll('[data-unit]'), function (el) { el.textContent = two(v[el.getAttribute('data-unit')]); });
    });
    if (left <= 0) clearInterval(timer);
  }
  tick();
  timer = setInterval(tick, 1000);
})();

/* ---- Footer: the email box, and the drawing that draws itself -----------------------
   The email box behaves like the one in the hero: it checks the address and shows
   a message. It is NOT connected to anything yet (see the note at the top of this
   file). The gold drawing is traced once, when it first comes into view. */
(function () {
  var form = document.getElementById('foot-notify'), field = document.getElementById('foot-email'), note = document.getElementById('foot-note');
  if (form && field && note) form.addEventListener('submit', function (e) {
    e.preventDefault();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(field.value.trim())) { note.textContent = 'Enter a valid email, for example name@example.com.'; field.focus(); return; }
    note.textContent = 'Design preview: sign-ups are not connected yet, so nothing was sent.';
  });
  var scene = document.querySelector('.foot-scene');
  if (!scene) return;
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches || !('IntersectionObserver' in window)) { scene.classList.add('is-drawn', 'is-still'); return; }
  var seen = new IntersectionObserver(function (entries) {
    if (!entries[0].isIntersecting) return;
    scene.classList.add('is-drawn'); seen.disconnect();
  }, { threshold: 0.3 });
  seen.observe(scene);
})();
