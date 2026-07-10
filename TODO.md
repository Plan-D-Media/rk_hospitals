# TODO — Ramakrishna Multispeciality Hospital website

Everything the client / Plan D must supply or confirm before go-live. Grouped by priority.
Grep the codebase for `<!-- TODO` to see every inline marker in context.

---

## 🚨 BEFORE LAUNCH — set the production domain (single find-replace)
The site uses **clean, extensionless URLs** (`/about-us`, not `/about-us.html`; home is `/`),
hosted on **Vercel** (`vercel.json` → `cleanUrls:true, trailingSlash:false`; Vercel serves the
clean URL and 308-redirects the `.html` version automatically).

Until the domain is finalised, every absolute URL uses the placeholder **`TODO_DOMAIN.in`**.
When the domain is confirmed, do ONE find-replace across the whole project:

> **Find** `TODO_DOMAIN.in` → **Replace** with the real domain (e.g. `rkhospitals.in`).

That single swap fixes every `<link rel="canonical">`, `og:url`, `og:image`, all JSON-LD
`url`/`item`/`image` fields, `sitemap.xml`, and the `robots.txt` Sitemap line — all consistent.
Then submit `sitemap.xml` in Google Search Console. (Internal page links are relative/root-
absolute and domain-independent, so they need no change.)

---

## 🔴 Blockers for launch / campaigns

### Lead capture — the webhook (do this first)
The site is **fully static**. There is no PHP. Every form posts to one Google Apps Script
web app, which writes a row to a Google Sheet and emails the recipients.
Full deploy guide: **`apps-script/README.md`** (about 10 minutes).

- [ ] **`SHEET_ID`** — create the Google Sheet, paste its id into `apps-script/Code.gs`.
- [ ] **`TODO_CLIENT_EMAIL`** — the client's inbox, in the `RECIPIENTS` array in
      `apps-script/Code.gs`. `plandleadtest@gmail.com` is already there. Recipients still
      starting with `TODO` are skipped automatically, so the script works before you have it.
- [ ] **`LEAD_WEBHOOK_URL`** — deploy the script (Execute as **Me**, Who has access **Anyone**),
      copy the `/exec` URL and paste it into `js/rk-main.js` (line ~14).

> ⚠️ **Until `LEAD_WEBHOOK_URL` is set, every form shows its error state** and tells the
> visitor to call `+91 82408 42519` instead. This is deliberate — the old behaviour showed a
> fake "thank you" while sending nothing anywhere. Nothing is silently swallowed, but **no
> lead is captured either**, so set the URL before you send any traffic.

### Tracking
- [ ] **GTM container id** — replace all `GTM-XXXX` (in `<head>` script + `<noscript>` on every page).
- [ ] **Google Ads** — add real `gtag('config','AW-XXXX')` + conversion actions.
- [ ] **Meta Pixel** — add real `fbq('init','PIXEL_ID')`.
- [ ] dataLayer events already fire on: `form_submit`, `form_error`, `call_click`,
      `whatsapp_click`, `appointment_start` — wire these to GTM triggers.
      `form_submit` and `form_error` carry a `form_type` of
      `appointment` · `contact` · `hero` · `comment`.

### Verified contact facts
- [ ] **Which phone is the 24×7 emergency line?** — confirm `+91 82408 42519` vs `+91 87774 24002`.
      `+91 82408 42519` is currently used sitewide as the emergency + fallback number.
- [ ] **Email address** — not currently shown (contacts pages have `<!-- TODO: email -->`).
- [ ] **Exact Google Maps pin / place** for 203/1 Ghoshpara Road — confirm the embedded map lands
      on the right spot; replace with the official Google Business Profile embed if available.
- [ ] **Geo coordinates** in the homepage `Hospital` JSON-LD are approximate (`22.7639, 88.3775`)
      — confirm exact lat/long.

---

## 🟠 Content the client must supply

### Doctors
- [ ] **Full doctor roster** — only 4 are verified & built (Dr. Gourab Chatterjee, Dr. Shyan Kumar
      Biswas, Dr. Debosmita Roy, Dr. Aniket Sarkar). Every other department page carries a
      `<!-- TODO: dept doctors -->` marker.
- [ ] **OPD days & timings** per doctor (`timetable.html` + each profile — currently "by appointment").
- [ ] **Medical registration numbers** per doctor.

