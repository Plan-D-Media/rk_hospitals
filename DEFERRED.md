
# Deferred items

Anything noticed during a step but correctly belonging to a later one. Nothing
gets deferred silently — it lands here before work moves on.

Cleared items are struck through and kept for one step, then removed.

| Item | Why deferred | Owning step |
|---|---|---|
| `.faq summary` uses `--font-display`, so FAQ questions render in Fraunces. The type system reserves Fraunces for `h1`/`h2`/pull-quote; h3-level UI text is Instrument Sans. | Found during the step 3 Font Awesome pass. It is an inner-page type rule, and patching it in isolation would mean touching `rk-inner.css` twice. | 8 — inner pages |
| Legacy token aliases still live in `rk-system.css` (`--magenta`, `--red`, `--neutral`, `--ink-soft`, `--r`, `--shadow*`). 51+ references remain across `rk-home.css`, `rk-home-v2.css`, `rk-inner.css`. | The shim is what keeps un-migrated components rendering during the migration. It can only be deleted once no file outside the alias block references those names. | 8 — when the last consumer migrates |
| **Critical-CSS inlining is the remaining LCP fix.** Measured at 9 runs: self-hosted fonts + 5 stylesheets = 2.98s; combined to 1 file = 2.90s (within noise); **critical layer inlined + legacy deferred = 2.44s**, which passes the <2.5s gate. | Inlining a 28 KB block that step 8 will rewrite is churn, and the block must be regenerated whenever the system layer changes. Best applied once the stylesheet set is final. | 8 — implement and re-measure |
| Legacy CSS cascade: 69 runtime-verified overrides where `rk-theme`/`rk-home`/`rk-home-v2` beat the new system layer. The homepage-section ones (`.home .coe-tile`, `.home .doc-card`, `.home .why-card`, `.home main > .section`, `.home .section-head h2/p`, `.home .eyebrow`, `.appt-card .form-row`, `.emg-band *`, `.pkg-card.is-featured`) all target sections step 5 rebuilds. | Retiring them piecemeal risks missing one. They die as each section is rebuilt in step 5, which should leave `rk-home.css`/`rk-home-v2.css` empty apart from the `.lp-*` landing rules. | 5 (homepage rules) / 8 (remainder) |
| Competing crimson on inner pages, found by the L2 scan: `.side-card.is-magenta` (pricing-1, faqs, doctor-1, timetable) and `.side-card.is-emg` (single-post, service-1) are crimson-filled sidebar cards; `.filter-btn.active` (all-doctors) is a crimson fill. All now sit in the same viewport as the header's crimson CTA. | The filled *cards* are arguably the allowed 'crimson field' case, but `.filter-btn.active` is a true second fill. Both live in `rk-inner.css`, which step 8 rebuilds. | 8 — inner pages |
| The about section carries an unattributed statement of intent where a founder pull-quote was planned. The words are the hospital-s own site copy; attributing them to Sarbani Das in quote marks would have been a claim about something she said that nothing on record supports. | A real, verified quote from the founder can replace it verbatim — same slot, same styling, plus a <cite>. Needs the client to supply and confirm the wording. | Client content — any step |
| **Client verification required:** `department-endocrinology.html` states that Dr. Shyan Kumar Biswas holds **CCEBDM** (a certificate course in evidence-based diabetes management), in both the visible FAQ and the `FAQPage` JSON-LD. It appears **14 times across 7 files** (doctor-2 x5, department-general-medicine x3, department-endocrinology x2, and once each on all-doctors, index, landing, timetable), including inside FAQPage JSON-LD — so if it is withdrawn it must come out of the structured data too, not just the visible copy. | It is a factual claim about a named person and nobody in this build has verified its source. Same family as the invented-attribution issue, lower severity — a credential is at least checkable, where a quotation was not. Not for the build to act on: the client confirms it or it comes out of both the copy and the schema. | Client action — handover |
| **`Dr. Aniket Sarkar` (`doctor-4`) has no photograph supplied.** | Falls back to the 4:5 placeholder, which is verified legible (8.78:1). | Client — supply photo |
| **Four portraits are too small to publish without upscaling.** Native vs the 1000×1250 minimum: `Dr-Debosmita-Dey` **276×354**, `Dr. Mili Singh` **405×522**, `Dr. Subhadip Chakraborty` **442×850**, `Dr. Goutam Mondal` **640×640**. Marginal: `Dr-Midul-biswas` 768×770, `Dr. Agniv Sarkar` 720×1280. | Interpolating a face produces visible mush on a portrait card. Re-shoot or supply originals. | Client — larger files |
| **`WhatsApp Image 2026-07-31 at 15.50.21.jpeg`** — a portrait of a man with no name anywhere in the filename or the image. | Cannot be published against any name. | Client — identify or withdraw |
| **Post graphics contain data that contradicts the site**: an appointments number `9007779869 / 9007733285` against the site's `+91 82408 42519` / `+91 87774 24002`; a doctor's personal email `rupshachowdhury@ymail.com`; WBMC registration numbers; and per-doctor visiting hours. | No `tel:` link was changed, no email published, and `RK_HOURS` was not touched — those are per-doctor visiting hours, not hospital OPD hours. | Client — confirm which number is correct |
| **PHOTO QUALITY — re-supply recommended.** Three supplied photographs are not clinical portraits: **Dr. Siddharth Nandi** is a full-body tourist photo at the Victoria Memorial (face ~100x130px in a 1200x1600 frame; re-cropped to 430x538 head-and-shoulders so the card shows a person, but it still reads as a holiday photo); **Dr. Sourav Bhagat** is a cafe photo in a puffer jacket with a third party's hands in frame; **Dr. Atanu Ghosh** is a phone selfie in an office chair. | The client ruling answered the IDENTITY question, not the fitness-for-purpose one. These publish as instructed, but on a hospital roster beside studio portraits they undercut the clinicians they depict. | Client — re-supply |
| **Seven portraits are below the 1000x1250 minimum** and will read visibly softer than the rest of the grid. Published at native resolution rather than upscaled: Milli Singh **405x506** (40% of target width), Siddharth Nandi **430x538** (43%), Shubhadip Chakraborty **442x552** (44%), Goutam Mondal **512x640** (51%), Midul Biswas **616x770** (62%), Agniv Sarkar **720x900** (72%), Vivesh Kumar Singh **819x1024** (82%). | A soft photo of the right person beats a grey box, but interpolating a face produces visible mush. | Client — larger originals |
| **The roster set is visually inconsistent** and no exposure adjustment fixes it. Measured brightness spans 129 to 221 (range 92), but the mismatch is structural, not tonal: studio-on-white (Shubhadip, Goutam), clinical-with-stethoscope (Rupsha, Agniv, Atanu), plain-indoor casual (Vivesh, Milli, Midul), and outdoor/social (Sourav, Siddharth, Shyan against a blue door). Normalising exposure would alter how individuals look without making the set cohere. | A single re-shoot session -- one background, one focal length, one lighting setup -- is the only real fix. Recorded in IMAGE-BRIEF.md as the Portrait set brief. | Client — re-shoot |
| **`Dr-Debosmita-Dey` still blocked.** Is she the same person as the site's Dr. Debosmita Roy, or a second doctor? doctor-3 keeps the name "Debosmita Roy" and its placeholder until answered. | A surname is not a spelling variant. Publishing a face against the wrong surname is a factual error about a named clinician. | Client — one answer |
| **`Dr-Shayan-Kumar-Biswas` published as "Shyan Kumar Biswas"** on doctor-2, per the source-of-truth rule that the already-published site spelling wins. The supplied filename spells it "Shayan". | Both spellings cannot be right. The site's is indexed; the client's filename may be the correction. | Client — confirm spelling |
| **`WhatsApp Image 2026-07-31 at 15.50.21.jpeg` remains unpublished** — a portrait of a man with no name anywhere. | Cannot be published against any name. | Client — identify or withdraw |
| `rk-theme.css` is a holding file (footer, doctor card, floating actions, breadcrumb) and should not exist at the end. | Each remaining block is owned by a later step; deleting the file early would strip live styling. | 7–8 |
| Superlatives on `index.html` only: `<title>`, `og:title`, `twitter:title` still lead with "Best Multispeciality Hospital in Barrackpore". The h1 was replaced in step 4; `landing.html`'s three were removed in step 5's prep (noindex, no search cost). | Changing index's title and OG tags is a real SEO trade on the site's primary head term. Client decision, page by page. | 10 — client decision |
| `LEAD_WEBHOOK_URL` in `js/rk-main.js` is unset, so every form shows its guarded error state and no lead is captured. | Out of the visual scope; the guarded failure is the honest behaviour until the Apps Script URL exists. | Client action, flagged at handover |

