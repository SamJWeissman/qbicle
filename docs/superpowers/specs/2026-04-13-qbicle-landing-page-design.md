# Qbicle Landing Page — Design Spec

**Date:** 2026-04-13  
**Phase:** 1 (validation — no auth, no payments)  
**Goal:** Drive waitlist signups; capture email + zip code to validate demand and geographic clusters.

---

## Overview

A single-page marketing site for Qbicle, a residential storage-by-mail service. The page is designed to tell the full story — value prop, how it works, pricing, comparison to self-storage, FAQ — then convert visitors to waitlist signups.

---

## Visual Design

- **Color palette:** Fresh Teal + Mint (`#0D9488` primary, `#CCEDE4` accent, `#F0FAF6` background, `#1A2E2A` dark)
- **Tone:** Friendly, approachable, polished — modern consumer app feel, not corporate
- **Imagery:** Illustrations (not photography). Box-themed, friendly, clean.
- **Layout:** Nav-free scroll — no sticky navigation. The page is a top-to-bottom narrative. Works well on mobile.
- **Typography:** System font stack or a clean sans-serif (Inter-style). No decorative fonts.

---

## Page Sections (top to bottom)

### 1. Hero
- Full-viewport height
- Teal (`#0D9488`) or dark teal (`#1A2E2A`) background
- Left: logo/wordmark, headline, subheadline, primary CTA button ("Join the waitlist →" smooth-scrolls to form)
- Right: hero illustration (box with a friendly character or clean abstract box graphic)
- Supporting line: "Starting at $9/mo"

**Copy direction:**  
Headline: "Your stuff, stored. Shipped back whenever."  
Subhead: "Skip the storage unit. Ship us a box, pay monthly, get it back anytime."

### 2. How It Works
- Light mint background (`#F0FAF6`)
- 3 steps, horizontal on desktop / stacked on mobile
- Each step: small illustration + step number + label + one-line description
  1. **Choose a size** — Pick Small, Medium, or Large based on what you're storing.
  2. **Ship your stuff** — We send you a prepaid FedEx label. Box it up and drop it off.
  3. **Get it back anytime** — Request a return from your account. We ship it back to you.

### 3. Pricing Tiers
- White background
- 3 cards side-by-side (stacked on mobile)
- Each card: tier name, approximate box size, monthly price, bullet list of what fits
  - **Small** — Up to 1 cu ft — $9/mo — Books, small electronics, keepsakes
  - **Medium** — Up to 3 cu ft — $19/mo — Seasonal clothes, gear, small appliances
  - **Large** — Up to 6 cu ft — $29/mo — Sporting equipment, bulk items, bulky clothes
- Note below cards: "Inbound shipping is on us. Return shipping charged when you request a retrieval."

### 4. Why Not Self-Storage
- Teal tint background
- Two-column comparison: "Old way" (self-storage) vs "Qbicle way"
- Rows to compare:
  | | Self-Storage | Qbicle |
  |---|---|---|
  | Getting your stuff | Drive to the facility | We ship it to you |
  | Contracts | Often 3–12 months | Month-to-month |
  | Access hours | Facility hours only | Request anytime |
  | Setup | Rent a truck, haul boxes | Print a label, ship a box |
  | Price | $50–$200+/mo for a unit | From $9/mo |

### 5. FAQ
- White background
- 5–6 collapsible accordion items
- Questions:
  1. What happens to my stuff after I ship it?
  2. How do I get my things back?
  3. What can't I store?
  4. What if my box is lost or damaged in transit?
  5. Is there a minimum commitment?
  6. Which zip codes do you serve?

### 6. Waitlist Form
- Dark teal (`#1A2E2A`) background, light text — visually distinct, signals "this is the action"
- Headline: "Be the first to know when we launch in your area."
- Two fields: Email address, Zip code
- Submit button: "Join the waitlist"
- On success: inline confirmation message ("You're on the list! We'll be in touch."), no page reload
- On error: inline error message

### 7. Footer
- Dark background continuation or white
- Logo, tagline, contact email
- "© 2026 Qbicle"

---

## Tech Stack

- **Frontend:** Plain HTML (`index.html`) + CSS (`styles.css`) + minimal vanilla JS (accordion, smooth scroll, form submission)
- **Backend:** Node.js + Express (`server.js`) — serves static files, handles `POST /waitlist`
- **Waitlist storage:** Google Sheets via `googleapis` npm package
- **Hosting:** Heroku (single dyno, `Procfile`)
- **No build step** — no bundler, no transpilation

---

## Form Submission Flow

1. User fills in email + zip, clicks submit
2. Frontend sends `POST /waitlist` with JSON body `{ email, zip }`
3. Express validates: email is valid format, zip is 5 digits
4. If valid: appends a row to Google Sheet (`[timestamp, email, zip]`), returns `200 { ok: true }`
5. If invalid: returns `400 { error: "..." }`
6. Frontend shows inline success or error — no redirect

---

## Google Sheets Setup (prerequisites — user action required)

The form handler uses a Google service account to write to a spreadsheet. Before implementation can be completed:

1. User creates a Google Sheet named "Qbicle Waitlist" and copies the Sheet ID from the URL
2. User creates a Google Cloud project, enables the Sheets API, creates a service account, and downloads the JSON key
3. User shares the Sheet with the service account email (Editor access)
4. User provides:
   - `GOOGLE_SERVICE_ACCOUNT_JSON` — contents of the downloaded JSON key file
   - `GOOGLE_SHEET_ID` — the Sheet ID from the URL

These go in a local `.env` file (gitignored) and as Heroku config vars.

---

## Environment Variables

```
GOOGLE_SERVICE_ACCOUNT_JSON=<contents of service account JSON key>
GOOGLE_SHEET_ID=<sheet id from URL>
PORT=3000  # Heroku sets this automatically
```

---

## Heroku Deploy

```
Procfile: web: node server.js
```

Deploy via `git push heroku main`. No build step required.

---

## Out of Scope (Phase 1)

- User authentication
- Stripe payments
- FedEx label generation
- Account dashboard
- Admin panel
- Database (Postgres or otherwise)
- Any backend beyond the single form POST endpoint