### Per-department facts to confirm
All 15 department pages are built from verified facts only. Each carries an inline
`<!-- TODO: ... -->` naming exactly what is unconfirmed. Summary:

| Department | Needs confirming |
|---|---|
| Emergency & Critical Care | Ambulance service; is the emergency OT staffed 24×7? |
| NICU & PICU | NICU level; ventilator & phototherapy capability; cot/bed counts |
| Gastroenterology | Is colonoscopy / ERCP performed in-house? |
| Dialysis | Number of stations; session timings; per-session cost; peritoneal dialysis / CRRT? |
| ENT | ENT surgical procedure list; is audiometry done in-house? |
| General & Laparoscopic Surgery | Full procedure list; number of OTs; 24×7 emergency OT?; surgeon roster |
| Orthopaedics | Joint replacement? Arthroscopy? In-house physiotherapy? |
| Gynaecology & Obstetrics | **Ultrasound / USG availability** (not in the confirmed diagnostics list); caesarean sections; gynae surgery list |
| Paediatrics & Neonatology | Routine immunisation / vaccination? Paediatrician roster |
| Urology | Endourology / stone surgery / TURP list; USG KUB in-house? |
| Endocrinology | Endocrinologist roster; dietitian / diabetes educator in-house? |
| Dentistry | Root canal, implants, orthodontics, scaling, OPG dental X-ray? |
| Cardiology · General Medicine · Pulmonology | *(nothing outstanding — all claims verified)* |

**The confirmed in-house diagnostics list** (used across every department page) is: pathology;
upper-GI + therapeutic endoscopy; PFT + bronchoscopy; EEG/NCV/EMG; Echo/ECG/Holter/TMT; X-ray + CT.
**No ultrasound, MRI or cath lab is claimed anywhere** — do not add one without confirmation.

### Other content
- [ ] **Ambulance service** — confirm availability before stating it.
- [ ] **Health check-ups** (`pricing-2.html`) — real package names, inclusions and prices (show `₹ —`).
- [ ] **NABH / accreditation** — do NOT publish any accreditation claim until confirmed.
- [ ] **Full empanelment list (60+)** — ~21 are shown; pull the complete list and confirm the exact
      count (homepage + `pricing-1.html`).
- [ ] **Visiting / attendant hours, cashless-desk hours** (`faqs.html`).
- [ ] **Real testimonials** — the section is intentionally empty.
- [ ] **Google reviews embed** — slot reserved on the homepage.
- [ ] **Blog** — all posts are teasers; needs real, medically-reviewed articles + publish dates + author.
- [ ] **Social profile URLs** (footer icons are `#`).
- [ ] **Legal review** of Privacy / Disclaimer / Terms (`terms.html`).

---

## 📸 Photography — every content image is a placeholder

All stock/template photos have been **deleted**. Every `<img>` now points at a lightweight inline
SVG placeholder in `images/placeholders/` that reserves the exact width and height, so there is no
layout shift and nothing is broken. Swap each `src` for the real photo at the stated size.

**97 slots across 30 pages** (the homepage redesign added the 3 hero slides and the 21-tile logo
wall). Only the logo and favicon survive in `images/`.

Shoot at **2× the listed size** where possible, then export down. Export JPEG at ~80% quality
(WebP conversion comes later — see the performance section).

### Priority 0 — homepage hero slider (NEW)
The homepage hero is now a background-image **slider** with the headline overlaid.
It ships with 3 labelled placeholder slides at **1920×1080 (16:9)**.

| Slide | Size | Subject |
|---|---|---|
| 1 (LCP) | 1920×1080 | Hospital exterior on Ghoshpara Road |
| 2 | 1920×1080 | Emergency & critical care team at work |
| 3 | 1920×1080 | In-house diagnostics, radiology up to CT |

**Shooting the hero photos:**
- Landscape 16:9, JPEG ~80% quality, **under 400 KB** each.
- Keep the important subject in the **right half** of the frame — the left half sits under the
  dark magenta scrim that the headline is written on.
- Slide 1 is the LCP image: keep it the lightest/fastest of the three.

