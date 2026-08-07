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
| Mobile sweep, 18 templates × 6 viewports | **none** (108 screens, portrait + landscape) |
| WCAG 1.4.10 Reflow @ 320px | **10/10 pass** |
| WCAG 1.4.4 Text @ 200% | **10/10 pass** |
| Console errors / 404s | **clean** |
| Broken links / sitemap / anchors | **0 / 0 / 0** |
| One crimson fill per viewport | **23/23 pages** |
| Lighthouse mobile — Accessibility | **100** on all four page types |
| Lighthouse mobile — Best Practices / SEO | **100 / 100** |
| Lighthouse mobile — Performance | 93 / 89 / 94 / 94 |
| CLS | **≤ 0.001** |

Lighthouse was run on `index`, a Tier A doctor page, `appointment` and
`timetable` — deliberately not the homepage alone, which is the most
optimised page on the site and flatters the rest.

**Read the Lighthouse byte and timing numbers with one correction.** They were
measured against `vercel dev`, which sends **no `content-encoding` at all**.
Production returns `Content-Encoding: br` (verified against the live
deployment). So Lighthouse's "142 KiB of text-compression savings" does not
exist in production, and every LCP figure below is pessimistic.

LCP by the project's own harness is **2.54s** at 360px, DPR 2, 4× CPU throttle,
Fast 3G, 9 runs, median — 0.04s over the 2.5s gate. The spread is 2.01–3.54s.
**The remaining gap was not bought by degrading the hero image** — a doctor's
face and a hospital interior are the wrong place to trade visible quality for
~150ms.

---

## Deployment — READ THIS BEFORE ADDING ANY CREDENTIAL

**The repository is PUBLIC, and that is a workaround, not a decision.**
Vercel's Hobby plan refuses Git deploys from a private repo when the commit
author does not match the GitHub account connected to the project. Making the
repo public sidesteps that check.

**Production is currently deployed with `npx vercel --prod`** from a linked
local checkout — not by Git push. A push to `main` alone does **not** update
the live site. This is why the site sat on a stale build for several hours
while `origin/main` was many commits ahead: everything was pushed, nothing was
deployed.

Three permanent fixes, any one of which ends the workaround:
1. **Upgrade to Vercel Pro** — private-repo Git deploys work normally.
2. **Keep the repo public** — a deliberate choice, not a default, and only
   safe while the rules below hold.
3. **Set the commit author** to the GitHub account connected to the Vercel
   project, and re-enable Git deploys.

**This MUST be resolved before any credential of any kind enters the repo.**
Today nothing sensitive is committed — `.env*` is gitignored (verified), no
key, token, `.pem` or credential file is tracked (verified), and the Apps
Script `/exec` URL is public by design with all protection server-side. That
is the only reason a public repo is survivable right now. The moment anyone
adds an API key, a service-account JSON, or a webhook with a secret in it, a
public repo becomes a live exposure — and Git history keeps it even after the
file is deleted.

**`.vercelignore`, not `.gitignore`, governs what is deployed** — by the CLI
and by Git deploys alike. The two files are unrelated and diverge silently.

This has already caused one production-only outage. Excluding `images/interim`
wholesale removed the **processed hero crops**, which live in that folder
alongside the AI master, and **broke the homepage hero in production while
every local test passed**. A deploy-time exclusion is invisible to anything
that reads the working tree.

Exclude the master file only, never the folder:

```
images/interim/hero-reception-master.png
```

**As of this writing that line is NOT in `.vercelignore`**, so the 1.68 MB
master PNG is being deployed. Nothing references it, so this is dead weight
rather than breakage — but it is the exclusion that was intended.

If `npx vercel --prod` appears to hang, an unexcluded `node_modules` or scratch
directory is uploading thousands of files. Current `.vercelignore` excludes
`node_modules`, `.vercel`, `scratch`, `screenshots`, `*.log`.

`scratchpad/assert-prod-assets.js` exists because of this: it loads all 46
pages **against the deployed URL** and requests every image the HTML names —
including `srcset` candidates the browser did not pick, the favicon and the
og:image — asserting 200 on each. It carries a negative control and exits
non-zero. Run it after every deploy.

---

## Lead capture — how it works and who owns it

**Every lead form POSTs to one Google Apps Script web app**, which appends a row
to a Google Sheet and emails the recipients. Both channels are independent: if
one fails the other still runs and the response reports the partial failure.

