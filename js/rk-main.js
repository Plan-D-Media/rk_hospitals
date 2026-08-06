/* ============================================================
   Ramakrishna Multispeciality Hospital — shared front-end JS
   Vanilla, no dependencies. Handles nav, forms, tracking hooks.

   The site is fully static. Every lead form POSTs to one Google
   Apps Script web app, which appends a row to a Google Sheet and
   emails the recipients. See apps-script/README.md to deploy.
   ============================================================ */
(function () {
  "use strict";

  // ---- CONFIG ----------------------------------------------------------
  // Paste the deployed Apps Script web-app URL here (ends in /exec).
  const LEAD_WEBHOOK_URL = "TODO_PASTE_DEPLOYED_APPS_SCRIPT_URL";

  // Shown to the user if the network call fails, so a lead is never lost.
  const FALLBACK_PHONE_DISPLAY = "+91 82408 42519";
  const FALLBACK_PHONE_TEL = "+918240842519";

  var webhookReady = /^https:\/\/\S+$/.test(LEAD_WEBHOOK_URL);

  // dataLayer (GTM) — safe no-op if GTM is not yet installed.
  window.dataLayer = window.dataLayer || [];
  function track(event, extra) {
    var payload = Object.assign({ event: event }, extra || {});
    window.dataLayer.push(payload);
  }

  // ---- MOBILE NAV ----------------------------------------------------
  // Moved to rk-ui.js in step 3, together with the mega-panel, the focus
  // trap and the scroll lock. Nothing nav-related belongs in this file.

  // ---- TRACKING HOOKS: calls, whatsapp ---------------------------------
  document.querySelectorAll('a[href^="tel:"]').forEach(function (a) {
    a.addEventListener("click", function () {
      track("call_click", { phone: a.getAttribute("href").replace("tel:", "") });
    });
  });
  document.querySelectorAll('a[href*="wa.me"], a[href*="whatsapp"]').forEach(function (a) {
    a.addEventListener("click", function () { track("whatsapp_click"); });
  });

  // ---- EMPANELMENT SHOW-MORE -------------------------------------
  // Removed in step 5: the logo wall is now a pill marquee with a
  // focus-trapped searchable modal (rk-ui.js), not a show/hide toggle.

  // ---- VALIDATION HELPERS ----------------------------------------------
  // Indian mobile: 10 digits starting 6-9, optionally prefixed with +91 / 91.
  function isValidIndianPhone(value) {
    var digits = String(value || "").replace(/[\s\-().]/g, "");
    return /^(?:\+?91)?[6-9]\d{9}$/.test(digits);
  }
  function isValidEmail(value) {
    return /^[^\s@]+@[^\s@]+\.[A-Za-z]{2,}$/.test(String(value || "").trim());
  }

  function fieldError(input, message) {
    if (!input) return;
    input.setAttribute("aria-invalid", "true");
    var field = input.closest(".field") || input.parentElement;
    if (!field) return;
    var note = field.querySelector(".field-error");
    if (!note) {
      note = document.createElement("p");
      note.className = "field-error";
      field.appendChild(note);
    }
    note.textContent = message;
  }
  function clearErrors(form) {
    form.querySelectorAll("[aria-invalid]").forEach(function (el) { el.removeAttribute("aria-invalid"); });
    form.querySelectorAll(".field-error").forEach(function (el) { el.remove(); });
  }

  /* Returns the first invalid input, or null when the form is good.
     Rules: name required; phone must be a valid Indian mobile where the
     field exists; email format-checked where the field exists; any other
     field marked `required` must be non-empty. */
  function validate(form) {
    clearErrors(form);
    var firstBad = null;
    function fail(input, msg) {
      fieldError(input, msg);
      if (!firstBad) firstBad = input;
    }

    var name = form.querySelector('[name="name"]');
    if (name && name.value.trim().length < 2) fail(name, "Please enter your name.");

    var phone = form.querySelector('[name="phone"]');
    if (phone && !isValidIndianPhone(phone.value)) {
      fail(phone, "Enter a valid 10-digit Indian mobile number (or +91 followed by 10 digits).");
    }

    var email = form.querySelector('[name="email"]');
    if (email && (email.value.trim() || email.required) && !isValidEmail(email.value)) {
      fail(email, "Enter a valid email address.");
    }

    form.querySelectorAll("[required]").forEach(function (input) {
      if (input === name || input === phone || input === email) return;
      if (!input.value || !String(input.value).trim()) {
        fail(input, "This field is required.");
      }
    });

    return firstBad;
  }

  // ---- LEAD FORMS: appointment | contact | hero | comment ---------------
  document.querySelectorAll("form[data-lead-form]").forEach(function (form) {
    var formType = form.getAttribute("data-lead-form") || "appointment";
    var btn = form.querySelector('button[type="submit"]');
    var success = form.querySelector(".form-success");
    var errorBox = form.querySelector(".form-error");
    var started = false;

    form.addEventListener("input", function () {
      if (!started) { started = true; track("appointment_start", { form_type: formType }); }
    });

    function setBusy(busy) {
      if (!btn) return;
      btn.disabled = busy;
      if (busy) {
        if (!btn.getAttribute("data-label")) btn.setAttribute("data-label", btn.innerHTML);
        btn.innerHTML = "Sending&hellip;";
      } else {
        btn.innerHTML = btn.getAttribute("data-label") || btn.innerHTML;
      }
    }

    function showSuccess() {
      if (errorBox) errorBox.classList.remove("show");
      form.reset();
      clearErrors(form);
      if (success) {
        success.classList.add("show");
        success.setAttribute("tabindex", "-1");
        success.focus();
      }
    }

    function showError() {
      if (success) success.classList.remove("show");
      if (errorBox) {
        errorBox.classList.add("show");
        errorBox.setAttribute("tabindex", "-1");
        errorBox.focus();
      } else {
        window.alert("Sorry — we couldn't send your request. Please call us on " + FALLBACK_PHONE_DISPLAY + ".");
      }
    }

    form.addEventListener("submit", function (e) {
      e.preventDefault();

      // Honeypot: real users never fill this. Pretend success, send nothing.
      var hp = form.querySelector('input[name="company"]');
      if (hp && hp.value) { showSuccess(); return; }

      var bad = validate(form);
      if (bad) { bad.focus(); return; }

      // Flat payload. URLSearchParams => application/x-www-form-urlencoded,
      // a "simple request" that skips the CORS preflight Apps Script rejects.
      var body = new URLSearchParams();
      body.set("form_type", formType);
      ["name", "phone", "email", "department", "preferred_date", "message"].forEach(function (key) {
        var input = form.querySelector('[name="' + key + '"]');
        if (input && String(input.value).trim()) body.set(key, String(input.value).trim());
      });
      body.set("source_page", location.href);
      body.set("page_title", document.title);
      body.set("timestamp", new Date().toISOString());

      setBusy(true);

      if (!webhookReady) {
        console.warn("LEAD_WEBHOOK_URL is not set — nothing was sent.", Object.fromEntries(body));
        setBusy(false);
        showError();
        return;
      }

      // no-cors: the response is opaque, so a resolved promise means the
      // request reached Apps Script. A rejection means a real network failure.
      fetch(LEAD_WEBHOOK_URL, { method: "POST", mode: "no-cors", body: body })
        .then(function () {
          track("form_submit", {
            form_type: formType,
            form_id: form.getAttribute("id") || "lead_form",
            department: body.get("department") || ""
          });
          setBusy(false);
          showSuccess();
        })
        .catch(function (err) {
          console.error("Lead webhook failed:", err);
          track("form_error", { form_type: formType });
          setBusy(false);
          showError();
        });
    });
  });

  // Fill the fallback phone into any error state that asks for it.
  document.querySelectorAll("[data-fallback-phone]").forEach(function (el) {
    el.textContent = FALLBACK_PHONE_DISPLAY;
    if (el.tagName === "A") el.setAttribute("href", "tel:" + FALLBACK_PHONE_TEL);
  });

  // ---- SCROLL REVEAL --------------------------------------------------
  // ONE observer and one utility class for the whole site. Opt in with
  // class="reveal". Only opacity/transform animate, so this can never shift
  // layout. Direct children of a revealed group are staggered 70ms apart
  // (§6) via data-reveal-i, which rk-system.css turns into a delay.
  var revealables = document.querySelectorAll(".reveal");
  if (revealables.length) {
    var noMotion = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (noMotion || !("IntersectionObserver" in window)) {
      revealables.forEach(function (el) { el.classList.add("is-in"); });
    } else {
      var revealObserver = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) return;
          var el = entry.target;
          var group = el.querySelector("[data-reveal-group]");
          if (group) {
            Array.prototype.slice.call(group.children, 0, 6).forEach(function (child, i) {
              child.setAttribute("data-reveal-i", String(i));
              child.classList.add("reveal", "is-in");
            });
          }
          el.classList.add("is-in");
          revealObserver.unobserve(el);
        });
      }, { rootMargin: "0px 0px -8% 0px", threshold: 0.15 });
      revealables.forEach(function (el) { revealObserver.observe(el); });
    }
  }

  // ---- CURRENT YEAR ----------------------------------------------------
  var y = document.getElementById("rk-year");
  if (y) y.textContent = new Date().getFullYear();
})();
