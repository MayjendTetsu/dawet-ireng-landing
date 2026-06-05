/**
 * Dawet Ireng Jembatan Butuh — Landing Page
 * Leclerc-style sticky horizontal scroll + scroll-reveal + parallax
 */
(function () {
  'use strict';

  document.addEventListener('DOMContentLoaded', init);

  function init() {
    setupLoader();
    setupNavbar();
    setupMobileMenu();
    setupScrollReveal();
    setupStickyHorizontal();
    setupParallax();
    setupHeroParallax();
    setupSmoothScroll();
  }

  /* ======== LOADER ======== */
  function setupLoader() {
    var loader = document.getElementById('loader');
    var done = false;

    function hide() {
      if (done) return;
      done = true;
      loader.classList.add('hide');
      setTimeout(animateHero, 200);
    }

    window.addEventListener('load', function () { setTimeout(hide, 2200); });
    setTimeout(hide, 4000);
  }

  /* ======== HERO ENTRANCE ======== */
  function animateHero() {
    var els = document.querySelectorAll('.anim-up');
    for (var i = 0; i < els.length; i++) {
      (function (el) {
        var d = parseInt(el.getAttribute('data-d') || '0', 10);
        setTimeout(function () { el.classList.add('show'); }, d);
      })(els[i]);
    }
    var img = document.getElementById('hero-img');
    if (img) setTimeout(function () { img.classList.add('zoomed'); }, 100);
  }

  /* ======== NAVBAR ======== */
  function setupNavbar() {
    var nav = document.getElementById('navbar');
    window.addEventListener('scroll', function () {
      if (window.scrollY > 60) {
        nav.classList.add('solid');
      } else {
        nav.classList.remove('solid');
      }
    }, { passive: true });
  }

  /* ======== MOBILE MENU ======== */
  function setupMobileMenu() {
    var btn = document.getElementById('nav-toggle');
    var menu = document.getElementById('mobile-menu');
    var links = menu.querySelectorAll('a');

    btn.addEventListener('click', function () {
      btn.classList.toggle('open');
      menu.classList.toggle('open');
      document.body.style.overflow = menu.classList.contains('open') ? 'hidden' : '';
    });

    for (var i = 0; i < links.length; i++) {
      links[i].addEventListener('click', function () {
        btn.classList.remove('open');
        menu.classList.remove('open');
        document.body.style.overflow = '';
      });
    }
  }

  /* ======== SCROLL REVEAL ======== */
  function setupScrollReveal() {
    var els = document.querySelectorAll('.reveal, .reveal-img');

    if ('IntersectionObserver' in window) {
      var obs = new IntersectionObserver(function (entries) {
        entries.forEach(function (e) {
          if (e.isIntersecting) {
            var d = parseInt(e.target.getAttribute('data-d') || '0', 10);
            setTimeout(function () { e.target.classList.add('show'); }, d);
            obs.unobserve(e.target);
          }
        });
      }, { threshold: 0.12, rootMargin: '0px 0px -30px 0px' });

      els.forEach(function (el) { obs.observe(el); });
    } else {
      // Fallback: show everything
      els.forEach(function (el) { el.classList.add('show'); });
    }
  }

  /* ======== STICKY HORIZONTAL SCROLL (Leclerc-style) ========
   *
   * The trick: .pin-outer is a tall container (height = 100vh + scrollDistance).
   * .pin-inner is position:sticky top:0, so it "sticks" inside pin-outer.
   * We convert vertical scroll progress inside pin-outer → horizontal translateX on htrack.
   * When htrack reaches its end (progress=1), pin-outer ends and normal scroll resumes.
   *
   * Key fix: we MUST re-measure after fonts+images load (window load), not just DOMContentLoaded.
   */
  function setupStickyHorizontal() {
    var outer = document.querySelector('.pin-outer');
    var inner = document.querySelector('.pin-inner');
    var track = document.getElementById('htrack');
    var bar   = document.getElementById('hprogress');

    if (!outer || !inner || !track) return;

    var travelDist = 0; // how many px htrack needs to move left

    function measure() {
      // Force layout recalc
      track.style.transform = 'translateX(0px)';

      var viewW  = inner.offsetWidth;
      var trackW = track.scrollWidth;

      // travelDist = total left movement needed so last card right edge
      // aligns with viewport right edge. Add 40px breathing room at end.
      travelDist = Math.max(0, trackW - viewW + 40);

      // Give pin-outer enough height so the sticky inner stays pinned
      // for exactly travelDist worth of scroll.
      outer.style.height = (window.innerHeight + travelDist) + 'px';

      // Re-apply current scroll position after measure
      onScroll();
    }

    function onScroll() {
      var rect = outer.getBoundingClientRect();
      var vh   = window.innerHeight;

      // rect.top = distance from top of viewport to top of pin-outer
      // When pin-outer enters viewport: rect.top transitions from positive → 0 → negative
      // We start translating when rect.top hits 0 (pin-inner just stuck to top)

      // scrolled = how many px we've scrolled "into" the sticky section
      var scrolled  = Math.max(0, -rect.top);
      var scrollable = outer.offsetHeight - vh; // = travelDist (set above)

      if (scrollable <= 0) return;

      var progress = Math.min(1, scrolled / scrollable);
      var tx = progress * travelDist;

      track.style.transform = 'translateX(' + (-tx) + 'px)';

      if (bar) bar.style.width = (progress * 100) + '%';
    }

    // Measure on DOMContentLoaded (layout only, no images)
    measure();

    // Measure again after ALL resources (images) loaded — this is the critical one
    // because hcard images affect track.scrollWidth
    if (document.readyState === 'complete') {
      measure();
    } else {
      window.addEventListener('load', function() {
        measure();
        // Extra safety: measure again after a short tick in case of lazy-loaded fonts
        setTimeout(measure, 300);
      });
    }

    // Re-measure on resize (orientation change, window resize)
    var resizeTimer;
    window.addEventListener('resize', function() {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(measure, 100);
    });

    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  }

  /* ======== PARALLAX ======== */
  function setupParallax() {
    var img = document.getElementById('parallax-img');
    var sec = document.getElementById('parallax-sec');
    if (!img || !sec) return;

    window.addEventListener('scroll', function () {
      var r = sec.getBoundingClientRect();
      var vh = window.innerHeight;
      if (r.top < vh && r.bottom > 0) {
        var p = (vh - r.top) / (vh + r.height);
        var ty = (p - 0.5) * 50;
        img.style.transform = 'translateY(' + ty + 'px) scale(1.1)';
      }
    }, { passive: true });
  }

  /* ======== HERO PARALLAX ======== */
  function setupHeroParallax() {
    var hero = document.getElementById('hero');
    var img = document.getElementById('hero-img');
    var body = document.querySelector('.hero-body');
    if (!hero || !img) return;

    window.addEventListener('scroll', function () {
      var y = window.scrollY;
      var h = hero.offsetHeight;
      if (y < h) {
        var p = y / h;
        img.style.transform = 'scale(' + (1 + p * 0.08) + ') translateY(' + (p * 25) + 'px)';
        if (body) {
          body.style.opacity = Math.max(0, 1 - p * 1.4);
          body.style.transform = 'translateY(' + (p * 35) + 'px)';
        }
      }
    }, { passive: true });
  }

  /* ======== SMOOTH SCROLL ======== */
  function setupSmoothScroll() {
    var nav = document.getElementById('navbar');
    var links = document.querySelectorAll('a[href^="#"]');

    for (var i = 0; i < links.length; i++) {
      links[i].addEventListener('click', function (e) {
        var id = this.getAttribute('href');
        if (id === '#') return;
        var target = document.querySelector(id);
        if (!target) return;
        e.preventDefault();
        var top = target.getBoundingClientRect().top + window.scrollY - nav.offsetHeight;
        window.scrollTo({ top: top, behavior: 'smooth' });
      });
    }
  }

})();