**The `/exec` URL lives in `js/rk-main.js`**, at the top, in `LEAD_WEBHOOK_URL`.
It is **public by design** — it ships in the JS bundle and is readable in
DevTools. A private repo does not protect it. All protection is server-side:
honeypot, Indian-mobile validation, a 3-second minimum fill time and length
caps. There is deliberately **no shared secret in the payload**; it would sit in
the same file and protect nothing while implying it does.

### Ownership — open item

The script is deployed under **plandleadtest@gmail.com** and bound to the
"RK Hospitals — Website Leads" Sheet. Consequences:

- Lead emails arrive **FROM that address**, not from the hospital.
- **Only that account can edit or redeploy the script**, or change the Sheet.
- **Transferring to the client is not just a settings change**: the Sheet must
  be moved into their account and the script redeployed from there, which
  produces a **new `/exec` URL** that must be pasted back into `rk-main.js`.

Recipients are in a single `RECIPIENTS` constant at the top of the script:
`gurukulsarbani@gmail.com` and `plandleadtest@gmail.com`, both on every lead.

### Redeploying — the part that catches everyone

**Editing the script code does NOT update the live URL.** You must:
`Manage deployments` → edit the active deployment → **New version** → Deploy.
Without the version bump the old code keeps serving.

### Quota

Consumer Gmail caps `MailApp` at **100 recipients per day**. Two recipients per
lead is roughly **50 leads/day**. Below 10 remaining the script still writes the
Sheet row and reports the shortfall in `warnings`, so a quota problem can never
silently lose a lead. **First emails may land in spam — tell the client to mark
them Not spam** or the front desk will not see them.

### Three things that will silently break this

1. **The honeypot field is `company`** — in the markup on all forms AND in
   `HONEYPOT_FIELD` in the script. Changing one without the other disables the
   honeypot **with no error anywhere**. It was `website` in the first draft of
   the script and would have never fired.

2. **The payload builder copies EVERY named field — there is no allowlist.**
   `js/rk-main.js`, in the submit handler, walks every `[name]` element in the
   form. A new hidden field is therefore sent automatically and needs no code
   change. It replaced a six-key allowlist. That allowlist
   silently dropped `doctor_slug` and `doctor_name` — the fields
   `rk-scoped-booking.js` injects so a lead reaches the right clinician. They
   were created and never sent, so **every doctor-scoped enquiry would have
   arrived unattributed**. If you ever reintroduce an allowlist, this bug comes
   back. Verify with a request capture, not by reading the code.

3. **The in-flight flag, not the disabled button, prevents double submission.**
   Disabling the submit button stops a second *click* only — Enter in a text
   field, or any programmatic dispatch, goes straight past it. Measured: three
   submits produced three POSTs before the flag existed, one after.

### The `email` column is empty on purpose — not a bug

**No lead form has an email input.** All five collect `name, phone, department,
preferred_date, message` plus the `company` honeypot. The Sheet's `email` column
exists and will stay blank until a form gains an email field. Anyone auditing the
Sheet should read the blank column as "not asked for", not as "data lost".
Phone is the only reply channel collected, which is what the confirmation
promises ("our desk will call you on the number you gave"). `DEFERRED.md` has
the ~6-line change if the client wants it.

### Phone must be written to a plain-text column

Google Sheets parses a leading `+` as the start of a formula, so `+919876543210`
was stored as **`#ERROR!`** — the number destroyed on the way in. This is fixed
at both levels: the phone column is formatted as plain text, **and** the script
forces that format before writing. If the column is ever reformatted, or a new
Sheet is created without it (for instance when ownership moves to the client),
**the bug comes straight back**.

It is worth understanding why nothing caught it. The append genuinely succeeded,
so the script correctly returned `{"ok":true,"sheet":true}` and the front end
correctly showed success. Every status flag in the system was accurate; the
stored value was still wrong. **No server-side check can catch this** — only
reading the cell back can. `scratchpad/assert-sheet.js` does that: run it against
a Sheet export (`File → Download → TSV`) after any write test. It carries a
negative control and exits non-zero on failure. Do **not** make it automatic by
publishing the Sheet to the web; it holds patient PII.

---

## What is not done

- **`LEAD_WEBHOOK_URL` is unset** (`js/rk-main.js`, ~line 14). Every form shows
  its guarded error state and tells the visitor to phone. **No lead is captured.**
  This is deliberate — the previous behaviour showed a fake "thank you" while
  sending nothing. Deploy the Apps Script (`apps-script/README.md`) and paste the
  `/exec` URL. This is the single thing standing between a finished form and a
  captured lead.
