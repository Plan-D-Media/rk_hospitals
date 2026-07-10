# Acceptance Checklist — Ramakrishna Multispeciality Hospital website

Status legend: ✅ done · 🔶 done, pending client data · ⬜ pending

## Content integrity (hard rules)
- ✅ **Verified data only** — departments, diagnostics, 4 doctors, empanelment, NAP, founder story all from the client brief.
- ✅ **No fabricated stats** — template's "9,632 / 178 / 864" numbers removed; trust bar uses only verifiable facts (16+ specialities, 24×7, CT, 60+ cashless).
- ✅ **No fake testimonials** — testimonials section is an empty placeholder with a TODO.
- ✅ **No invented equipment** — the 15 department pages claim only the confirmed in-house diagnostics (pathology; upper-GI + therapeutic endoscopy; PFT + bronchoscopy; EEG/NCV/EMG; Echo/ECG/Holter/TMT; X-ray + CT) plus the department-specific facts the client stated (dialysis isolation facility, ENT microscope, C-arm, labour room, newborn nursery). No ultrasound, MRI or cath lab is claimed anywhere.
- ✅ **No invented doctors** — only the 4 verified consultants appear. Every other department page carries `<!-- TODO: dept doctors -->`.
- 🔶 **No accreditation claims** — no NABH/accreditation asserted; marked TODO to confirm.
- ✅ **Zero lorem / Melbourne / MedService / optometry / PHP** — sweep across all HTML/CSS/JS/XML returns no matches (command below).
- ✅ **Medical-claim discipline** — services described factually; no cure/outcome guarantees; no patient numbers or success rates.
- ✅ **Images** — every `<img>` has descriptive `alt` + explicit width/height; all 77 placeholders carry `<!-- TODO: real photo -->`.

## Design system
- ✅ Palette locked to logo: magenta `#BD2754` (primary/CTA), red `#E23A2E` (emergency only), charcoal `#2E2E33` (ink). Verified WCAG AA.
- ✅ Shared CSS (`rk-theme.css` + `rk-inner.css` + `rk-home.css`) + shared JS (`rk-main.js`) drive every page.
- ✅ Sticky header + utility bar; mobile nav; sticky mobile click-to-call bar; floating WhatsApp (green).
- ✅ **Logo** renders at 44px desktop / 36px mobile, `width:auto`, native 300×68 ratio preserved in both header and footer. (A squashed footer logo — `height` set without `width:auto`, so the `width="300"` attribute stretched it to 300×44 — was found and fixed.)
- ✅ `landing.html`'s six `lp-*` structural classes had no CSS anywhere; styles added so the paid-ad page renders.

## Navigation & IA
- ✅ Exactly two dropdowns: **Specialities▾** (all 15 department pages) and **Facilities▾**. No mega-menus.
- ✅ **Zero MedService demo menus** — "Pages", "Half Menu", "Mega Menu", "Simple Link" appear nowhere. The only `wsmegamenu` references lived in unreferenced legacy CSS/JS, now deleted.
- ✅ IA covers Cashless/TPA (`pricing-1`), Patient info (`faqs`, `timetable`), Testimonials (homepage slot) and Blog (`blog-listing`, `single-post`).
- ✅ Specialities grid (`all-departments.html`, 16 tiles), homepage Centres-of-Excellence tiles (7), doctor-page department links (4), sidebars and footers all point at real department pages. **0 broken internal links** across 39 pages.

## Departments
- ✅ 15 department pages: Cardiology (`department-single.html`) + 14 new, all built from the Cardiology template.
- ✅ Each has: unique title/meta description/canonical/OG (5 tags), exactly one H1, factual overview, conditions treated, procedures & services, relevant in-house diagnostics, why-choose-us (24×7 emergency, full critical care, in-house diagnostics up to CT, cashless & TPA), doctors-in-department, a 5-question FAQ, and a Book-Appointment CTA.
- ✅ JSON-LD per department page: `MedicalWebPage` + `BreadcrumbList` + `FAQPage`, all 3 parse as valid JSON. Visible FAQ count matches `FAQPage` entity count on every page.
- ✅ Doctors mapped correctly: Orthopaedics → Dr. Gourab Chatterjee · General Medicine → Dr. Shyan Kumar Biswas · Gynaecology & Obstetrics → Dr. Debosmita Roy · Dentistry → Dr. Aniket Sarkar. The other 11 pages (including Cardiology) show a "Doctors in this department" section with a `<!-- TODO: dept doctors -->` marker and no invented names.