## Blog comments — removed, re-enableable

The comment form on `single-post.html` was **removed** (commit in the lead-capture
workstream). It is not deferred work; it is a deliberate deletion with a route back.

**Why.** There is no comment backend, no storage and no moderation, so its
confirmation — *"Our team reads every comment. If you have asked a question, we
will reply by email"* — was a promise nothing could keep. That is the same fake
confirmation the appointment flow was rebuilt to remove. Separately, it carried
`data-lead-form="comment"`, so the moment the leads webhook went live it would
have written blog comments into the hospital's lead Sheet and emailed the front
desk for every one.

**What replaced it.** A short honest block pointing at the two routes that do
work: the 24×7 number and the contact page.

**To re-enable**, all three are required — not just the markup:
1. A comment backend that actually stores and moderates. The Apps Script leads
   webhook is not it; do not point comments at `LEAD_WEBHOOK_URL`.
2. Restore the form markup from git history (`single-post.html`, before the
   lead-capture workstream). It had name, email and message plus the `company`
   honeypot.
3. Remove `"comment"` from `NON_LEAD_FORMS` in `js/rk-main.js` — the handler
   refuses to submit it while that entry is present. That guard is the second
   line of defence, deliberately kept even though the markup is gone.

Only re-enable if someone has committed to reading and replying. A comment form
nobody reads is worse than none.

## Optional email field on the contact forms — ~6 lines, column already exists

The Sheet has an `email` column and it is **intentionally blank**. No lead form
collects an email address: all five collect `name, phone, department,
preferred_date, message` plus the `company` honeypot. The only email input on
the site was on the blog comment form, which has been removed.

This is not a bug and should not be "fixed" by anyone reading the Sheet and
assuming data is being lost. Nothing is lost; nothing is being asked for.

**To add it** (deliberately not done before delivery — it changes the primary
conversion form):
1. Add one `.field` block with `<label for="cf-email">` and
   `<input id="cf-email" name="email" type="email" autocomplete="email">` to
   `contacts-1.html` and `contacts-2.html`. Roughly 6 lines each.
2. Nothing else. The payload builder in `js/rk-main.js` copies **every**
   `[name]` element in the form, so a new field is sent automatically, and the
   script already maps `email` to its column.
3. Leave it **optional**. Phone is the channel the confirmation promises
   ("our desk will call you on the number you gave"); making email required
   would contradict that and cost completions.

Deliberately NOT added to the appointment or hero forms: those are the primary
conversion path and every extra field costs completions.
