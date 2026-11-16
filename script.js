// Theme switch: remembered in this browser; the system's setting is used until it is pressed.
(function () {
  var root = document.documentElement;
  var button = document.getElementById('theme');
  if (button) {
    button.addEventListener('click', function () {
      var dark = root.dataset.theme
        ? root.dataset.theme === 'dark'
        : window.matchMedia('(prefers-color-scheme: dark)').matches;
      root.dataset.theme = dark ? 'light' : 'dark';
      try { localStorage.setItem('theme', root.dataset.theme); } catch (e) { /* not remembered */ }
    });
  }

  var year = document.getElementById('year');
  if (year) year.textContent = String(new Date().getFullYear());

  // Copy email, with a fallback of simply saying what it is.
  var copy = document.getElementById('copy-email');
  var said = document.getElementById('copied');
  if (copy && said) {
    copy.addEventListener('click', function () {
      var email = 'fuaadhassaan@gmail.com';
      var done = function () { said.textContent = 'Copied: ' + email; };
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(email).then(done, function () { said.textContent = email; });
      } else {
        said.textContent = email;
      }
    });
  }
})();
