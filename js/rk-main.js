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
  /* Deployed Apps Script web app. Public by design — this URL ships in the
     JS bundle and is readable in DevTools; a private repo does not protect
     it. All protection is server-side (honeypot, phone validation, minimum
     fill time, length caps). Deliberately NO shared secret in the payload:
     it would sit in this same file and protect nothing while implying it
     does. Redeploying: Manage deployments -> edit -> NEW VERSION. Editing
     the script alone does not change what this URL serves. */
  const LEAD_WEBHOOK_URL = "https://script.google.com/macros/s/AKfycbyY4_py_DCsqr7YrnBxqCtXJB3-GnZE59hmcwjE7CqJyQyBLGjl7PSvJHeIKhqWWFktQA/exec";

  // A hung fetch on a patchy connection is worse than a clear failure.
  const LEAD_TIMEOUT_MS = 10000;

  // Shown to the user if the network call fails, so a lead is never lost.
  const FALLBACK_PHONE_DISPLAY = "+91 82408 42519";
  const FALLBACK_PHONE_TEL = "+918240842519";

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

  /* aria-invalid alone announces "invalid entry" and nothing else — the
     message sitting next to the field is not associated with it, so a screen
     reader user is told the field is wrong but never why. aria-describedby
     is what carries the reason. The id is derived from the field's own id so
     it is stable across re-validation. */
  function fieldError(input, message) {
    if (!input) return;
    input.setAttribute("aria-invalid", "true");
    var field = input.closest(".field") || input.parentElement;
    if (!field) return;
    var note = field.querySelector(".field-error");
    if (!note) {
      note = document.createElement("p");
      note.className = "field-error";
      note.id = (input.id || input.name || "field") + "-error";
      field.appendChild(note);
    }
    note.textContent = message;

    var described = (input.getAttribute("aria-describedby") || "").split(/\s+/).filter(Boolean);
    if (described.indexOf(note.id) === -1) {
      described.push(note.id);
      input.setAttribute("aria-describedby", described.join(" "));
      input.setAttribute("data-error-describedby", note.id);
    }
  }
  function clearErrors(form) {
    form.querySelectorAll("[aria-invalid]").forEach(function (el) { el.removeAttribute("aria-invalid"); });
    /* Remove ONLY the id this script added — a field may legitimately be
       described by a hint that must survive. */
    form.querySelectorAll("[data-error-describedby]").forEach(function (el) {
      var mine = el.getAttribute("data-error-describedby");
      var kept = (el.getAttribute("aria-describedby") || "").split(/\s+/)
        .filter(function (id) { return id && id !== mine; });
      if (kept.length) el.setAttribute("aria-describedby", kept.join(" "));
      else el.removeAttribute("aria-describedby");
      el.removeAttribute("data-error-describedby");
    });
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
  /* The blog comment form carries data-lead-form="comment" but is NOT a lead
     and must never reach the leads webhook: it would put blog comments in the
     hospital's lead Sheet and email the front desk for each one. There is no
     comment backend, no storage and no moderation, so it is disabled in the
     markup as well — this is the second line of defence, not the only one. */
  var NON_LEAD_FORMS = ["comment"];

  document.querySelectorAll("form[data-lead-form]").forEach(function (form) {
    var formType = form.getAttribute("data-lead-form") || "appointment";
    if (NON_LEAD_FORMS.indexOf(formType) !== -1) {
      form.addEventListener("submit", function (e) { e.preventDefault(); });
      return;
    }
    var btn = form.querySelector('button[type="submit"]');
    var success = form.querySelector(".form-success");
    var errorBox = form.querySelector(".form-error");
    var started = false;

    form.addEventListener("input", function () {
      if (!started) { started = true; track("appointment_start", { form_type: formType }); }
    });

    /* Minimum-fill timestamp for the server's 3-second check.
       Set HERE, in JS, at render time — never as a value baked into the HTML.
       These pages are static and edge-cached, so an HTML-authored timestamp
       would be whatever it was when the page was built and every real
       submission would look instant. Created once per form. */
    (function stampRenderTime() {
      var stamp = form.querySelector('input[name="form_rendered_at"]');
      if (!stamp) {
        stamp = document.createElement("input");
        stamp.type = "hidden";
        stamp.name = "form_rendered_at";
        form.appendChild(stamp);
      }
      stamp.value = String(Date.now());
    })();

    /* Three states, not two. "Sending…" left in place after a success reads
       as a form that hung — and that is the last thing a visitor sees before
       leaving the page. Done is disabled but SETTLED. */
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

    function setDone() {
      if (!btn) return;
      btn.disabled = true;              // stays disabled: no second submission
      btn.innerHTML = "Request sent";   // no spinner, nothing in progress
      btn.setAttribute("aria-disabled", "true");
      btn.classList.add("is-done");
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

    /* Disabling the submit button stops a second CLICK, but not a second
       submit event — Enter in a text field, or any programmatic dispatch,
       bypasses the button entirely. Measured: three synthetic submits
       produced three POSTs. This flag is the actual guard. */
    var inFlight = false;

    form.addEventListener("submit", function (e) {
      e.preventDefault();
      if (inFlight) return;

      /* The honeypot is NOT short-circuited here any more. It is sent and the
         server decides: it returns {ok:true} and writes nothing, so a bot
         cannot tell a trapped submission from a real one by watching either
         the response or the UI. Short-circuiting client-side would also make
         the server's honeypot untestable through the real form. */
      var bad = validate(form);
      if (bad) { bad.focus(); return; }

      /* JSON, posted as text/plain. Apps Script web apps send no CORS
         headers on the response to an application/json POST, so the browser
         blocks it and the fetch rejects EVEN WHEN THE SCRIPT RAN AND WROTE
         THE ROW. text/plain is a CORS "simple request": no preflight, and
         the response is readable. The script does JSON.parse(e.postData
         .contents) at the other end.

         mode:'no-cors' is deliberately NOT used. It makes the response
         opaque, which means every request looks like a success — including
         a validation rejection and a server error. The previous version of
         this file did exactly that. */
      var payload = { form_type: formType, form_id: form.getAttribute("id") || "lead_form" };

      /* Copy every named field the form actually has, rather than an
         allowlist. The allowlist here used to be six keys, which silently
         dropped doctor_slug and doctor_name — the hidden fields
         rk-scoped-booking.js injects so a lead is attributed to the right
         clinician. They were created and then never sent. */
      form.querySelectorAll("[name]").forEach(function (input) {
        var key = input.name;
        if (!key || key in payload) return;
        if (input.type === "checkbox" || input.type === "radio") {
          if (!input.checked) return;
        }
        payload[key] = String(input.value == null ? "" : input.value).trim();
      });

      payload.source_page = location.href;
      payload.page_title = document.title;

      inFlight = true;
      setBusy(true);

      var controller = new AbortController();
      var timedOut = false;
      var timer = window.setTimeout(function () {
        timedOut = true;
        controller.abort();
      }, LEAD_TIMEOUT_MS);

      fetch(LEAD_WEBHOOK_URL, {
        method: "POST",
        headers: { "Content-Type": "text/plain;charset=utf-8" },
        body: JSON.stringify(payload),
        signal: controller.signal,
        redirect: "follow"
      })
        .then(function (res) { return res.text(); })
        .then(function (text) {
          window.clearTimeout(timer);
          /* An uncaught server error returns Apps Script's HTML error page,
             not JSON. Parsing it must be a failure, never a success. */
          var data;
          try { data = JSON.parse(text); }
          catch (err) {
            throw new Error("Non-JSON response: " + String(text).slice(0, 120));
          }
          if (!data || data.ok !== true) {
            throw new Error("Server rejected: " + ((data && data.error) || "unknown"));
          }
          track("form_submit", {
            form_type: formType,
            form_id: payload.form_id,
            department: payload.department || "",
            doctor_slug: payload.doctor_slug || ""
          });
          /* The script returns only after BOTH the Sheet write and the email
             have finished, so sheet/mail are settled facts by the time we
             read them — not promises.

             A partial failure still means the lead was captured by at least
             one channel, so the visitor sees the ordinary confirmation. They
             cannot act on "the notification email did not send", and telling
             a patient something went wrong when their request is safely
             recorded would be worse than saying nothing. It is logged for
             whoever is watching the console, and the script separately
             reports it in `warnings`. */
          if (data.sheet === false || data.mail === false) {
            console.warn(
              "Lead captured with a PARTIAL delivery failure — " +
              "sheet=" + data.sheet + " mail=" + data.mail + ". " +
              "The visitor was shown the normal confirmation because at least " +
              "one channel succeeded.", data.warnings || []
            );
            track("form_partial_delivery", {
              form_type: formType, sheet: !!data.sheet, mail: !!data.mail
            });
          } else if (data.warnings && data.warnings.length) {
            console.warn("Lead accepted with warnings:", data.warnings);
          }
          /* Not setBusy(false) — that would restore "Request appointment" and
             invite a second submission. setDone() settles the button instead. */
          setDone();
          showSuccess();
        })
        .catch(function (err) {
          window.clearTimeout(timer);
          console.error("Lead webhook failed:", timedOut ? "timed out after " + LEAD_TIMEOUT_MS + "ms" : err);
          track("form_error", { form_type: formType, reason: timedOut ? "timeout" : "error" });
          inFlight = false;
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
