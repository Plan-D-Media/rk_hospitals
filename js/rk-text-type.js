/* ============================================================
   rk-text-type.js — vanilla "TextType" typing effect
   A dependency-free reimplementation of the ReactBits <TextType>
   component (https://reactbits.dev/text-animations/text-type).
   No React, no build step, no dependencies.

   USAGE
   -----
   Mark up a reserved-height wrapper with BOTH a static copy for
   screen readers / crawlers and an animated node that is hidden
   from assistive tech:

     <p class="typed-line">
       <span class="sr-only">Full text. Second line. Third line.</span>
       <span aria-hidden="true"
             data-text-type
             data-strings='["Full text","Second line","Third line"]'
             data-type-speed="55"
             data-delete-speed="28"
             data-pause="1900"
             data-loop="true"
             data-cursor="|"></span>
     </p>

   Give `.typed-line` a `min-height` in CSS so the line never shifts
   as the string length changes (CLS = 0).

   OPTIONS (all via data-* attributes)
     data-strings       JSON array of strings. Required.
     data-type-speed    ms per character typed          (default 60)
     data-delete-speed  ms per character deleted        (default 30)
     data-pause         ms to hold a finished string    (default 1800)
     data-start-delay   ms before the first character   (default 250)
     data-loop          "true" | "false"                (default true)
     data-cursor        cursor character, "" to disable (default "|")

   BEHAVIOUR
     - Starts only when the element scrolls into view (IntersectionObserver).
     - Pauses while the tab is hidden, resumes on return.
     - prefers-reduced-motion: renders the first string statically,
       no cursor, no timers.
   ============================================================ */
(function (window, document) {
  "use strict";

  var reduceMotion = window.matchMedia
    ? window.matchMedia("(prefers-reduced-motion: reduce)")
    : { matches: false };

  function num(el, attr, fallback) {
    var v = parseInt(el.getAttribute(attr), 10);
    return isNaN(v) ? fallback : v;
  }

  function readStrings(el) {
    var raw = el.getAttribute("data-strings");
    if (!raw) return [];
    try {
      var parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? parsed.filter(function (s) { return typeof s === "string"; }) : [];
    } catch (err) {
      console.error("rk-text-type: data-strings is not valid JSON on", el, err);
      return [];
    }
  }

  function TextType(el) {
    this.el = el;
    this.strings = readStrings(el);
    this.typeSpeed = num(el, "data-type-speed", 60);
    this.deleteSpeed = num(el, "data-delete-speed", 30);
    this.pauseDuration = num(el, "data-pause", 1800);
    this.startDelay = num(el, "data-start-delay", 250);
    this.loop = el.getAttribute("data-loop") !== "false";
    this.cursorChar = el.hasAttribute("data-cursor") ? el.getAttribute("data-cursor") : "|";

    this.index = 0;      // which string
    this.chars = 0;      // how many characters shown
    this.deleting = false;
    this.timer = null;
    this.started = false;
    this.paused = false;

    this.textNode = document.createElement("span");
    this.textNode.className = "tt-text";
    el.appendChild(this.textNode);

    if (this.cursorChar) {
      this.cursor = document.createElement("span");
      this.cursor.className = "tt-cursor";
      this.cursor.textContent = this.cursorChar;
      el.appendChild(this.cursor);
    }
  }

  /* Render the first string and stop — the reduced-motion path, and the
     fallback whenever there is nothing to animate. */
  TextType.prototype.renderStatic = function () {
    this.textNode.textContent = this.strings[0] || "";
    if (this.cursor) this.cursor.remove();
  };

  TextType.prototype.start = function () {
    if (this.started || !this.strings.length) return;
    this.started = true;
    var self = this;
    this.timer = window.setTimeout(function () { self.step(); }, this.startDelay);
  };

  TextType.prototype.stop = function () {
    window.clearTimeout(this.timer);
    this.timer = null;
  };

  TextType.prototype.step = function () {
    var current = this.strings[this.index];
    var self = this;
    var delay;

    if (this.deleting) {
      this.chars--;
      delay = this.deleteSpeed;
    } else {
      this.chars++;
      delay = this.typeSpeed;
    }

    this.textNode.textContent = current.slice(0, this.chars);
    // Solid cursor while typing, blinking while idle — the ReactBits detail.
    this.el.classList.toggle("is-typing", this.chars > 0 && this.chars < current.length);

    if (!this.deleting && this.chars === current.length) {
      var isLast = this.index === this.strings.length - 1;
      if (isLast && !this.loop) {
        this.el.classList.remove("is-typing");
        return;
      }
      this.deleting = true;
      delay = this.pauseDuration;
    } else if (this.deleting && this.chars === 0) {
      this.deleting = false;
      this.index = (this.index + 1) % this.strings.length;
      delay = this.typeSpeed * 3;
    }

    this.timer = window.setTimeout(function () { self.step(); }, delay);
  };

  function init(root) {
    var nodes = (root || document).querySelectorAll("[data-text-type]");
    if (!nodes.length) return [];

    var instances = [];
    nodes.forEach(function (el) {
      if (el.dataset.ttReady) return;
      el.dataset.ttReady = "1";

      var tt = new TextType(el);
      if (!tt.strings.length) return;
      instances.push(tt);

      if (reduceMotion.matches) {
        tt.renderStatic();
        return;
      }

      if (!("IntersectionObserver" in window)) {
        tt.start();
        return;
      }

      var io = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) return;
          io.disconnect();
          tt.start();
        });
      }, { threshold: 0.25 });
      io.observe(el);
    });

    // Don't burn timers on a hidden tab.
    document.addEventListener("visibilitychange", function () {
      instances.forEach(function (tt) {
        if (!tt.started || reduceMotion.matches) return;
        if (document.hidden) {
          tt.stop();
          tt.paused = true;
        } else if (tt.paused) {
          tt.paused = false;
          tt.step();
        }
      });
    });

    return instances;
  }

  window.RKTextType = { init: init, TextType: TextType };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", function () { init(); });
  } else {
    init();
  }
})(window, document);
