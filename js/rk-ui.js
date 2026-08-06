/* ============================================================
   rk-ui.js — shared UI behaviour
   Vanilla, no dependencies, loaded defer on every page.

     1. Sticky header (solidify + shrink past 80px)
     2. Desktop mega-panels
     3. Mobile drawer (focus trap, Esc, scroll lock)
     4. Drawer accordions
     5. Focus-trap helper (reused by the step-6 modal)
   ============================================================ */
(function () {
  "use strict";

  var STUCK_AT = 80;         // px of scroll before the header solidifies
  var FOCUSABLE = 'a[href],button:not([disabled]),input:not([disabled]),' +
                  'select:not([disabled]),textarea:not([disabled]),[tabindex]:not([tabindex="-1"])';

  /* ---- 5. FOCUS TRAP (exposed for reuse) -------------------------- */
  function trapFocus(container) {
    function onKey(e) {
      if (e.key !== "Tab") return;
      var items = Array.prototype.filter.call(
        container.querySelectorAll(FOCUSABLE),
        function (el) { return el.offsetParent !== null || el === document.activeElement; });
      if (!items.length) return;
      var first = items[0], last = items[items.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    }
    container.addEventListener("keydown", onKey);
    return function release() { container.removeEventListener("keydown", onKey); };
  }
  window.rkTrapFocus = trapFocus;

  /* Scroll lock that does not shift the page when the scrollbar vanishes. */
  var lockCount = 0, savedPad = "";
  function lockScroll() {
    if (lockCount++) return;
    var sbw = window.innerWidth - document.documentElement.clientWidth;
    savedPad = document.body.style.paddingRight;
    if (sbw > 0) document.body.style.paddingRight = sbw + "px";
    document.body.style.overflow = "hidden";
  }
  function unlockScroll() {
    if (--lockCount > 0) return;
    lockCount = 0;
    document.body.style.overflow = "";
    document.body.style.paddingRight = savedPad;
  }
  window.rkLockScroll = lockScroll;
  window.rkUnlockScroll = unlockScroll;

  /* ---- 1. STICKY HEADER ------------------------------------------- */
  var header = document.querySelector("[data-header]");
  if (header) {
    var ticking = false;
    function onScroll() {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(function () {
        header.classList.toggle("is-stuck", window.scrollY > STUCK_AT);
        ticking = false;
      });
    }
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
  }

  /* ---- 2. DESKTOP MEGA-PANELS -------------------------------------- */
  var panelItems = Array.prototype.slice.call(document.querySelectorAll("[data-nav-item]"));

  function closePanel(item) {
    if (!item.classList.contains("is-open")) return;
    item.classList.remove("is-open");
    var btn = item.querySelector("[data-nav-toggle]");
    var panel = item.querySelector("[data-nav-panel]");
    if (btn) btn.setAttribute("aria-expanded", "false");
    // wait out the fade before re-hiding, so the panel does not vanish abruptly
    if (panel) window.setTimeout(function () {
      if (!item.classList.contains("is-open")) panel.hidden = true;
    }, 180);
  }
  function openPanel(item, how) {
    panelItems.forEach(function (o) { if (o !== item) closePanel(o); });
    var btn = item.querySelector("[data-nav-toggle]");
    var panel = item.querySelector("[data-nav-panel]");
    if (panel) panel.hidden = false;
    // force a frame so the transition runs from the hidden state
    if (panel) void panel.offsetWidth;
    item.classList.add("is-open");
    item.dataset.openedBy = how;
    if (btn) btn.setAttribute("aria-expanded", "true");
  }

  panelItems.forEach(function (item) {
    var btn = item.querySelector("[data-nav-toggle]");
    if (!btn) return;

    btn.addEventListener("click", function (e) {
      e.preventDefault();
      if (!item.classList.contains("is-open")) { openPanel(item, "click"); return; }
      // A real mouse fires mouseenter before click, so a hover-opened panel
      // would otherwise close on the very click meant to commit to it.
      // First click after a hover PINS the panel; the next one closes it.
      if (item.dataset.openedBy === "hover") { item.dataset.openedBy = "click"; return; }
      closePanel(item);
    });

    // Pointer users expect hover; keyboard users get click + Esc.
    var hoverTimer;
    item.addEventListener("mouseenter", function () {
      if (!window.matchMedia("(hover: hover)").matches) return;
      window.clearTimeout(hoverTimer);
      if (!item.classList.contains("is-open")) openPanel(item, "hover");
    });
    item.addEventListener("mouseleave", function () {
      if (!window.matchMedia("(hover: hover)").matches) return;
      if (item.dataset.openedBy === "click") return;   // pinned — leave it open
      hoverTimer = window.setTimeout(function () { closePanel(item); }, 120);
    });

    // Leaving the item entirely by keyboard closes it.
    item.addEventListener("focusout", function (e) {
      if (!item.contains(e.relatedTarget)) closePanel(item);
    });
  });

  document.addEventListener("click", function (e) {
    panelItems.forEach(function (item) {
      if (!item.contains(e.target)) closePanel(item);
    });
  });

  /* ---- 3. MOBILE DRAWER -------------------------------------------- */
  var drawer = document.querySelector("[data-drawer]");
  var burger = document.querySelector("[data-drawer-open]");
  var releaseTrap = null;
  var lastFocused = null;

  function openDrawer() {
    if (!drawer) return;
    lastFocused = document.activeElement;
    drawer.hidden = false;
    void drawer.offsetWidth;
    drawer.classList.add("is-open");
    if (burger) burger.setAttribute("aria-expanded", "true");
    lockScroll();
    releaseTrap = trapFocus(drawer);
    var close = drawer.querySelector(".drawer__close");
    if (close) close.focus();
  }

  function closeDrawer() {
    if (!drawer || drawer.hidden) return;
    drawer.classList.remove("is-open");
    if (burger) burger.setAttribute("aria-expanded", "false");
    unlockScroll();
    if (releaseTrap) { releaseTrap(); releaseTrap = null; }
    window.setTimeout(function () {
      if (!drawer.classList.contains("is-open")) drawer.hidden = true;
    }, 240);
    // Focus must return to the control that opened the drawer. A synthetic
    // or touch activation can leave activeElement on <body>, so fall back to
    // the burger rather than dropping focus to the top of the document.
    var back = (lastFocused && lastFocused !== document.body) ? lastFocused : burger;
    if (back && back.focus) back.focus();
  }

  if (burger) burger.addEventListener("click", openDrawer);
  document.querySelectorAll("[data-drawer-close]").forEach(function (el) {
    el.addEventListener("click", closeDrawer);
  });
  // A link inside the drawer navigates; close so returning via bfcache is clean.
  if (drawer) drawer.querySelectorAll("a[href]").forEach(function (a) {
    a.addEventListener("click", closeDrawer);
  });

  document.addEventListener("keydown", function (e) {
    if (e.key !== "Escape") return;
    if (drawer && !drawer.hidden) { closeDrawer(); return; }
    panelItems.forEach(function (item) {
      if (item.classList.contains("is-open")) {
        var btn = item.querySelector("[data-nav-toggle]");
        closePanel(item);
        if (btn) btn.focus();
      }
    });
  });

  /* ---- 4. DRAWER ACCORDIONS ---------------------------------------- */
  document.querySelectorAll("[data-acc-toggle]").forEach(function (btn) {
    btn.addEventListener("click", function () {
      var panel = document.getElementById(btn.getAttribute("aria-controls"));
      if (!panel) return;
      var open = btn.getAttribute("aria-expanded") === "true";
      btn.setAttribute("aria-expanded", String(!open));
      panel.hidden = open;
    });
  });
})();

/* ============================================================
   MODAL — focus-trapped, Esc closes, focus returns, scroll locked.
   Generic: any [data-modal-open="id"] opens #id.
   Optional [data-modal-search] filters [data-filter-item] live.
   ============================================================ */
(function () {
  "use strict";
  var openers = document.querySelectorAll("[data-modal-open]");
  if (!openers.length) return;

  openers.forEach(function (btn) {
    var modal = document.getElementById(btn.getAttribute("data-modal-open"));
    if (!modal) return;
    var release = null, lastFocus = null;

    function close() {
      if (modal.hidden) return;
      modal.classList.remove("is-open");
      btn.setAttribute("aria-expanded", "false");
      window.rkUnlockScroll();
      if (release) { release(); release = null; }
      window.setTimeout(function () {
        if (!modal.classList.contains("is-open")) modal.hidden = true;
      }, 200);
      if (lastFocus && lastFocus.focus) lastFocus.focus();
    }

    function open() {
      lastFocus = document.activeElement;
      modal.hidden = false;
      void modal.offsetWidth;
      modal.classList.add("is-open");
      btn.setAttribute("aria-expanded", "true");
      window.rkLockScroll();
      release = window.rkTrapFocus(modal);
      var search = modal.querySelector("[data-modal-search]");
      (search || modal.querySelector("[data-modal-close]") || modal).focus();
    }

    btn.addEventListener("click", open);
    modal.querySelectorAll("[data-modal-close]").forEach(function (c) {
      c.addEventListener("click", close);
    });
    modal.addEventListener("keydown", function (e) {
      if (e.key === "Escape") { e.stopPropagation(); close(); }
    });

    var search = modal.querySelector("[data-modal-search]");
    if (search) {
      var items = Array.prototype.slice.call(modal.querySelectorAll("[data-filter-item]"));
      var count = modal.querySelector("[data-filter-count]");
      search.addEventListener("input", function () {
        var q = search.value.trim().toLowerCase();
        var shown = 0;
        items.forEach(function (it) {
          var hit = !q || it.textContent.toLowerCase().indexOf(q) !== -1;
          it.hidden = !hit;
          if (hit) shown++;
        });
        if (count) {
          count.textContent = q
            ? shown + (shown === 1 ? " match" : " matches")
            : items.length + " empanelments";
        }
      });
    }
  });
})();

/* ------------------------------------------------------------
   One crimson fill at a time
   ------------------------------------------------------------
   Third application of the header's is-over-hero mechanism. Two elements
   carry a permanent crimson fill and therefore compete with any page-level
   primary that scrolls into view:

     .mobile-bar__a--book   the sticky bar's Book segment, every page <=720px
     .lp-call               landing.html's sticky click-to-call pill

   Measured before this existed: 2 crimson fills on / and /appointment,
   3 on /landing, against a system rule that permits one.

   Rules, in order:
     - a persistent element steps down while a page primary is on screen
     - the bar additionally always defers to .lp-call, which is sticky and so
       never leaves the viewport on the page where it exists

   IntersectionObserver, not scroll: it fires only on a crossing, and every
   element involved is fixed or sticky, so nothing can reflow. Without
   observer support the elements stay crimson, which is the prior behaviour. */
(function () {
  var bar = document.querySelector(".mobile-bar");
  var lpCall = document.querySelector(".lp-call");
  var persistent = [bar, lpCall].filter(Boolean);
  if (!persistent.length || !("IntersectionObserver" in window)) return;

  /* The bar can never outrank a sticky crimson pill that is always visible. */
  if (bar && lpCall) bar.classList.add("is-subdued");

  var triggers = Array.prototype.slice.call(
    document.querySelectorAll(".btn--primary")
  ).filter(function (el) {
    return !persistent.some(function (p) { return p.contains(el); });
  });
  if (!triggers.length) return;

  /* Track WHICH elements are on screen, not how many transitions have been
     seen. A counter is wrong here: the first callback delivers every observed
     element at once, so a page with two off-screen CTAs and one visible one
     nets -1, and clamping that to zero throws away the visible one. */
  var onScreen = [];
  var settled = false;
  var io = new IntersectionObserver(function (entries) {
    entries.forEach(function (e) {
      var i = onScreen.indexOf(e.target);
      if (e.isIntersecting && i === -1) onScreen.push(e.target);
      else if (!e.isIntersecting && i !== -1) onScreen.splice(i, 1);
    });
    var on = onScreen.length > 0;
    persistent.forEach(function (el) {
      /* the bar's deference to .lp-call outlives any single CTA */
      if (el === bar && lpCall) return;
      el.classList.toggle("is-subdued", on);
    });
    /* Animate only AFTER the first callback has settled the initial state.
       Without this the first toggle is itself transitioned, so the bar
       visibly flashes crimson and fades to ink on every load — which also
       makes "two crimson fills" briefly true, the exact thing this fixes.
       Two frames: one for the class to land, one for it to be painted. */
    if (!settled) {
      settled = true;
      requestAnimationFrame(function () {
        requestAnimationFrame(function () {
          persistent.forEach(function (el) { el.classList.add("is-animated"); });
        });
      });
    }
  }, { rootMargin: "0px 0px -62px 0px" });   /* the bar's own height */

  triggers.forEach(function (el) { io.observe(el); });
})();
