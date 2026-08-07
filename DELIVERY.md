# Ramakrishna Multispeciality Hospital — Delivery Report

**Site:** https://rk-hospitals.vercel.app
**Date:** 7 August 2026

This is the plain-language summary of what has been built, what is working,
what we need from you, and what we know is imperfect. Technical detail lives in
`HANDOVER.md`; the full open-items list is in `DEFERRED.md`.

---

## 1. What is live and working

**The whole site is rebuilt and deployed.** 46 pages. No page address changed,
no factual content was removed, and nothing was invented.

- **Enquiry forms capture leads.** Every form on the site writes a row to the
  "RK Hospitals — Website Leads" Google Sheet and emails both recipients.
  Tested end to end on the live site: the homepage form, a doctor-specific
  booking, a department booking, and the contact form. Spam traps, phone
  validation and duplicate-submission protection are all working and tested.
- **The site works on a phone.** Every page checked at 320 / 360 / 390 / 414px
  wide, in portrait and landscape — 108 screen combinations, no layout breaks.
  Tested at 200% text size for visually impaired visitors.
- **Accessibility scores 100/100** on Google Lighthouse across the four page
  types we tested, as do Best Practices and SEO.
- **The site is fast.** It loads in about 2.5 seconds on a mid-range Android
  phone on a slow connection, and nothing jumps around while it loads.
- **A live "Open now" panel** on the homepage shows Barrackpore time and the
  emergency department's status, correct from anywhere in the world.
- **Doctor profiles** for eight consultants, with photographs, qualifications
  and visiting times, plus a "Book with this doctor" flow that tells the front
  desk which clinician the enquiry is for.
- **No third-party tracking.** The site loads nothing from Google, Facebook or
  any advertising network. Fonts are hosted on the site itself.

---

## 2. What we need from you — the site is waiting on these

Each of these is a factual question about a real person or a real phone number.
**We have deliberately not guessed at any of them.** Publishing a wrong fact
about a doctor is worse than publishing nothing.

### 2.1 Two names that may be the same person — **blocking a profile page**

We were sent a photograph labelled **Dr. Debosmita Dey**. The site has a
**Dr. Debosmita Roy**.

**A surname is not a spelling variant.** Either they are the same person and we
correct the site, or they are two different doctors and one is missing from the
site entirely. Until you tell us, `doctor-3` keeps the name "Debosmita Roy" and
a placeholder image.

**What we need:** one sentence — same person, or two people?

### 2.2 A photograph of an unidentified man — **cannot be published**

The file `WhatsApp Image 2026-07-31 at 15.50.21.jpeg` is a portrait with no name
anywhere in the filename or the image, and no speciality.

**What we need:** his name and department, or confirmation to discard it.

### 2.3 A medical credential nobody has verified — **appears 14 times**

The site states that **Dr. Shyan Kumar Biswas holds CCEBDM** (Certificate Course
in Evidence-Based Diabetes Management). This appears **14 times across 7 pages**,
including inside the structured data Google reads.

Nobody on this build verified where that claim came from. It was on the previous
site, so it may be perfectly correct — but a professional credential attributed
to a named doctor should be confirmed by someone who knows.

**What we need:** confirm it, or tell us to remove it. If it is withdrawn we must
remove it from the structured data as well as the visible text, or Google keeps
showing it.

Related, and smaller: the supplied filename spells his name **"Shayan"**; the
site says **"Shyan"**. We kept the site's spelling because it is already indexed.
**Which is correct?**

### 2.4 A phone number conflict — **we have changed nothing**

Your social media graphics show an appointments number of
**9007779869 / 9007733285**. The website uses **+91 82408 42519** and
**+91 87774 24002**.

We did not change a single phone number on the site. If the graphics are right,
every call-to-action on the website is sending patients to the wrong number.

**What we need:** which numbers are current?

The same graphics also contain a doctor's personal email address
(`rupshachowdhury@ymail.com`). **We have not published it.** Please confirm that
was correct.

### 2.4b Sarbani Das's title — which entity did she found?

Her photograph is now on the homepage and the About page, captioned
**"Founder, Ramakrishna Multispeciality Hospital"** — the wording your own
About page already publishes.