- **CRITICAL CSS IS ON `index.html` ONLY.** The other 45 pages load four
  blocking stylesheets. Lighthouse measures ~1,000–1,130 ms of render-blocking
  CSS on `doctor-5`, `appointment` and `timetable`, against **0 ms** on the
  homepage. This is the largest remaining performance item on the site and the
  most valuable thing the Lighthouse run produced — the homepage was the only
  page ever optimised, and it hid the state of every other page.
  `scratchpad/crit2.py` is written for `index.html` specifically; generalising
  it needs a per-template above-fold range, not a single line range.

- **A HUMAN SCREEN-READER PASS HAS NOT BEEN RUN. THIS IS OPEN.**
  What *has* been run is an **accessibility tree audit** — it reads the name,
  role and state Chrome computes for each node, with a negative control
  proving the probe detects nameless links, icon-only buttons, "click here",
  unlabelled inputs and alt-less images. It found and fixed four real defects
  (see below). Lighthouse Accessibility is 100 on all four page types.

  **None of that shows the page is comprehensible read aloud, in order, by a
  real screen reader.** A tree audit proves a name exists and is not generic.
  It cannot tell you that the reading order makes sense, that an announcement
  lands at a useful moment, or that a device like the live Open-Now card is
  helpful rather than merely correct. Those diverge exactly where this site is
  most unusual. Run NVDA or VoiceOver over: the homepage hero and Open-Now
  card, the empanelment marquee and its hidden list, a doctor page, the
  appointment form including a failed submit, and the mobile drawer.

  Fixed during the tree audit, for context on what to re-check:
  - the header emergency call link had **no accessible name at all** below
    420px — both its label and its number are `display:none` there
  - the Open-Now clock re-announced the whole card **every 30 seconds**,
    because it re-rendered inside a `role="status"` live region
  - form fields had `aria-invalid` but no `aria-describedby` — "invalid
    entry" with no reason given
  - the mobile drawer trapped focus but announced as an unnamed group
- **Analytics.** The placeholder GTM container was removed rather than shipped.
  Nothing is tracked. `dataLayer` events still fire and are ready to wire.
- Everything in `DEFERRED.md`, most urgently the **doctor identity questions**.

---

## Known trap: generator scripts and raw strings

**This build shipped the same bug twice**, in two unrelated scripts, and both
times it was silent.

1. The critical-CSS generator's replacement string was not raw, so its
   backreference never expanded. It printed **"inlined 24.2 KB"** while
   substituting **nothing at all**.
2. A site-wide regex pass wrote a literal `''` — which in a non-raw Python
   string is `chr(1)`, not a backreference. It replaced
   `<div class="row"><svg …></svg>` with a **U+0001 control character on all 45
   pages**, rendering as an empty box in the footer and on the appointment page.
   It survived weeks of review because a control character is invisible in a
   diff, in an editor, and in every automated check that reads text.

Two rules for any script that edits site files:

- **Use raw strings for every regex pattern AND every replacement.** `r''` is
  a backreference; `''` is a control character. Python warns about some
  invalid escapes and says nothing about this one.
- **Verify the output on disk, then re-read it.** Never report success from
  the fact that the script ran. `crit2.py` is the worked example: it re-opens
  `index.html` after writing, checks six properties of what it actually wrote,
  and reverts if any fail.

A standing check for the control-character class:

```
grep -Pn '[ --]' *.html css/*.css js/*.js
```

Zero matches is the only acceptable result.

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

The second lesson, learned later and more expensively: **a clean result from an
unvalidated probe says nothing.** Three separate probes in this build returned
"no problems" because they were broken, not because the site was sound — a
selector extractor that found 0 selectors and would have cleared a stylesheet
for deletion on 9 pages; a colour sampler reading mid-transition; a visibility
test using bounding boxes that counted elements 683px off-screen. Every probe
that gates a decision here now carries a **negative control**: it injects a
defect it must catch, and aborts if it does not. If you add a check, give it
one.

Two more shapes worth knowing, because both passed every test while broken:
- `.btn--ghost` was defined *above* the `.btn` base rule at equal specificity,
  so the base won and every ghost button rendered as a solid crimson primary —
  19 uses, 14 pages, the whole build.
- An edit script emptied a multi-line selector's block and left the selector
  list dangling with a trailing comma, which silently swallowed the next rule.
  `scratchpad/css-integrity.js` exists to catch that class of damage.
