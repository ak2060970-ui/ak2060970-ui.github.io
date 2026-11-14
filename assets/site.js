// Simple Floww site animations. Everything stays visible if this file fails to load or motion is reduced.
(function () {
  const root = document.documentElement;

  // Close the mobile menu after a link in it is tapped.
  document.querySelectorAll('.menu-toggle a').forEach((a) => a.addEventListener('click', () => {
    a.closest('details').removeAttribute('open');
  }));


  // Integration map: draw curved links from each source to the hub and from the hub to each destination.
  const map = document.querySelector('.integ-map');
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  function drawLinks() {
    if (!map) return;
    const svg = map.querySelector('.links');
    const box = map.getBoundingClientRect();
    const hub = map.querySelector('.integ-hub .core').getBoundingClientRect();
    const hy = hub.top + hub.height / 2 - box.top;
    const NS = 'http://www.w3.org/2000/svg';
    svg.innerHTML = '';
    map.querySelectorAll('.integ-col').forEach((col) => {
      const out = col.dataset.side === 'out';
      col.querySelectorAll('.node').forEach((node, i) => {
        const r = node.getBoundingClientRect();
        const ny = r.top + r.height / 2 - box.top;
        const x1 = out ? hub.right - box.left : r.right - box.left;
        const y1 = out ? hy : ny;
        const x2 = out ? r.left - box.left : hub.left - box.left;
        const y2 = out ? ny : hy;
        const dx = (x2 - x1) * 0.55;
        const path = document.createElementNS(NS, 'path');
        const id = 'lk-' + col.dataset.side + i;
        path.setAttribute('id', id);
        path.setAttribute('d', `M${x1},${y1} C${x1 + dx},${y1} ${x2 - dx},${y2} ${x2},${y2}`);
        svg.appendChild(path);
        if (reducedMotion) return;
        const dot = document.createElementNS(NS, 'circle');
        dot.setAttribute('r', '3.5');
        const anim = document.createElementNS(NS, 'animateMotion');
        anim.setAttribute('dur', '2.4s');
        anim.setAttribute('repeatCount', 'indefinite');
        // Negative begin starts each dot mid-route, so none waits parked at the corner.
        anim.setAttribute('begin', -((out ? 1.2 : 0) + i * 0.3) + 's');
        const mp = document.createElementNS(NS, 'mpath');
        mp.setAttribute('href', '#' + id);
        anim.appendChild(mp);
        dot.appendChild(anim);
        svg.appendChild(dot);
      });
    });
  }
  if (map) {
    drawLinks();
    window.addEventListener('resize', drawLinks);
    window.addEventListener('load', drawLinks);
    if (document.fonts) document.fonts.ready.then(drawLinks);
  }

  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reduced || !('IntersectionObserver' in window)) { root.classList.remove('js'); return; }

  // 1. Reveal blocks as they scroll into view, staggered among siblings.
  const targets = document.querySelectorAll([
    '.sec-head', '.trust-grid', '.problem', '.fix-line', '.card', '.step', '.ind', '.tile', '.quote',
    '.receipt', '.price-copy', '.founder', '.fact', '.integ-map', '.ig-panel', '.final-box', '.plan',
    '.program', '.brand-mock', '.ref-mock', '.faq details', '.form-card', '.reach-card', '.legal-doc',
  ].join(','));
  const seen = new Map();
  targets.forEach((el) => {
    const i = seen.get(el.parentElement) || 0;
    seen.set(el.parentElement, i + 1);
    el.classList.add('reveal');
    el.style.transitionDelay = Math.min(i, 6) * 80 + 'ms';
  });
  const io = new IntersectionObserver((entries) => {
    entries.forEach((e) => {
      if (!e.isIntersecting) return;
      e.target.classList.add('in');
      e.target.querySelectorAll('[data-count]').forEach(countUp);
      if (e.target.matches('[data-count]')) countUp(e.target);
      io.unobserve(e.target);
    });
  }, { threshold: 0.15, rootMargin: '0px 0px -40px 0px' });
  targets.forEach((el) => io.observe(el));

  // 2. Count numbers up from zero (2,000+, broadcast stats).
  document.querySelectorAll('.trust-grid b, .stats b, .fact b').forEach((el) => {
    const m = el.textContent.trim().match(/^([\d,]+)(\+?)$/);
    if (!m) return;
    el.dataset.count = m[1].replace(/,/g, '');
    el.dataset.suffix = m[2];
  });
  function countUp(el) {
    if (el.dataset.done) return;
    el.dataset.done = '1';
    const end = +el.dataset.count, suffix = el.dataset.suffix || '', t0 = performance.now(), dur = 1400;
    const fmt = (n) => n.toLocaleString('en-IN');
    (function tick(now) {
      const p = Math.min((now - t0) / dur, 1), eased = 1 - Math.pow(1 - p, 3);
      el.textContent = fmt(Math.round(end * eased)) + suffix;
      if (p < 1) requestAnimationFrame(tick);
    })(t0);
  }

  // 3. Hero chat plays out like a real conversation.
  const chat = document.querySelector('.phone .chat');
  if (chat) {
    chat.style.minHeight = chat.offsetHeight + 'px';
    const steps = [...chat.children];
    const floats = document.querySelectorAll('.phone .float-card');
    steps.forEach((s) => s.classList.add('pending'));
    floats.forEach((f) => f.classList.add('pending'));
    const typing = document.createElement('div');
    typing.className = 'typing';
    typing.setAttribute('aria-hidden', 'true');
    typing.innerHTML = '<i></i><i></i><i></i>';
    const show = (el) => el.classList.remove('pending');
    let t = 400;
    steps.forEach((s, i) => {
      const isBot = s.classList.contains('out');
      if (isBot) {
        setTimeout(() => chat.insertBefore(typing, s), t);
        t += 900;
      }
      setTimeout(() => {
        if (typing.parentNode) typing.remove();
        show(s);
        if (i === 1 && floats[0]) show(floats[0]);
        if (i === steps.length - 1 && floats[1]) show(floats[1]);
      }, t);
      t += isBot ? 700 : 900;
    });
  }
})();

/* Hero: rotate the last word of the headline */
(function () {
  var words = document.querySelectorAll('.rotator .rw');
  if (words.length < 2) return;
  if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  var i = 0;
  setInterval(function () {
    var prev = words[i];
    prev.classList.remove('on'); prev.classList.add('out');
    setTimeout(function () { prev.classList.remove('out'); }, 500);
    i = (i + 1) % words.length;
    words[i].classList.add('on');
  }, 2400);
})();
