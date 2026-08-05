/* ============================================================
   rk-open-now.js — the live "Open now" status device
   Vanilla, no dependencies, loaded defer.

   ┌──────────────────────────────────────────────────────────┐
   │  TO EDIT OPENING HOURS, CHANGE ONLY RK_HOURS BELOW.      │
   └──────────────────────────────────────────────────────────┘

   The clock always shows BARRACKPORE time (IST), never the visitor's
   device time. Someone checking on a parent from Dubai or London must
   read the hospital's hours, otherwise "OPD opens 8:00 AM" is
   meaningless — or worse, wrong by hours.
   ============================================================ */

/* ---- CONFIG -------------------------------------------------------
   emergency : always true. The emergency department runs 24×7 — this
               is a verified fact and the dot never goes grey.

   opd       : null until the client confirms OPD hours. While it is
               null NO OPD line is rendered at all — not an empty row,
               not a dash. Nothing reserves space, so filling this in
               later cannot shift the layout.

   To switch OPD on, replace null with an object like:

       opd: {
         // 0 = Sunday … 6 = Saturday. Omit a day to mark it closed.
         // "HH:MM" in 24-hour IST.
         1: ["08:00", "20:00"],
         2: ["08:00", "20:00"],
         3: ["08:00", "20:00"],
         4: ["08:00", "20:00"],
         5: ["08:00", "20:00"],
         6: ["08:00", "14:00"]
       }
   ------------------------------------------------------------------- */
var RK_HOURS = {
  timeZone: "Asia/Kolkata",
  tzLabel: "IST",
  emergency: true,
  opd: null
};

(function () {
  "use strict";

  var nodes = document.querySelectorAll("[data-open-now]");
  if (!nodes.length) return;

  var TICK = 30000;                 // 30s — a minute clock, not a ticking second hand
  var timer = null;

  /* Read the wall-clock time in Barrackpore regardless of device timezone. */
  function istParts() {
    var fmt = new Intl.DateTimeFormat("en-GB", {
      timeZone: RK_HOURS.timeZone,
      hour: "2-digit", minute: "2-digit", hour12: false, weekday: "short"
    });
    var parts = {};
    fmt.formatToParts(new Date()).forEach(function (p) { parts[p.type] = p.value; });
    var days = { Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6 };
    return {
      hour: parseInt(parts.hour, 10),
      minute: parseInt(parts.minute, 10),
      day: days[parts.weekday]
    };
  }

  function display12(h, m) {
    var suffix = h >= 12 ? "PM" : "AM";
    var hh = h % 12; if (hh === 0) hh = 12;
    return hh + ":" + String(m).padStart(2, "0") + " " + suffix;
  }

  function toMinutes(hhmm) {
    var b = hhmm.split(":");
    return parseInt(b[0], 10) * 60 + parseInt(b[1], 10);
  }

  /* Returns the OPD sentence, or null when hours are unconfigured. */
  function opdLine(now) {
    if (!RK_HOURS.opd) return null;
    var today = RK_HOURS.opd[now.day];
    var mins = now.hour * 60 + now.minute;

    if (today && mins >= toMinutes(today[0]) && mins < toMinutes(today[1])) {
      var c = today[1].split(":");
      return "OPD open until " + display12(parseInt(c[0], 10), parseInt(c[1], 10));
    }
    if (today && mins < toMinutes(today[0])) {
      var o = today[0].split(":");
      return "OPD opens " + display12(parseInt(o[0], 10), parseInt(o[1], 10));
    }
    // find the next day that has hours
    for (var i = 1; i <= 7; i++) {
      var d = (now.day + i) % 7;
      if (RK_HOURS.opd[d]) {
        var n = RK_HOURS.opd[d][0].split(":");
        var names = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
        var when = (i === 1) ? "tomorrow" : names[d];
        return "OPD opens " + when + " at " + display12(parseInt(n[0], 10), parseInt(n[1], 10));
      }
    }
    return null;
  }

  function render() {
    var now = istParts();
    var time = display12(now.hour, now.minute);
    var opd = opdLine(now);

    nodes.forEach(function (root) {
      var clock = root.querySelector("[data-on-clock]");
      var opdEl = root.querySelector("[data-on-opd]");
      if (clock) clock.textContent = time;

      if (opd) {
        if (!opdEl) {
          opdEl = document.createElement("p");
          opdEl.className = "open-now__opd";
          opdEl.setAttribute("data-on-opd", "");
          root.appendChild(opdEl);
        }
        opdEl.textContent = opd;
      } else if (opdEl) {
        // No hours configured: remove the node entirely rather than
        // leaving an empty element that reserves space.
        opdEl.remove();
      }
    });
  }

  function start() {
    if (timer) return;
    render();
    timer = window.setInterval(render, TICK);
  }
  function stop() {
    if (!timer) return;
    window.clearInterval(timer);
    timer = null;
  }

  /* A tab left open for an hour must not show a stale clock on return,
     and the interval must not burn cycles while hidden. */
  document.addEventListener("visibilitychange", function () {
    if (document.hidden) stop(); else start();
  });

  start();
})();
