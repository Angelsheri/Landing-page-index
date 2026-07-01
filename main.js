/* ═══════════════════════════════════════════════════════════
   Stratum landing — interactions & GSAP animations
   ═══════════════════════════════════════════════════════════ */
(function () {
  'use strict';

  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  document.addEventListener('DOMContentLoaded', init);

  function init() {
    initNav();
    initTileSpotlight();
    initFrameworkCarousel();
    initGSAP();
  }

  /* ─── Sticky nav shadow ─── */
  function initNav() {
    const nav = document.getElementById('nav');
    const onScroll = () => nav.classList.toggle('scrolled', window.scrollY > 6);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });

    const toggle = document.getElementById('navToggle');
    if (toggle) {
      toggle.addEventListener('click', () => {
        const links = document.querySelector('.nav-links');
        const open = links.style.display === 'flex';
        links.style.display = open ? '' : 'flex';
        if (!open) {
          Object.assign(links.style, {
            position: 'absolute', top: '68px', left: 0, right: 0,
            flexDirection: 'column', padding: '16px 24px',
            background: '#fff', borderBottom: '1px solid var(--border)',
            gap: '4px'
          });
        }
        toggle.setAttribute('aria-expanded', String(!open));
      });
    }
  }

  /* ─── Tile pointer spotlight ─── */
  function initTileSpotlight() {
    document.querySelectorAll('.tile').forEach(tile => {
      tile.addEventListener('pointermove', e => {
        const r = tile.getBoundingClientRect();
        tile.style.setProperty('--mx', ((e.clientX - r.left) / r.width * 100) + '%');
        tile.style.setProperty('--my', ((e.clientY - r.top) / r.height * 100) + '%');
      });
    });
  }

  /* ─── Frameworks carousel ─── */
  function initFrameworkCarousel() {
    const track = document.getElementById('fwTrack');
    if (!track) return;
    const pages = track.querySelectorAll('.fw-page');
    const dotsWrap = document.getElementById('fwDots');
    const prev = document.querySelector('.fw-prev');
    const next = document.querySelector('.fw-next');
    let idx = 0;
    const total = pages.length;

    // Build dots
    pages.forEach((_, i) => {
      const b = document.createElement('button');
      b.className = 'fw-dot' + (i === 0 ? ' active' : '');
      b.setAttribute('role', 'tab');
      b.setAttribute('aria-label', `Page ${i + 1}`);
      b.addEventListener('click', () => go(i));
      dotsWrap.appendChild(b);
    });
    const dots = dotsWrap.querySelectorAll('.fw-dot');

    function go(i) {
      idx = (i + total) % total;
      track.style.transform = `translateX(-${idx * 100}%)`;
      dots.forEach((d, j) => d.classList.toggle('active', j === idx));
    }

    prev.addEventListener('click', () => { go(idx - 1); restartAuto(); });
    next.addEventListener('click', () => { go(idx + 1); restartAuto(); });

    // Autoplay
    let timer;
    function startAuto() { if (!prefersReducedMotion) timer = setInterval(() => go(idx + 1), 5000); }
    function restartAuto() { clearInterval(timer); startAuto(); }
    startAuto();
    track.parentElement.addEventListener('pointerenter', () => clearInterval(timer));
    track.parentElement.addEventListener('pointerleave', startAuto);

    // Touch swipe
    let sx = 0;
    track.addEventListener('touchstart', e => { sx = e.touches[0].clientX; }, { passive: true });
    track.addEventListener('touchend', e => {
      const dx = e.changedTouches[0].clientX - sx;
      if (Math.abs(dx) > 40) go(idx + (dx < 0 ? 1 : -1));
      restartAuto();
    });

    // Keyboard
    track.parentElement.setAttribute('tabindex', '0');
    track.parentElement.addEventListener('keydown', e => {
      if (e.key === 'ArrowLeft')  { go(idx - 1); restartAuto(); }
      if (e.key === 'ArrowRight') { go(idx + 1); restartAuto(); }
    });
  }

  /* ─── GSAP scroll reveal + counters ─── */
  function initGSAP() {
    if (!window.gsap) return;
    if (window.ScrollTrigger) gsap.registerPlugin(ScrollTrigger);

    // Hero entrance (immediate)
    const heroItems = document.querySelectorAll('.hero .reveal');
    gsap.to(heroItems, {
      opacity: 1, y: 0,
      duration: 0.9, ease: 'power3.out', stagger: 0.09
    });

    // Rest — reveal on scroll
    const scrollReveals = document.querySelectorAll('.reveal:not(.hero .reveal)');
    scrollReveals.forEach(el => {
      gsap.to(el, {
        opacity: 1, y: 0,
        duration: 0.8, ease: 'power3.out',
        scrollTrigger: { trigger: el, start: 'top 88%', once: true }
      });
    });

    // Sec-heads: reveal children with stagger
    document.querySelectorAll('.sec-head').forEach(head => {
      const kids = head.children;
      gsap.set(kids, { opacity: 0, y: 14 });
      gsap.to(kids, {
        opacity: 1, y: 0, duration: 0.7, ease: 'power3.out', stagger: 0.08,
        scrollTrigger: { trigger: head, start: 'top 85%', once: true }
      });
    });

    // Tiles stagger
    document.querySelectorAll('.grid-4').forEach(grid => {
      const tiles = grid.querySelectorAll('.tile');
      gsap.set(tiles, { opacity: 0, y: 20 });
      gsap.to(tiles, {
        opacity: 1, y: 0, duration: 0.7, ease: 'power3.out', stagger: 0.08,
        scrollTrigger: { trigger: grid, start: 'top 85%', once: true }
      });
    });

    // Feature grid stagger
    const feats = document.querySelectorAll('.feat');
    if (feats.length) {
      gsap.set(feats, { opacity: 0, y: 22 });
      gsap.to(feats, {
        opacity: 1, y: 0, duration: 0.7, ease: 'power3.out', stagger: 0.06,
        scrollTrigger: { trigger: '.feat-grid', start: 'top 85%', once: true }
      });
    }

    // Security steps
    const steps = document.querySelectorAll('.sec-steps li');
    if (steps.length) {
      gsap.set(steps, { opacity: 0, x: 20 });
      gsap.to(steps, {
        opacity: 1, x: 0, duration: 0.6, ease: 'power3.out', stagger: 0.09,
        scrollTrigger: { trigger: '.sec-steps', start: 'top 85%', once: true }
      });
    }

    // Stat counters
    document.querySelectorAll('.stat-num[data-count]').forEach(el => {
      const target = parseFloat(el.dataset.count);
      const suffix = el.dataset.suffix || '';
      const obj = { v: 0 };
      const decimals = (String(target).split('.')[1] || '').length;
      gsap.to(obj, {
        v: target, duration: 1.6, ease: 'power2.out',
        onUpdate: () => { el.textContent = obj.v.toFixed(decimals) + suffix; },
        scrollTrigger: { trigger: el, start: 'top 88%', once: true }
      });
    });

    // Subtle parallax on hero mockup
    if (!prefersReducedMotion) {
      const mockup = document.querySelector('.hero-mockup');
      if (mockup) {
        gsap.to(mockup, {
          y: -40, ease: 'none',
          scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true }
        });
      }
    }
  }
})();
