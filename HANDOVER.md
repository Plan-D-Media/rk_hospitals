# Handover — Ramakrishna Multispeciality Hospital

Written for someone who was not part of the build. Read this first, then
`DEFERRED.md` (everything waiting on the client) and `IMAGE-BRIEF.md`
(every photographic slot and what to shoot).

---

## What this is

A visual and interaction redesign of the existing site. **The content and
information architecture were already good; the visual design was the problem.**
No page URL changed, no factual content was removed, and the stack is unchanged:
plain HTML, CSS and vanilla JS, no build step, no framework, deployed on Vercel.

`vercel.json` sets `cleanUrls: true`, so `/about-us` serves `about-us.html`.
**Never open this project with VS Code Live Server** — it has no rewrite for
that and every page 404s. Use `vercel dev` (port 3000) or `npx serve .`.

---

## Architecture

### Stylesheets — four, in this order

| File | Scope |
|---|---|
| `rk-system.css` | Tokens, reset, typography, layout, buttons, forms, cards, icons, motion, utilities |
| `rk-blocks.css` | Every shared component — header, mega-panel, drawer, hero, all homepage sections, footer, modal, mobile bar |
| `rk-inner.css` | Inner-page-only: page hero, prose, sidebar, filters, FAQ, gallery, legal |
| `rk-home.css` | **Landing page only** (`.lp-*`). Safe to rename `rk-landing.css`. |

Two files were retired during the build (`rk-theme.css`, `rk-home-v2.css`) and
the legacy token alias shim is gone.

**Correction.** An earlier version of this file said "zero legacy token
references remain". That was true of `css/` and false of the site. The cascade
audit only ever read stylesheets, so **8 undefined custom properties survived
in 30 HTML files** — in inline `style` attributes and in the embedded `<style>`
blocks on `landing.html` and `timetable.html`. Two of them produced *invisible
text*: a `color:#fff` button on a background that resolved to nothing. All 57
references were remapped in `5cdb227`; the count is **now genuinely zero**,
verified across `css/` **and** all 46 HTML files.

Four pages carry an embedded `<style>` block — `index.html` (the generated
critical CSS), `landing.html`, `timetable.html`, `404.html` — and there are
248 inline `style` attributes. **Anything in either is outside the stylesheets
and will be missed by any audit that globs `css/*.css`.**

### The `min-width: auto` default

`:where(*) { min-width: 0; min-height: 0 }` near the top of `rk-system.css`.
Grid and flex children floor at their content's minimum size, so one wide
descendant scrolls the whole page sideways. This was patched instance by
instance five times before becoming a default; it absorbed 17 of the 18
individual patches. **There is exactly one exception**, on the stacked mobile
`.hero__media`, and it is not the same problem — it resets an explicit
`min-height: 460px`, which no default can cover. Removing it grows the hero
148px at 360×800.

### The one rule that must not be broken

Documented at the top of `rk-system.css`:

> `--emergency` is an **alias** of `--brand-500`. They are the same hue by
> design. Urgency is signalled by **treatment**, never colour:
> **primary = crimson solid fill**, **emergency = ink outline + number in mono**.
> Never two crimson fills in one viewport.

A crimson *field* (the emergency band) is the exception — there the band carries
the urgency and its button is `.btn--white`.

### JavaScript — five files, all `defer`, no dependencies

| File | Does |
|---|---|
| `rk-ui.js` | Sticky header, mega-panels, mobile drawer, accordions, focus trap, scroll lock, modal |
| `rk-open-now.js` | The live status device. **Edit `RK_HOURS` at the top and nothing else.** |
| `rk-scoped-booking.js` | Reads `?doctor=` / `?dept=` and scopes the appointment form |
| `rk-scroll-velocity.js` | The empanelment marquee (homepage + pricing-1) |
| `rk-main.js` | Form validation, lead POST, scroll reveal, tracking hooks |

### `partials/` is reference-only

Nothing is built or fetched from it. It holds the canonical header, footer,
icon sprite and appointment form so there is **one source of truth to copy
from**. Editing a file there changes nothing until it is propagated.

---

## Things that will surprise you

**The clock is always Barrackpore time.** `rk-open-now.js` uses
`Intl.DateTimeFormat` with `timeZone: 'Asia/Kolkata'`, verified showing IST from
emulated Dubai, London and New York. An NRI checking on a parent must see the
hospital's hours, not their own.

**`RK_HOURS.opd` is `null`, deliberately.** While null, **no OPD line renders at
all** — not an empty row, not a dash. Filling it in later moves nothing
(verified: the card grows 99→132px and the section below stays at the same y).
The per-doctor visiting times on the post graphics are *consultants' visiting
hours*, not hospital OPD hours, and are published on the profile pages instead.

