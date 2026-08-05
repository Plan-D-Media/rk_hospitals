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
| `rk-theme.css` is a holding file (footer, doctor card, floating actions, breadcrumb) and should not exist at the end. | Each remaining block is owned by a later step; deleting the file early would strip live styling. | 7–8 |
| Superlatives on `index.html` only: `<title>`, `og:title`, `twitter:title` still lead with "Best Multispeciality Hospital in Barrackpore". The h1 was replaced in step 4; `landing.html`'s three were removed in step 5's prep (noindex, no search cost). | Changing index's title and OG tags is a real SEO trade on the site's primary head term. Client decision, page by page. | 10 — client decision |
| `LEAD_WEBHOOK_URL` in `js/rk-main.js` is unset, so every form shows its guarded error state and no lead is captured. | Out of the visual scope; the guarded failure is the honest behaviour until the Apps Script URL exists. | Client action, flagged at handover |