But the site also describes the hospital as *"a unit of Sarbani Hospitality and
HealthCare Services Pvt Ltd"*, and says elsewhere that the **company** was
founded by her. Those are two different claims and we did not reconcile them —
a title attached to a named person should come from you, not from us.

**What we need:** one line confirming the title as it should appear publicly —
founder of the hospital, of the parent company, or both.

### 2.5 Three photographs that are not clinical portraits

These publish as instructed, but on a hospital roster beside studio portraits
they undercut the doctors they show:

| Doctor | What the photograph is |
|---|---|
| Dr. Siddharth Nandi | A full-body tourist photograph at the Victoria Memorial. We cropped to head-and-shoulders, but it still reads as a holiday snap. |
| Dr. Sourav Bhagat | A café photograph in a puffer jacket, with a third person's hands in frame. |
| Dr. Atanu Ghosh | A phone selfie in an office chair. |

**What we need:** replacement photographs, or your confirmation to publish these.

### 2.6 Seven portraits are too small

Published at their real size rather than blown up, because enlarging a face
produces visible mush. They will look softer than the rest of the grid.
Target is 1000×1250.

| Doctor | Supplied | % of target |
|---|---|---|
| Dr. Milli Singh | 405×506 | 40% |
| Dr. Siddharth Nandi | 430×538 | 43% |
| Dr. Shubhadip Chakraborty | 442×552 | 44% |
| Dr. Goutam Mondal | 512×640 | 51% |
| Dr. Midul Biswas | 616×770 | 62% |
| Dr. Agniv Sarkar | 720×900 | 72% |
| Dr. Vivesh Kumar Singh | 819×1024 | 82% |

**What we need:** the original, larger files if they exist.

**The honest recommendation:** the roster does not look like one set. The
photographs range from studio-on-white to outdoor social shots, and no amount of
editing fixes that — it is a difference in how they were taken, not how they were
processed. **One re-shoot session** — one background, one lens, one lighting
setup, an hour of everyone's time — would do more for how the hospital looks
online than anything else on this list. The brief is written up in
`IMAGE-BRIEF.md`.

### 2.7 Dr. Aniket Sarkar has no photograph at all

Currently shows a placeholder. **What we need:** a photograph.

---

## 3. Decisions we made that you should know about

These were judgement calls. Each is reversible; tell us if you disagree.

1. **"Book Appointment" never claims to reserve a slot.** The button says
   *Request appointment*, and the confirmation says plainly that it is an
   enquiry and your desk will call to agree a time. A patient who believes they
   hold an appointment and turns up is a real harm.
2. **No prices are invented.** Where we had no figure, the page says
   *"Price on request"* rather than showing a dash.
3. **Patient testimonials were removed, not faked.** There were none we could
   verify. The slot is ready for a Google Reviews embed.
4. **No founder quotation.** The About section carries an unattributed statement
   of intent. Putting website copy inside quote marks against Sarbani Das would
   have been a claim about something she said. Send us a real quote and it drops
   straight in.
5. **The blog comment form was removed.** There was no system behind it — no
   storage, no moderation, nobody notified — but it told visitors *"our team
   will read it and reply by email."* That promise could not be kept. The page
   now points to the phone number and contact page instead.
6. **"Best Multispeciality Hospital in Barrackpore" is still in the homepage
   title.** It is a superlative we cannot substantiate, but it is also your
   main search term and removing it has a real SEO cost. **Your call.**

---

## 4. Known risks — stated plainly

### 4.1 The website address still points at your old site — **decide before launch**

45 pages tell Google that the authoritative version of each page lives at
**rkhospitals.in**. That address currently serves your **existing WordPress
site**, which is still live and is a different website.

**While both are up, this is actively harmful**: the new site is telling Google
"don't index me, index the other one." Social media previews are affected too —
the sharing image points at a file that does not exist on the old site, so
sharing a link shows a broken image.

This is correct *if* the plan is to switch rkhospitals.in over to the new site.
It is wrong if the two are meant to coexist. **We have deliberately not changed
it**, because guessing wrong in either direction is costly.

**What we need:** confirm the plan — switch rkhospitals.in to the new site, or
keep them separate (in which case we change the settings).

### 4.1b The appointment page had a reduced-scope pass