**How to add an "occasion" slide later (Doctors' Day, Durga Puja, a camp):**
1. Export the photo at 1920×1080 and save it into `images/` (e.g. `images/hero-doctors-day.jpg`).
2. Open `index.html`, find the block marked **`HERO SLIDES`**, copy any one
   `<div class="hs-slide"> … </div>` block, paste it after the last one, and change only the
   `img` `src` and `alt`. Keep `width="1920" height="1080"` and `loading="lazy"`. Do **not** add
   `class="is-active"` (that stays on slide 1). The dots, arrows and auto-advance update themselves.
3. To remove it after the occasion, delete the block. To reorder, move blocks — and if you change
   which slide is first, update the `<link rel="preload">` in `<head>` to point at the new first image.
4. Full instructions are also inline at the top of `js/rk-hero-slider.js` and in the `HERO SLIDES`
   comment in `index.html`. Timing (6s auto-advance) is the `RK_HERO_CONFIG` object in that JS file.

### Priority 1 — empanelment logo wall (NEW)
The homepage "Cashless & empanelment" section is now a **logo wall** — a grid of 21 partner tiles,
each a `160×80` logo placeholder with the scheme name beneath it.

| Slot | Size | Subject |
|---|---|---|
| 21 × logo tiles | 160×80 | Real partner logos: West Bengal Health Scheme, Ayushman Bharat, SAIL, Coal India, Eastern Railway, IOCL, HPCL, BPCL, ONGC, SBI, TCS, Tata Steel, BSNL, BSF, CISF, Ordnance Factory, Gun & Shell Factory, Rifle Factory Ishapore, Kolkata Port Trust, IIT Kharagpur, Jadavpur University |

Supply each logo as a transparent PNG or SVG. Once the full 60+ list is confirmed, copy a
`<div class="lw-item">…</div>` block per new partner into the `#empanel-extra` span in `index.html`.

### Priority 2 — homepage other slots
| Page | Size | Subject |
|---|---|---|
| `index.html` | 700×700 | Hospital building exterior, Barrackpore (About section) |
| `index.html` | 700×700 | In-house diagnostic laboratory |
| `index.html` | 400×400 | Doctor headshots ×4 (see Priority 3) |
| `index.html` | 800×500 | Blog teaser thumbnails ×3 |
| **Google reviews** | — | The homepage "What our patients say" section is a **reserved, height-stable slot** (`.reviews-slot`, `<!-- TODO: reviews embed -->`). Drop the Google reviews embed in there; it won't shift the page. |
| *(all pages)* | 1200×630 | **Social-share (OG) image** — currently falls back to the logo |

### Priority 2 — doctors (4 verified)
| Page | Size | Subject |
|---|---|---|
| `all-doctors.html`, `index.html`, `landing.html` | 400×400 | Headshot ×4 — Dr. Gourab Chatterjee, Dr. Shyan Kumar Biswas, Dr. Debosmita Roy, Dr. Aniket Sarkar |
| `doctor-1..4.html` | 300×400 | Portrait (taller crop) of the same four |
| `department-orthopaedics` / `-general-medicine` / `-gynaecology-obstetrics` / `-dentistry` | 400×400 | Same headshots, on the department page |

### Priority 3 — department lead figures (1000×500, one per page)
`department-single.html` *(Cardiology)* · `-emergency-critical-care` · `-nicu-picu` ·
`-gastroenterology` · `-dialysis` · `-ent` · `-general-medicine` ·
`-general-laparoscopic-surgery` · `-orthopaedics` · `-gynaecology-obstetrics` ·
`-paediatrics-neonatology` · `-pulmonology` · `-urology` · `-endocrinology` · `-dentistry`

Each placeholder's `alt` text already describes the intended subject (e.g. *"Endoscopy suite at
Ramakrishna Multispeciality Hospital, Barrackpore"*). Shoot to the `alt`.

### Priority 4 — about, services, diagnostics
| Page | Size | Subject |
|---|---|---|
| `about-us.html` | 800×600 | Care team attending to a patient |
| `about-us.html` | 700×700 | Hospital building |
| `who-we-are.html` | 700×700 | Hospital building |
| `who-we-are.html` | 800×600 ×2 | Care & hospitality; hospital as a unit of Sarbani Hospitality |
| `all-services.html` | 700×700 | In-house diagnostic laboratory |
| `all-services.html` | 1000×500 | Radiology / X-ray imaging |
| `service-1.html` | 800×600 | Emergency & trauma care |
| `service-2.html` | 800×600 | Critical care team |

### Priority 5 — gallery (20 × 800×600)
Reception & entrance · waiting area · consultation room · inpatient ward · nursing station ·
critical care unit · diagnostic imaging area · pathology lab · operation theatre · emergency
department · pharmacy counter · private room · corridor · care team with patient · help desk ·
treatment & dressing room · day-care / observation area · diagnostic equipment · patient care
space · hospital exterior.

> When the real photos land, also restore each gallery `<a href>` to the full-size image and
> re-enable a lightbox. The hrefs currently mirror the placeholder so nothing 404s.

### Priority 6 — blog (800×500)
`blog-listing.html` needs 6 (emergency vs OPD · heart check-up · cashless hospitalisation · NICU
newborn · type-2 diabetes · laparoscopic surgery). `single-post.html` needs 1 (emergency
department). `index.html` blog teaser needs 3. The `BlogPosting` JSON-LD `image` on
`single-post.html` currently falls back to the logo — point it at the real 1200×630 article image.

### Logo
- [ ] **Supply a 2× logo (600×136) or an SVG.** The current PNG is exactly 300×68, and the header
      renders it at 44px tall (≈194px wide). That is fine on a 1× display but slightly soft on
      a 2×/3× phone screen. Not a blocker — just the last step to a fully crisp header.

---

## ⚡ Performance — deferred until real photos land

Safe cleanup is **done**: 39 unused legacy MedService CSS/JS files and the Flaticon web-font
folder were deleted. Only `rk-theme.css`, `rk-inner.css`, `rk-home.css` and `rk-main.js` remain
(64 KB total, down from ~1.4 MB). No page ever referenced the deleted files.

Still to do, **after** the photo shoot:
- [ ] Convert all photos to **WebP** (with JPEG fallback).
- [ ] **Finish lazy-loading.** 30 of the 77 image slots already carry `loading="lazy"`:
      `gallery.html` (20), `blog-listing.html` (6) and the doctor card on each of the 4
      department pages that has one. The rest are still eager — the doctor grids on
      `index.html`, `all-doctors.html` and `landing.html`, and the figures on `about-us.html`,
      `who-we-are.html`, `all-services.html`, `service-1/2.html`, `single-post.html` and the
      `doctor-1..4.html` portraits. Add `loading="lazy"` to those once real photos land.
      Hero and department lead figures should stay **eager** (they are the LCP element).
- [ ] Inline critical hero CSS.
- [ ] Target LCP < 2.5s, CLS < 0.1 on mobile.

Existing `width`/`height` and `loading` attributes are intact — do not strip them, they are what
keeps CLS at zero.

---

## 🟢 SEO / config
- [ ] **Production domain** — see the "BEFORE LAUNCH" block at the top: one find-replace of
      `TODO_DOMAIN.in` sets canonical / OG / JSON-LD / sitemap / robots together.
- [ ] Submit `sitemap.xml` in Google Search Console; verify the property. (38 clean, extensionless
      URLs, including all 15 department pages.)
- [ ] **Local preview** with clean URLs: `npx vercel dev` from the project root (Live Server /
      `python -m http.server` do NOT apply the `.html`→clean rewrites, so cross-page links 404 there).
- [ ] Set up the **Google Business Profile** (Maps) with identical NAP.

---

## Notes
- Palette is locked: magenta `#BD2754` (from logo), red `#E23A2E` (emergency), charcoal `#2E2E33`
  (ink). See `css/rk-theme.css`.
- The logo asset is **monochrome magenta** — if a full-colour logo (with red cross / charcoal) is
  provided later, resample and update tokens.
- `landing.html` is the paid-ad variant (no nav, form above the fold), is `Disallow`-ed in
  `robots.txt` and is deliberately absent from `sitemap.xml` and carries no JSON-LD, so it does not
  compete organically.
- The nav has exactly two dropdowns — **Specialities** (all 15 departments) and **Facilities**.
  No mega-menus, no leftover template menus.
- **Homepage redesign (index.html only, this pass).** The homepage now has a background-image
  hero slider (`js/rk-hero-slider.js`), a vanilla typing effect (`js/rk-text-type.js`), an inline
  SVG icon sprite (Font Awesome is **not** loaded on the homepage), and elevation styles in
  `css/rk-home-v2.css`. These patterns are **not yet rolled to the other pages** — the rest of the
  site still uses Font Awesome and the older hero. Rolling them out sitewide is a separate, approved
  step. The typing module and slider are reusable and documented in their own file headers.
