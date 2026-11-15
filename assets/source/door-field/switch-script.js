/* ---- Closing section: switch between its two looks ---------------------------
   On your own computer (address starts with 127.0.0.1 or localhost) a "Switch
   door picture" button appears in the closing section. It flips between the
   doors in the field and the gold door, and this browser remembers the choice.
   Visitors to the published site never see the button: they get the look named
   in data-look on the section in index.html. */
(function () {
  var door = document.querySelector('.door');
  if (!door || !/^(127\.0\.0\.1|localhost)$/.test(location.hostname)) return;
  var names = { field: 'Doors in the field', gold: 'Gold door' };
  try { var saved = localStorage.getItem('lp-door-look'); if (names[saved]) door.setAttribute('data-look', saved); } catch (e) {}
  var btn = document.createElement('button');
  btn.type = 'button'; btn.className = 'door-switch';
  function label() { var now = door.getAttribute('data-look'); btn.textContent = 'Switch door picture \u21c4  (now: ' + names[now] + ')'; }
  btn.addEventListener('click', function () {
    var next = door.getAttribute('data-look') === 'gold' ? 'field' : 'gold';
    door.setAttribute('data-look', next);
    try { localStorage.setItem('lp-door-look', next); } catch (e) {}
    label();
  });
  label();
  door.appendChild(btn);
})();
