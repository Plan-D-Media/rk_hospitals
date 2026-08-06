/* ============================================================
   rk-scoped-booking.js — doctor- and department-scoped enquiries

   A visitor on Dr. X's page taps "Book Appointment" and lands on the
   appointment form already scoped to Dr. X. They chose once; they are
   not asked to choose again.

   MECHANISM: a query param, not a modal. The site is static with no
   build step, so a modal would mean duplicating the form markup onto 19
   more pages — the opposite of consolidation. A param is shareable,
   bookmarkable, survives the back button, and needs no new markup on the
   doctor pages at all.

     /appointment?doctor=doctor-1
     /appointment?dept=department-orthopaedics

   The scope block is ADDED by this script and never required by it. With
   JS off, or with an unknown param, the form renders exactly as it does
   today — generic, complete, submittable. There is no state in which a
   bad param produces a broken or empty form.

   NOTHING IS WIRED. LEAD_WEBHOOK_URL in rk-main.js is still unset; this
   only shapes the payload that submission will eventually carry.
   ============================================================ */
(function () {
  "use strict";

  /* Allowlist keyed by ROUTE SLUG, never by name. Four of the thirteen
     supplied doctor names are disputed; the routes are not. A slug that
     changed with a spelling correction would silently break attribution
     in the lead data with no error anywhere. */
  var DOCTORS = {
    "doctor-1":  { name: "Dr. Gourab Chatterjee",     dept: "Orthopaedics" },
    "doctor-2":  { name: "Dr. Shyan Kumar Biswas",    dept: "General Medicine" },
    "doctor-3":  { name: "Dr. Debosmita Roy",         dept: "Gynaecology & Obstetrics" },
    "doctor-4":  { name: "Dr. Aniket Sarkar",         dept: "Dentistry" },
    // Visiting consultants, added from the client roster ruling.
    "doctor-5":  { name: "Dr. Rupsha Chowdhury",      dept: "Gynaecology & Obstetrics" },
    "doctor-6":  { name: "Dr. Vivesh Kumar Singh",    dept: "Orthopaedics" },
    "doctor-7":  { name: "Dr. Milli Singh",           dept: "Paediatrics & Neonatology" },
    "doctor-8":  { name: "Dr. Agniv Sarkar",          dept: "Gynaecology & Obstetrics" },
    "doctor-9":  { name: "Dr. Shubhadip Chakraborty", dept: "Orthopaedics" },
    "doctor-10": { name: "Dr. Goutam Mondal",         dept: "Urology" },
    // Tier B: card only, no profile page. Booking still attributes correctly.
    "doctor-11": { name: "Dr. Atanu Ghosh",           dept: "General Medicine" },
    "doctor-12": { name: "Dr. Midul Biswas",          dept: "Orthopaedics" },
    "doctor-13": { name: "Dr. Siddharth Nandi",       dept: "Paediatrics & Neonatology" },
    "doctor-14": { name: "Dr. Sourav Bhagat",         dept: "General Medicine" }
  };

  /* Department slugs are the existing department-*.html routes. The label
     must match an <option> in the select verbatim or the pre-fill is a
     no-op — deliberately, rather than inventing an option. */
  var DEPTS = {
    "department-emergency-critical-care": "Emergency & Trauma",
    "department-single": "Cardiology",
    "department-nicu-picu": "Paediatrics & Neonatology",
    "department-gastroenterology": "Gastroenterology",
    "department-dialysis": "Nephrology / Dialysis",
    "department-ent": "ENT",
    "department-general-medicine": "General Medicine",
    "department-general-laparoscopic-surgery": "General & Laparoscopic Surgery",
    "department-orthopaedics": "Orthopaedics",
    "department-gynaecology-obstetrics": "Gynaecology & Obstetrics",
    "department-paediatrics-neonatology": "Paediatrics & Neonatology",
    "department-pulmonology": "Pulmonology",
    "department-urology": "Urology",
    "department-endocrinology": "Endocrinology",
    "department-dentistry": "Dentistry"
  };

  var form = document.querySelector('form[data-lead-form="appointment"]');
  if (!form) return;

  var params = new URLSearchParams(window.location.search);
  var docSlug = params.get("doctor");
  var deptSlug = params.get("dept");

  var doc = docSlug && Object.prototype.hasOwnProperty.call(DOCTORS, docSlug)
    ? DOCTORS[docSlug] : null;
  var deptLabel = deptSlug && Object.prototype.hasOwnProperty.call(DEPTS, deptSlug)
    ? DEPTS[deptSlug] : null;

  // Unknown or absent param: leave the form exactly as it is.
  if (!doc && !deptLabel) return;

  var select = form.querySelector('[name="department"]');
  var label = doc ? doc.dept : deptLabel;

  /* Pre-fill only if the label exists as a real option. If it does not,
     the visitor still picks a department — no invented option, no silent
     mismatch between what they see and what is sent. */
  if (select && label) {
    var matched = Array.prototype.slice.call(select.options).some(function (o) {
      if (o.textContent.trim() === label) { select.value = o.value || o.textContent; return true; }
      return false;
    });
    if (matched) select.setAttribute("data-prefilled", "true");
  }

  /* Hidden fields: the slug is the stable key, the name a convenience
     label allowed to go stale. source_page is already added by rk-main.js. */
  function hidden(name, value) {
    var el = document.createElement("input");
    el.type = "hidden"; el.name = name; el.value = value;
    form.insertBefore(el, form.firstChild);
  }
  if (doc) { hidden("doctor_slug", docSlug); hidden("doctor_name", doc.name); }
  if (deptSlug && deptLabel) hidden("department_slug", deptSlug);

  /* The visible scope block, injected — never present in the HTML, so a
     no-JS visitor cannot see a claim the payload will not carry. */
  var box = document.createElement("div");
  box.className = "scoped-note";
  box.innerHTML =
    '<span class="scoped-note__l">' +
      '<svg class="ico" aria-hidden="true"><use href="#i-user-md"/></svg>' +
      '<span>Booking with <strong></strong></span>' +
    '</span>' +
    '<button type="button" class="scoped-note__change">Change</button>';
  box.querySelector("strong").textContent = doc ? doc.name : deptLabel;

  box.querySelector(".scoped-note__change").addEventListener("click", function () {
    // Clearing the param is the honest reset: reload without scope so the
    // form and the payload agree again.
    var u = new URL(window.location.href);
    u.searchParams.delete("doctor");
    u.searchParams.delete("dept");
    window.location.replace(u.toString());
  });

  form.insertBefore(box, form.firstChild);

  // Announce the scope for screen readers without moving focus.
  box.setAttribute("role", "status");
})();