## Conversion & lead capture
- ✅ One primary CTA (Book Appointment) repeated; emergency Call as secondary.
- ✅ **PHP deleted.** The `php/` folder (4 mail scripts) and the 4 legacy jQuery form scripts are gone. No `.php` reference survives anywhere.
- ✅ All 5 forms + the new blog comment form POST to a single `LEAD_WEBHOOK_URL` constant in `rk-main.js`, tagged `form_type`: `appointment` (`appointment.html`, `index.html`) · `contact` (`contacts-1`, `contacts-2`) · `hero` (`landing.html`) · `comment` (`single-post.html`).
- ✅ **CORS trap avoided** — body is `URLSearchParams` (`application/x-www-form-urlencoded`, a simple request, no preflight) sent with `mode:'no-cors'`. No `Content-Type` header is set and no JSON is sent.
- ✅ Validation: required name; valid Indian mobile (10 digits starting 6–9, optional `+91`); email format-checked where the field exists; required selects enforced. Inline `aria-invalid` + per-field error messages.
- ✅ Honeypot (`company`) blocks bots silently, client-side and server-side. Never included in the payload.
- ✅ Submit disabled while sending; success state; **error state with the fallback phone** on network failure. The user is never left on a dead form and never shown a fake thank-you.
- 🔶 `LEAD_WEBHOOK_URL` is still `TODO_PASTE_DEPLOYED_APPS_SCRIPT_URL` — until set, forms show the error state and nothing is sent. See `apps-script/README.md`.
- ✅ Server side generated: `apps-script/Code.gs` (`doPost` → Sheet row + `MailApp.sendEmail`) and `apps-script/README.md` (deploy guide + column order).
- ✅ Paid-ad landing variant (`landing.html`): no nav, form above the fold, message-matched.

## Tracking (placeholders, no fake IDs)
- 🔶 GTM slot in `<head>`/`<noscript>` (`GTM-XXXX`); `dataLayer` events fire on `form_submit`, `form_error`, `call_click`, `whatsapp_click`, `appointment_start`. `form_submit`/`form_error` carry `form_type`.
- 🔶 Google Ads `gtag('config','AW-XXXX')` and Meta Pixel left as TODO.

## SEO / AEO / GEO
- ✅ Unique `<title>` + meta description per page (39/39 unique, no duplicates); single H1 per page (39/39).
- ✅ Unique canonical per page (39/39). Semantic HTML5; breadcrumb on inner pages.
- ✅ JSON-LD: `Hospital` (home) with NAP/geo/phones/specialties; `Physician` (doctor pages); `MedicalWebPage` + `BreadcrumbList` + `FAQPage` (15 department pages); `FAQPage` (FAQ + diagnostics); `BlogPosting` (blog). Every block parses as valid JSON.
- ✅ Open Graph + Twitter cards per page.
- ✅ `sitemap.xml` (38 URLs, well-formed, includes all 15 department pages) + `robots.txt` + canonical tags.
- ✅ Local SEO: identical NAP everywhere; embedded Google Map; Barrackpore/Kolkata terms in copy.
- ✅ AEO: self-contained Q&A answers on FAQ and every department page.
- ✅ `landing.html` deliberately carries no JSON-LD, is `Disallow`-ed and is absent from the sitemap.

## Performance
- ✅ **Legacy purge done** — 39 unused MedService CSS/JS files + the Flaticon font folder deleted. No page referenced any of them. `css/` + `js/` went from ~1.4 MB to **64 KB across 4 files**.
- ✅ **Images purged** — 9.5 MB of stock photography deleted; `images/` is now **96 KB** (logo, favicon, apple-touch-icon, 6 SVG placeholders totalling 5.1 KB).
- ✅ Explicit width/height on all 77 images (CLS = 0 on swap); lazy-load map iframe.
- ✅ Existing `loading="lazy"` preserved — 30 of 77 slots carry it (`gallery.html` ×20, `blog-listing.html` ×6, department doctor cards ×4). The other 47 are eager; hero and department lead figures should stay that way (LCP element).
- ⬜ Convert photos to WebP; add `loading="lazy"` to the remaining below-the-fold images (doctor grids on `index`/`all-doctors`/`landing`, and the about/services/blog figures); inline critical hero CSS. **Deferred until real photos land.** Target LCP < 2.5s, CLS < 0.1 mobile.

## Accessibility (WCAG 2.1 AA)
- ✅ Colour contrast verified; visible focus states; keyboard-operable nav; aria-labels on icon buttons; labelled form fields; alt text on images; skip-to-content link.
- ✅ Form errors announced: `role="status"` on success, `role="alert"` on error, `aria-invalid` on bad fields.

---

## Verification

### Contamination sweep (run from project root)
```bash
grep -rniE "melbourne|king st|medservice|lorem|ipsum|optometry|eye exam|123456789|569-7890|half menu|mega.?menu|simple link|yourdomain|\.php" \
  --include=*.html --include=*.css --include=*.js --include=*.xml .
```
Expected: **no matches.**

### Broken-link / missing-asset check
```bash
python - <<'PY'
import io,re,glob,os
bad=[]
for p in sorted(glob.glob("*.html")):
    s=io.open(p,encoding="utf-8").read()
    for h in re.findall(r'(?:href|src)="([^"#:]+?)"', s):
        if h.startswith(("http","mailto","tel","//","data:")) or not h.strip(): continue
        t=h.split("#")[0].split("?")[0]
        if t and not os.path.exists(t): bad.append((p,t))
print("broken:", bad or "0 — clean")
PY
```
Expected: **0 — clean.**

### Form behaviour
`js/rk-main.js` was exercised in a real DOM (jsdom) across all 6 forms: 62 assertions covering
payload shape, urlencoded body, `no-cors` mode, absent `Content-Type`, honeypot, phone/email
validation, required fields, success state, network-failure error state, button re-enable,
input preservation on failure, and dataLayer events. **62/62 pass.**

Phone validator accepts `8240842519`, `+918240842519`, `918240842519`, `+91 82408 42519`,
`+91-82408-42519`; rejects 9- and 11-digit numbers, leading `0`, series `1`–`5`, and foreign
numbers. **16/16 pass.**
