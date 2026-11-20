/* ---- Register page form (register.html) ------------------------------------
   Same checks as the pop-up on the main page (js/main.js). NOT connected yet:
   replace the marked block with a request to your own endpoint, and show the
   thank-you only after it succeeds. */
(function () {
  var form = document.getElementById('ri-form'), note = document.getElementById('ri-note');
  if (!form) return;

  /* an email typed on the main page can be passed along: register.html?email=name@example.com */
  var pre = new URLSearchParams(location.search).get('email');
  if (pre) form.email.value = pre;

  function fail(field, text) {
    note.textContent = text; note.classList.add('is-error'); note.classList.remove('is-ok');
    field.setAttribute('aria-invalid', 'true'); field.focus();
  }
  form.addEventListener('input', function (e) { e.target.removeAttribute('aria-invalid'); });

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    var f = form;
    if (f.name.value.trim().length < 2) return fail(f.name, 'Please enter your name.');
    if (f.phone.value.replace(/[^\d]/g, '').length < 8) return fail(f.phone, 'Please enter a phone number we can reach you on.');
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(f.email.value.trim())) return fail(f.email, 'Enter a valid email, for example name@example.com.');

    var data = { name: f.name.value.trim(), phone: f.phone.value.trim(), email: f.email.value.trim() };
    /* ---- REPLACE THIS BLOCK when the form is connected -------------------
       fetch('https://your-endpoint.example/register', {
         method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data)
       }).then(function (r) { if (!r.ok) throw new Error(); ...show thank-you... })
         .catch(function () { note.textContent = 'That did not go through. Please try again.'; });
    ----------------------------------------------------------------------- */
    void data;
    note.classList.remove('is-error'); note.classList.add('is-ok');
    note.textContent = 'Thank you. Design preview: the form is not connected yet, so nothing was sent.';
  });
})();
