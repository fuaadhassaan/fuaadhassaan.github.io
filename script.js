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

// Motion: blocks rise as they are scrolled to, a progress line follows the scroll, and the menu marks the section in view.
(function () {
  var blocks = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window) {
    var seen = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) { entry.target.classList.add('in'); seen.unobserve(entry.target); }
      });
    }, { threshold: 0.08, rootMargin: '0px 0px -6% 0px' });
    blocks.forEach(function (block) { seen.observe(block); });

    var links = {};
    document.querySelectorAll('.top nav a').forEach(function (a) { links[a.getAttribute('href').slice(1)] = a; });
    var spy = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        Object.keys(links).forEach(function (id) { links[id].classList.toggle('on', id === entry.target.id); });
      });
    }, { rootMargin: '-40% 0px -55% 0px' });
    Object.keys(links).forEach(function (id) { var s = document.getElementById(id); if (s) spy.observe(s); });
  } else {
    blocks.forEach(function (block) { block.classList.add('in'); });
  }

  var bar = document.getElementById('progress');
  if (bar) {
    var tick = false;
    var draw = function () {
      var max = document.documentElement.scrollHeight - window.innerHeight;
      bar.style.transform = 'scaleX(' + (max > 0 ? Math.min(1, window.scrollY / max) : 0) + ')';
      tick = false;
    };
    window.addEventListener('scroll', function () { if (!tick) { tick = true; requestAnimationFrame(draw); } }, { passive: true });
    draw();
  }
})();
