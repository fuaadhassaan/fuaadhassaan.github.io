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

// Modern finish: nav shadow once scrolled, back-to-top, card spotlight, and the facts counting up once.
(function () {
  var still = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  var top = document.querySelector('.top');
  var up = document.getElementById('to-top');
  var onScroll = function () {
    var y = window.scrollY;
    if (top) top.classList.toggle('scrolled', y > 8);
    if (up) up.classList.toggle('show', y > 700);
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();
  if (up) up.addEventListener('click', function () { window.scrollTo({ top: 0, behavior: still ? 'auto' : 'smooth' }); });

  // The glow under a card follows the pointer.
  document.querySelectorAll('.card, .feature').forEach(function (card) {
    card.addEventListener('pointermove', function (event) {
      var box = card.getBoundingClientRect();
      card.style.setProperty('--mx', (event.clientX - box.left) + 'px');
      card.style.setProperty('--my', (event.clientY - box.top) + 'px');
    });
  });

  // Numbers in the facts count up from zero the first time they are seen.
  if (still || !('IntersectionObserver' in window)) return;
  var numbers = Array.prototype.filter.call(document.querySelectorAll('.facts b'), function (b) { return /^\d+/.test(b.textContent); });
  var watch = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (!entry.isIntersecting) return;
      watch.unobserve(entry.target);
      var el = entry.target;
      var text = el.textContent;
      var target = parseInt(text, 10);
      var rest = text.slice(String(target).length);
      var start = null;
      var step = function (now) {
        if (start === null) start = now;
        var t = Math.min(1, (now - start) / 900);
        el.textContent = Math.round(target * (1 - Math.pow(1 - t, 3))) + rest;
        if (t < 1) requestAnimationFrame(step);
      };
      requestAnimationFrame(step);
    });
  }, { threshold: 0.6 });
  numbers.forEach(function (b) { watch.observe(b); });
})();

// Projects: stagger indexes for tags and points, and a gentle 3D tilt that follows the pointer.
(function () {
  document.querySelectorAll('.stack, .ticks').forEach(function (list) {
    Array.prototype.forEach.call(list.children, function (item, j) { item.style.setProperty('--j', j); });
  });

  var still = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var fine = window.matchMedia && window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  if (still || !fine) return;

  document.querySelectorAll('.grid .card').forEach(function (card) {
    var frame = 0;
    card.addEventListener('pointermove', function (event) {
      if (frame) return;
      frame = requestAnimationFrame(function () {
        frame = 0;
        var box = card.getBoundingClientRect();
        var x = (event.clientX - box.left) / box.width - 0.5;
        var y = (event.clientY - box.top) / box.height - 0.5;
        card.classList.add('tilting');
        card.style.transform = 'perspective(900px) rotateX(' + (-y * 5).toFixed(2) + 'deg) rotateY(' + (x * 6).toFixed(2) + 'deg) translateY(-6px)';
      });
    });
    card.addEventListener('pointerleave', function () {
      card.style.transform = '';
      window.setTimeout(function () { card.classList.remove('tilting'); }, 150);
    });
  });
})();