**`font-display: optional`, not `swap`.** Fraunces is ~15% wider than the
fallback and the h1 wraps over four lines, so a late swap changed the line
*count* and shifted everything below it — measured 0.1147 CLS. `optional` means
the font is used if it arrives inside the ~100ms window and skipped otherwise.
With the subset preloaded it wins that window 8/8 runs.

**Fonts are self-hosted.** The site contacts **zero third-party hosts**.
Fraunces is subset to the characters it actually needs (65.7 → 40.9 KB).

**`images/interim/` is a go-live gate.** It contains AI-generated hero imagery
that depicts a hospital which does not exist. **`ls images/interim/` must return
empty before sign-off.** Real client photography lives in `images/doctors/`;
social post graphics in `images/social/`.

**Doctor slugs are route-based, never name-based.** `data-doctor="doctor-7"`,
not `milli-singh`. Four of thirteen supplied names were disputed — a name-derived
slug would have silently broken lead attribution with no error anywhere.

---

## The doctor roster

Fourteen entries in three tiers, by how much verified data exists.

- **Tier A** (`doctor-1`, `2`, `5`–`10`) — full profile pages with photo, degrees,
  visiting times and `Physician` JSON-LD. **No biographies** were written: nothing
  beyond the credentials has a verified source.
- **Tier B** (`doctor-11`–`14`) — card only, no page. Photo, name, speciality and a
  scoped Book link. **The card does not link through**, because a card leading to
  an empty page is worse than one that does not link.
- **Tier C** (`doctor-3`, `doctor-4`) — existing pages, no photograph supplied,
  placeholder retained.

**Dr. Agniv Sarkar (`doctor-8`) is not Dr. Aniket Sarkar (`doctor-4`).** Different
clinicians, same surname, different specialities. Do not merge them.

---

## Honesty positions taken — do not quietly reverse these

Each of these exists because the alternative would mislead a patient.

1. **"Book Appointment" is the CTA; the submission tells the truth.** Nothing
   here reserves a slot. The submit button says *Request appointment*, a line
   above the form says the desk will call to confirm, and the confirmation says
   plainly that it is an enquiry and not a confirmed appointment. Someone who
   believes they hold a slot and turns up is a real harm.
2. **"Price on request", never `₹ —`.** A dash where a number belongs reads as
   broken. A real figure drops into `<span class="price">`.
3. **Testimonials are removed from the DOM**, not shown as an empty state. The
   markup survives as a commented block with re-enable instructions and a
   reserved-height slot for a Google Reviews embed.
4. **No "reports the same day" claim** on diagnostics — unverified.
5. **No founder quotation.** The about section carries an unattributed statement
   of intent. Putting site copy in quote marks against a named person would be a
   claim about something she said.
6. **Superlatives removed from `landing.html`.** `index.html`'s `<title>` still
   leads with "Best…" — a live SEO decision the client owns.

---

## Measured state

| Gate | Result |
|---|---|
| Horizontal scroll, 46 pages × 8 widths | **none** (368 combos) |
| Console errors / 404s | **clean** |
| Broken links / sitemap / anchors | **0 / 0 / 0** |
| CLS | **0.0010** |
| LCP | **2.54s** — misses the 2.5s gate by 0.04s |

LCP is measured at 360px, DPR 2, 4× CPU throttle, Fast 3G, 9 runs, median.
The spread is 2.01–3.54s. Above-fold CSS is inlined and the rest deferred;
that took LCP from 3.41s. **The remaining gap was not bought by degrading the
hero image** — a doctor's face and a hospital interior are the wrong place to
trade visible quality for ~150ms.

---

## What is not done

- **`LEAD_WEBHOOK_URL` is unset** (`js/rk-main.js`, ~line 14). Every form shows
  its guarded error state and tells the visitor to phone. **No lead is captured.**
  This is deliberate — the previous behaviour showed a fake "thank you" while
  sending nothing. Deploy the Apps Script (`apps-script/README.md`) and paste the
  `/exec` URL. This is the single thing standing between a finished form and a
  captured lead.
- **A full accessibility pass** — keyboard and screen-reader — has not been run
  end to end. Individual components were verified (drawer focus trap holds
  through 40 tabs, Esc returns focus, modal traps and restores, contrast
  measured on every hero and card element), but the site has not had a complete
  manual pass.
- **Analytics.** The placeholder GTM container was removed rather than shipped.
  Nothing is tracked. `dataLayer` events still fire and are ready to wire.
- Everything in `DEFERRED.md`, most urgently the **doctor identity questions**.

---

## If you change one thing, know this

The tooling in this build repeatedly reported things as passing that were not:
a stale cached JS file, a contrast sampler reading padding instead of glyphs, a
"quick actions overlap" that was overlapping the hero's padding rather than the
photograph for four review rounds. There is a set of assertions in the
scratchpad that throw on impossible measurements rather than reporting them.

The lesson worth carrying: **verifying that a CSS property was applied is not
the same as verifying the relationship it was supposed to produce.** Measure the
relationship.
