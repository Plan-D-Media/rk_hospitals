# Deferred items

Anything noticed during a step but correctly belonging to a later one. Nothing
gets deferred silently — it lands here before work moves on.

Cleared items are struck through and kept for one step, then removed.

| Item | Why deferred | Owning step |
|---|---|---|
| `.faq summary` uses `--font-display`, so FAQ questions render in Fraunces. The type system reserves Fraunces for `h1`/`h2`/pull-quote; h3-level UI text is Instrument Sans. | Found during the step 3 Font Awesome pass. It is an inner-page type rule, and patching it in isolation would mean touching `rk-inner.css` twice. | 8 — inner pages |
| Legacy token aliases still live in `rk-system.css` (`--magenta`, `--red`, `--neutral`, `--ink-soft`, `--r`, `--shadow*`). 51+ references remain across `rk-home.css`, `rk-home-v2.css`, `rk-inner.css`. | The shim is what keeps un-migrated components rendering during the migration. It can only be deleted once no file outside the alias block references those names. | 8 — when the last consumer migrates |
| **LCP regressed 2.48s → 3.17s** on the mobile throttle profile, caused by carrying 5 render-blocking stylesheets mid-migration where the baseline had 3. Measured directly: combining all 5 into one file returns LCP to **2.52s**. | The extra files are `rk-theme`/`rk-home`/`rk-home-v2`, which still hold live styling for un-rebuilt components. Merging them early would mean merging twice. Retiring them is already the plan and lands the fix. | 8 — then re-measure against the <2.5s gate |
| `rk-theme.css` is a holding file (footer, doctor card, floating actions, breadcrumb) and should not exist at the end. | Each remaining block is owned by a later step; deleting the file early would strip live styling. | 7–8 |
| Superlative claims ("best", "leading", "state-of-the-art" …) across titles, metas, OG tags and JSON-LD. | Swept and reported in step 4. Changes to `<title>` and meta descriptions affect search, so these are a client decision page by page, not a blanket rewrite. | 10 — content corrections |
| `LEAD_WEBHOOK_URL` in `js/rk-main.js` is unset, so every form shows its guarded error state and no lead is captured. | Out of the visual scope; the guarded failure is the honest behaviour until the Apps Script URL exists. | Client action, flagged at handover |
