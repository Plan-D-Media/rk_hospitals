/* ============================================================
   rk-hero-slider.js — hero background slider. Vanilla JS, no library.

   ┌──────────────────────────────────────────────────────────┐
   │  HOW TO ADD AN OCCASION SLIDE (e.g. Doctors' Day, Puja)   │
   └──────────────────────────────────────────────────────────┘
   You do NOT need to touch this file. The slides live in
   index.html so the first one can be preloaded for fast loading.

   1. Export the photo at 1920×1080 (16:9), JPEG ~80% quality,
      under 400 KB. Landscape only. Keep the important subject in
      the RIGHT half — the left half sits under the dark scrim that
      the headline is written on.
   2. Drop it in  images/  (e.g. images/hero-doctors-day.jpg).
   3. Open index.html, find the block marked "HERO SLIDES", copy any
      <div class="hs-slide"> … </div> block, paste it after the last
      one, and change:
         - the img `src`      → your new file
         - the img `alt`      → describe the photo
         - keep width="1920" height="1080"
         - keep loading="lazy" (only the FIRST slide is eager)
      Do not add `class="is-active"` — the first slide keeps that.
   4. That's it. The dots, the swipe and the auto-advance all read the
      slide count from the markup.

   To remove an occasion slide later, delete its block.
   To reorder, move blocks — the first block is the one that is
   preloaded, so if you reorder, update the <link rel="preload">
   in <head> to match the new first image.

   ── Timing knobs ──────────────────────────────────────────── */
var RK_HERO_CONFIG = {
  interval: 13000,     // ms each slide is held before auto-advancing (target 12–15s)
  swipeThreshold: 45   // px of horizontal drag that counts as a swipe
};
/* Cross-fade duration and the Ken-Burns zoom live in CSS
   (`--hs-fade` and the `hs-kenburns` keyframes in rk-home-v2.css)
   so the animation stays on the compositor. */

