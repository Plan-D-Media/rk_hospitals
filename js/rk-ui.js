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
    // Focus must return to the control that opened the drawer.
    if (lastFocused && lastFocused.focus) lastFocused.focus();
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
