/* ============================================================
   rk-scroll-velocity.js — scroll-reactive marquee
   Vanilla port of the ReactBits <ScrollVelocity> behaviour.
   No React, no Motion, no GSAP, no dependencies.

   Two rows scroll in opposite directions at a constant base speed. Page
   scroll velocity is smoothed through a spring and applied as a multiplier;
   scrolling up flips both directions; it settles back to base when the page
   stops.

   The marquee is DECORATIVE (aria-hidden). The authoritative list is the
   visually-hidden <ul> beside it plus the "Show all" modal, so a screen
   reader or a keyboard user gets the full list without the animation
   existing at all.
   ============================================================ */
(function () {
  "use strict";

  /* ---- TUNING ------------------------------------------------------
     Two deliberate departures from the reference implementation:

     VELOCITY_RANGE 3, not 5, and hard-capped at ±4.
       These are scheme names a patient is scanning for their own
       coverage. At the reference multiplier they blur past unreadably
       during any normal scroll, which defeats the section's purpose.

     BASE_SPEED 80 px/s, not 100.
       Pills are content, not display type.
     ------------------------------------------------------------------ */
  var VELOCITY_RANGE = 3;
  var VELOCITY_CLAMP = 4;
  var BASE_SPEED = 80;

  // spring: k=400, c=50, m=1
  var K = 400, C = 50, M = 1;
  var MAX_DT = 50;            // ms — clamps tab-switch jumps

  var roots = document.querySelectorAll("[data-ep-velocity]");
  if (!roots.length) return;

  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)");

  function wrap(min, max, n) {
    var range = max - min;
    return ((((n - min) % range) + range) % range) + min;
  }

  roots.forEach(function (root) {
    var rows = Array.prototype.slice.call(root.querySelectorAll("[data-base]"));

    /* Reduced motion: no rAF, no clones. A single static wrapped grid of
       every pill — the fallback, not a slowed marquee. */
    if (reduce.matches) {
      root.classList.add("is-static");
      return;
    }

    var state = rows.map(function (row) {
      return {
        row: row,
        track: row.querySelector("[data-track]"),
        copy: row.querySelector("[data-copy]"),
        base: parseFloat(row.getAttribute("data-base")) || BASE_SPEED,
        offset: 0,
        copyWidth: 0,
        clones: []
      };
    });

    /* ---- SIZING ---------------------------------------------------
       All reads first, then all writes: no layout thrash, and never
       inside the rAF loop. */
    function measure() {
      var reads = state.map(function (s) {
        return {
          s: s,
          copyW: s.copy.getBoundingClientRect().width,
          containerW: s.row.getBoundingClientRect().width
        };
      });
      reads.forEach(function (r) {
        var s = r.s;
        if (r.copyW <= 0) return;
        s.copyWidth = r.copyW;
        var need = Math.ceil(r.containerW / r.copyW) + 2;
        // write phase
        while (s.clones.length > need - 1) s.clones.pop().remove();
        while (s.clones.length < need - 1) {
          var c = s.copy.cloneNode(true);
          c.removeAttribute("data-copy");
          c.setAttribute("aria-hidden", "true");
          s.track.appendChild(c);
          s.clones.push(c);
        }
      });
    }

    /* ---- VELOCITY -------------------------------------------------- */
    var lastScrollY = window.scrollY;
    var lastT = null;
    var springPos = 0, springVel = 0;
    var running = false, inView = false;
    var paused = false;
    var rafId = null;

    function frame(now) {
      if (lastT === null) lastT = now;
      var dt = Math.min(now - lastT, MAX_DT);
      lastT = now;
      var dts = dt / 1000;

      var y = window.scrollY;
      var raw = dts > 0 ? (y - lastScrollY) / dts : 0;
      lastScrollY = y;

      // spring toward the raw velocity
      var a = (-K * (springPos - raw) - C * springVel) / M;
      springVel += a * dts;
      springPos += springVel * dts;

      var factor = (springPos / 1000) * VELOCITY_RANGE;
      factor = Math.max(-VELOCITY_CLAMP, Math.min(VELOCITY_CLAMP, factor));
      var flip = factor < 0 ? -1 : 1;

      if (!paused) {
        state.forEach(function (s) {
          if (!s.copyWidth) return;
          var dir = s.base < 0 ? -1 : 1;
          s.offset += dir * flip * Math.abs(s.base) * (1 + Math.abs(factor)) * dts;
          var x = wrap(-s.copyWidth, 0, s.offset);
          s.track.style.transform = "translate3d(" + x + "px,0,0)";
        });
      }

      rafId = window.requestAnimationFrame(frame);
    }

    function start() {
      if (running) return;
      running = true;
      lastT = null;
      lastScrollY = window.scrollY;
      rafId = window.requestAnimationFrame(frame);
    }
    function stop() {
      if (!running) return;
      running = false;
      if (rafId) window.cancelAnimationFrame(rafId);
      rafId = null;
    }
    function sync() {
      // rAF only while in view and the tab is visible
      if (inView && !document.hidden) start(); else stop();
    }

    // Pause on hover / focus-within, but keep tracking velocity so
    // resuming is not a jump.
    root.addEventListener("mouseenter", function () { paused = true; });
    root.addEventListener("mouseleave", function () { paused = false; });
    root.addEventListener("focusin", function () { paused = true; });
    root.addEventListener("focusout", function () {
      if (!root.contains(document.activeElement)) paused = false;
    });

    document.addEventListener("visibilitychange", sync);

    if ("IntersectionObserver" in window) {
      new IntersectionObserver(function (entries) {
        inView = entries[0].isIntersecting;
        sync();
      }, { rootMargin: "120px 0px" }).observe(root);
    } else {
      inView = true; sync();
    }

    /* IBM Plex Mono swapping in changes every pill's width. A copyWidth
       measured before that is stale and opens a visible seam in the loop. */
    measure();
    if (document.fonts && document.fonts.ready) {
      document.fonts.ready.then(function () {
        state.forEach(function (s) { s.offset = 0; });
        measure();
      });
    }

    var t;
    if ("ResizeObserver" in window) {
      new ResizeObserver(function () {
        window.clearTimeout(t);
        t = window.setTimeout(measure, 150);
      }).observe(root);
    }
  });
})();