Three things were fixed on the site's highest-intent page: the enquiry form now
sits in a raised white card so it reads as finished; the "Why book with us"
panel opens on the 24×7 emergency line instead of an email address; and the two
identical dark blue blocks were differentiated so the emergency route no longer
looks like a duplicate of the booking one.

**Not done:** a full rework of the page's background rhythm. It was deliberately
left rather than changed unverified on delivery day. Cosmetic only — nothing on
the page is broken.

### 4.2 Page speed is marginally under target

The homepage loads its main image in about **2.55 seconds** on a mid-range
Android phone on a slow connection. The industry target is 2.5 seconds. We are
**0.05 seconds over**.

We could close it by reducing the quality of the hero photograph. **We chose not
to** — a hospital interior and a doctor's face are the wrong place to trade
visible quality for a twentieth of a second.

The larger, real gap: the speed optimisation was applied to the **homepage
only**. Inner pages are roughly a second slower to start displaying. This is
fixable and is the single biggest remaining performance improvement.

### 4.3 No screen-reader testing has been done by a human

The site passes every automated accessibility check we can run — Lighthouse
scores 100, every button and link has a proper description, the emergency number
is announced correctly, the menu behaves as a proper dialogue.

**Automated checks cannot tell you whether a page makes sense when read aloud,
in order, by a blind visitor.** They confirm the labels exist; they cannot
confirm the experience is coherent. For a hospital site this matters more than
most. We recommend one session with NVDA or VoiceOver before you consider
accessibility signed off.

### 4.4 The homepage hero photograph is not your hospital

The main homepage image is **AI-generated** — it depicts a hospital that does not
exist. It was a placeholder while we waited for photography.

**This should not remain in place long.** A photograph of a building that is not
yours, on the front page of your hospital's website, is the kind of thing that is
embarrassing when noticed. `IMAGE-BRIEF.md` lists exactly what to shoot.

### 4.5 Lead capture depends on a personal Google account

The system that receives your enquiries is currently running under
**plandleadtest@gmail.com** — our test account.

- Lead emails arrive **from that address**, not from the hospital.
- **Only that account can change it.**
- Google's free tier allows **100 emails per day**, which at two recipients per
  lead is about **50 enquiries per day**. Beyond that, the enquiry is still saved
  to the Sheet and the failure is flagged, so nothing is lost.

**Before this is properly yours**, the spreadsheet needs to move to a hospital
Google account and the system needs redeploying from there.

**Also:** the first few emails may land in **spam**. Please mark them *Not spam*,
or your front desk will not see them.

### 4.6 The code repository is public

This was necessary to get the site deploying at all on the free hosting plan.
Nothing sensitive is in it today — we verified that no passwords, keys or
credentials are stored.

**This must be resolved before anyone adds any password or key to the project**,
because once something is committed it stays in the history even after deletion.
The permanent fix is a paid hosting plan or a change to the account settings.

### 4.7 No analytics

Nothing is currently measuring visitors. The site is ready for Google Analytics
whenever you want it; we removed the placeholder rather than ship a broken one.

---

## 5. Deferred, with owner

| Item | Why it waits | Owner |
|---|---|---|
| Speed optimisation for the 45 inner pages | Needs a per-page rewrite of the technique used on the homepage | Development |
| Human screen-reader session | Cannot be automated | Development + a real user |
| Optional email field on the contact forms | ~6 lines; the spreadsheet column already exists. Not done on delivery day — phone is the reply channel the confirmation promises | Client decision |
| Google Analytics | Ready to connect | Client |
| Google Reviews embed | Slot reserved on the homepage | Client |
| Replacing the AI homepage hero | Needs photography | Client |
| Moving lead capture to a hospital Google account | Needs a hospital account | Client |
| Blog comments | Removed. Needs a real backend before it returns | Client decision |

---

## 6. What we would do next, in order

1. **Answer the doctor questions** in section 2 — they block real pages.
2. **Decide the rkhospitals.in question** in 4.1 — it affects whether Google
   indexes the new site at all.
3. **Confirm the phone numbers** in 2.4 — every call button depends on it.
4. **Photograph the hospital and re-shoot the doctors** — the largest single
   improvement available.
5. **Move lead capture to a hospital account.**
6. **Speed work on inner pages**, then the screen-reader session.
