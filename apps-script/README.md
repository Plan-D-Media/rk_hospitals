# Lead webhook — deploy guide

Every form on the site (appointment, contact, hero, blog comment) posts to **one**
Google Apps Script web app. That script appends a row to a Google Sheet and emails
the recipients. There is no PHP and no server to maintain — the site is fully static.

Total time: about 10 minutes.

---

## 1. Create the Google Sheet

1. Go to <https://sheets.new> and create a spreadsheet.
2. Name it something like `RK Hospital — Website Leads`.
3. Copy its **Sheet ID** from the URL — the long string between `/d/` and `/edit`:

   ```
   https://docs.google.com/spreadsheets/d/1AbCdEfGhIjKlMnOpQrStUvWxYz_ExampleOnly/edit
                                          └──────────── this is the SHEET_ID ────────────┘
   ```

You do **not** need to add a header row by hand. The script creates the `Leads` tab
and writes the header row on the first submission.

---

## 2. Paste the script

1. In that spreadsheet: **Extensions → Apps Script**.
2. Delete whatever is in `Code.gs`.
3. Paste the entire contents of `apps-script/Code.gs` from this repo.
4. Edit the three constants at the top:

   ```js
   const SHEET_ID = '1AbCdEfGhIjKlMnOpQrStUvWxYz_ExampleOnly';  // from step 1
   const SHEET_NAME = 'Leads';                                 // leave as-is
   const RECIPIENTS = [
     'plandleadtest@gmail.com',
     'reception@example.com'   // ← replace TODO_CLIENT_EMAIL with the client's inbox
   ];
   ```

5. Save (**Ctrl/Cmd + S**).

> Recipients with a value still starting `TODO` are skipped, so the script keeps
> working while you are waiting on the client's address.

---

## 3. Deploy as a web app

1. **Deploy → New deployment**.
2. Click the gear next to "Select type" → **Web app**.
3. Fill in:
   - **Description**: `RK lead webhook v1`
   - **Execute as**: **Me** (your Google account)
   - **Who has access**: **Anyone**
4. **Deploy**.
5. Google asks you to authorise. Choose your account → *Advanced* →
   *Go to (project name)* → **Allow**. This is normal for a script that writes to
   Sheets and sends mail as you.
6. Copy the **Web app URL**. It ends in `/exec`:

   ```
   https://script.google.com/macros/s/AKfycb.................../exec
   ```

> **"Who has access: Anyone"** is required — the browser posts to this URL with no
> Google session. It does not make your Sheet public; only this script can write to it.

---

## 4. Paste the URL into the site

Open `js/rk-main.js` and replace the placeholder near the top:

```js
const LEAD_WEBHOOK_URL = "https://script.google.com/macros/s/AKfycb.../exec";
```

That single constant drives all five forms. Until it is a real `https://` URL, the
forms show their error state and tell the user to call instead — they never silently
swallow a lead.

---

## 5. Test it

**From the Apps Script editor** — pick `testLead` in the function dropdown and click
**Run**. A row should appear in the Sheet and an email should arrive.

**From the site** — open `appointment.html`, submit the form, and confirm:

- a new row lands in the `Leads` tab,
- the recipients get `New appointment lead — Ramakrishna Multispeciality Hospital`,
- the page shows the green thank-you state.

---

## Sheet column order

The script writes the header row automatically, in this order:

| # | Column | Notes |
|---|--------|-------|
| 1 | Received At (server) | Apps Script's own timestamp |
| 2 | Timestamp (browser) | ISO string sent by the browser |
| 3 | Form Type | `appointment` · `contact` · `hero` · `comment` |
| 4 | Name | always present |
| 5 | Phone | all forms except the blog comment |
| 6 | Email | blog comment form only |
| 7 | Department | appointment / contact / hero |
| 8 | Preferred Date | appointment / contact / hero |
| 9 | Message | optional |
| 10 | Source Page | full `location.href` |
| 11 | Page Title | `document.title` |

Do not reorder or delete columns — `appendRow` writes positionally. Adding new
columns to the right is safe.

---

## Notes & gotchas

- **CORS.** The site posts `application/x-www-form-urlencoded` via `URLSearchParams`.
  That is a CORS *simple request*, so the browser sends no preflight `OPTIONS` — which
  matters, because an Apps Script web app cannot answer one. **Never** switch the
  request to `application/json`; it will start failing.
- The site uses `mode: 'no-cors'`, so the browser cannot read the response body. A
  resolved request means it reached Google; a rejected one means a genuine network
  failure, and the form shows its error state with the phone number.
- **Redeploying.** After editing the script, use **Deploy → Manage deployments →**
  (pencil) **→ Version: New version → Deploy** to keep the *same* URL. Creating a
  brand-new deployment mints a new URL and you would have to update `rk-main.js`.
- **Quota.** A consumer Gmail account can send ~100 emails/day via `MailApp`; Workspace
  accounts get ~1,500. The Sheet row is written *before* the email, so even if the mail
  quota is exhausted the lead is never lost.
- **Spam.** A hidden `company` honeypot field is checked on both the client and the
  server. Bots that fill it get a silent success and nothing is recorded.