(function (window, document) {
  "use strict";

  var reduceMotion = window.matchMedia
    ? window.matchMedia("(prefers-reduced-motion: reduce)")
    : { matches: false };

  function HeroSlider(root) {
    this.root = root;
    this.slides = Array.prototype.slice.call(root.querySelectorAll(".hs-slide"));
    this.dotsWrap = root.querySelector(".hs-dots");
    this.progress = root.querySelector(".hs-progress");
    this.live = root.querySelector(".hs-live");

    // Single source of truth for the dwell time: the progress rail's CSS
    // animation reads --hs-interval so it always matches RK_HERO_CONFIG.
    if (this.progress) {
      this.progress.style.setProperty("--hs-interval", RK_HERO_CONFIG.interval + "ms");
    }

    this.index = 0;
    this.timer = null;
    this.hovering = false;
    this.focusWithin = false;

    // Name each slide from its position, so adding a block to the markup
    // never leaves a hard-coded "1 of 3" behind.
    var total = this.slides.length;
    this.slides.forEach(function (slide, i) {
      slide.setAttribute("aria-label", (i + 1) + " of " + total);
    });

    if (total < 2) {
      // One slide: it is just a static hero. Hide the machinery.
      if (this.dotsWrap) this.dotsWrap.hidden = true;
      if (this.progress) this.progress.hidden = true;
      this.applyState();
      return;
    }

    this.buildDots();
    this.bind();
    this.applyState();
    if (!reduceMotion.matches) this.play();
  }

  /* Dots are generated from the markup, so adding a slide block to
     index.html automatically adds its dot. */
  HeroSlider.prototype.buildDots = function () {
    if (!this.dotsWrap) return;
    var self = this;
    this.dotsWrap.innerHTML = "";
    this.dots = this.slides.map(function (slide, i) {
      var b = document.createElement("button");
      b.type = "button";
      b.className = "hs-dot";
      b.setAttribute("aria-label", "Show slide " + (i + 1) + " of " + self.slides.length);
      b.addEventListener("click", function () { self.goTo(i, true); });
      self.dotsWrap.appendChild(b);
      return b;
    });
  };

  HeroSlider.prototype.applyState = function () {
    var self = this;
    this.slides.forEach(function (slide, i) {
      var active = i === self.index;
      slide.classList.toggle("is-active", active);
      // Inactive slides are removed from the a11y tree and the tab order.
      slide.setAttribute("aria-hidden", active ? "false" : "true");
    });
    if (this.dots) {
      this.dots.forEach(function (dot, i) {
        var active = i === self.index;
        dot.classList.toggle("is-active", active);
        dot.setAttribute("aria-current", active ? "true" : "false");
      });
    }
    if (this.live) {
      this.live.textContent = "Slide " + (this.index + 1) + " of " + this.slides.length;
    }
    this.restartProgress();
  };

  /* The magenta rail under the hero shows how long until the next slide.
     Re-triggering the CSS animation needs a reflow between removals. */
  HeroSlider.prototype.restartProgress = function () {
    if (!this.progress || reduceMotion.matches) return;
    this.progress.classList.remove("is-running");
    void this.progress.offsetWidth;
    if (!this.isPaused()) this.progress.classList.add("is-running");
  };

  HeroSlider.prototype.isPaused = function () {
    return this.hovering || this.focusWithin || document.hidden || reduceMotion.matches;
  };

  HeroSlider.prototype.goTo = function (i, userInitiated) {
    var n = this.slides.length;
    this.index = ((i % n) + n) % n;
    this.applyState();
    if (userInitiated) this.play(); // restart the dwell time after a manual move
  };

  HeroSlider.prototype.next = function (user) { this.goTo(this.index + 1, user); };
  HeroSlider.prototype.prev = function (user) { this.goTo(this.index - 1, user); };

  HeroSlider.prototype.play = function () {
    this.pause();
    if (reduceMotion.matches || this.slides.length < 2) return;
    var self = this;
    this.timer = window.setInterval(function () {
      if (self.isPaused()) return;
      self.next(false);
    }, RK_HERO_CONFIG.interval);
    this.restartProgress();
  };

  HeroSlider.prototype.pause = function () {
    if (this.timer) window.clearInterval(this.timer);
    this.timer = null;
    if (this.progress) this.progress.classList.remove("is-running");
  };

  HeroSlider.prototype.bind = function () {
    var self = this;

    // Manual navigation is the dots (click) + swipe + arrow keys. There are
    // no prev/next arrow buttons.

    // Hover / focus pause — a visitor reading the headline shouldn't lose it.
    this.root.addEventListener("mouseenter", function () { self.hovering = true; self.pause(); });
    this.root.addEventListener("mouseleave", function () { self.hovering = false; self.play(); });
    this.root.addEventListener("focusin", function () { self.focusWithin = true; self.pause(); });
    this.root.addEventListener("focusout", function () {
      if (!self.root.contains(document.activeElement)) { self.focusWithin = false; self.play(); }
    });

    document.addEventListener("visibilitychange", function () {
      if (document.hidden) self.pause(); else self.play();
    });

    this.root.addEventListener("keydown", function (e) {
      if (e.key === "ArrowRight") { e.preventDefault(); self.next(true); }
      else if (e.key === "ArrowLeft") { e.preventDefault(); self.prev(true); }
    });

    // Touch swipe. Ignore drags that start on a control or a link.
    var startX = 0, startY = 0, tracking = false;
    this.root.addEventListener("pointerdown", function (e) {
      if (e.target.closest("a, button")) return;
      tracking = true; startX = e.clientX; startY = e.clientY;
    }, { passive: true });

    this.root.addEventListener("pointerup", function (e) {
      if (!tracking) return;
      tracking = false;
      var dx = e.clientX - startX;
      var dy = e.clientY - startY;
      // Horizontal intent only, so a vertical page scroll never flips a slide.
      if (Math.abs(dx) < RK_HERO_CONFIG.swipeThreshold || Math.abs(dx) < Math.abs(dy)) return;
      if (dx < 0) self.next(true); else self.prev(true);
    }, { passive: true });

    this.root.addEventListener("pointercancel", function () { tracking = false; });

    // If the visitor turns reduced-motion on mid-session, respect it.
    if (reduceMotion.addEventListener) {
      reduceMotion.addEventListener("change", function () {
        if (reduceMotion.matches) { self.pause(); self.goTo(0, false); }
        else self.play();
      });
    }
  };

  var instances = [];
  function init() {
    document.querySelectorAll("[data-hero-slider]").forEach(function (root) {
      instances.push(new HeroSlider(root));
    });
  }

  window.RKHeroSlider = { init: init, HeroSlider: HeroSlider, instances: instances };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})(window, document);
