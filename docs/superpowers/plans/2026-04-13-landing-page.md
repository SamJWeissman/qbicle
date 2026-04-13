# Qbicle Landing Page — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build and deploy a full Qbicle waitlist landing page — nav-free scroll, teal/mint palette, illustration-driven — backed by an Express server that writes signups to Google Sheets.

**Architecture:** Static HTML/CSS/JS served by Express. A single `POST /waitlist` endpoint validates submissions and appends rows to a Google Sheet via service account credentials. No build step. Deploys to Heroku via `git push heroku main`.

**Tech Stack:** Node.js 18+, Express 4, googleapis, dotenv, Jest + supertest (tests only)

---

## File Map

| File | Responsibility |
|------|---------------|
| `package.json` | Dependencies, npm scripts, engines |
| `Procfile` | Heroku process declaration |
| `.env.example` | Template showing required env vars |
| `server.js` | Express app: serves static files + `POST /waitlist` |
| `sheets.js` | Google Sheets module: appends a row via service account |
| `public/index.html` | Complete single-page marketing site |
| `public/styles.css` | All styles — teal/mint palette, responsive |
| `public/app.js` | Form AJAX submission |
| `tests/server.test.js` | Supertest: endpoint validation + Sheets integration |
| `tests/sheets.test.js` | Unit: sheets module calls correct API |

---

## Task 1: Project scaffold

**Files:**
- Create: `package.json`
- Create: `Procfile`
- Create: `.env.example`

- [ ] **Step 1: Create `package.json`**

```json
{
  "name": "qbicle",
  "version": "1.0.0",
  "description": "Qbicle landing page",
  "main": "server.js",
  "engines": {
    "node": ">=18.0.0"
  },
  "scripts": {
    "start": "node server.js",
    "dev": "node server.js",
    "test": "jest --forceExit"
  },
  "dependencies": {
    "dotenv": "^16.4.5",
    "express": "^4.19.2",
    "googleapis": "^140.0.1"
  },
  "devDependencies": {
    "jest": "^29.7.0",
    "supertest": "^7.0.0"
  }
}
```

- [ ] **Step 2: Create `Procfile`**

```
web: node server.js
```

- [ ] **Step 3: Create `.env.example`**

```
GOOGLE_SERVICE_ACCOUNT_JSON={"type":"service_account",...}
GOOGLE_SHEET_ID=your-sheet-id-from-url
PORT=3000
```

- [ ] **Step 4: Install dependencies**

```bash
npm install
```

Expected: `node_modules/` created, no errors.

- [ ] **Step 5: Commit**

```bash
git add package.json package-lock.json Procfile .env.example
git commit -m "feat: project scaffold — express, googleapis, jest"
```

---

## Task 2: Express server + static file serving

**Files:**
- Create: `server.js`
- Create: `public/index.html` (placeholder only — full HTML comes in Task 5)
- Create: `tests/server.test.js` (GET / test only — POST tests in Task 3)

- [ ] **Step 1: Create placeholder `public/index.html`**

```html
<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"><title>Qbicle</title></head>
<body><h1>Qbicle</h1></body>
</html>
```

- [ ] **Step 2: Write the failing test for GET /**

Create `tests/server.test.js`:

```javascript
const request = require('supertest');

jest.mock('../sheets', () => ({
  appendWaitlistEntry: jest.fn().mockResolvedValue(undefined),
}));

const app = require('../server');

describe('GET /', () => {
  test('serves the landing page with 200', async () => {
    const res = await request(app).get('/');
    expect(res.status).toBe(200);
    expect(res.headers['content-type']).toMatch(/html/);
  });
});
```

- [ ] **Step 3: Run test to confirm it fails**

```bash
npx jest tests/server.test.js --forceExit
```

Expected: FAIL — `Cannot find module '../server'`

- [ ] **Step 4: Create `server.js`**

```javascript
require('dotenv').config();
const express = require('express');
const path = require('path');
const { appendWaitlistEntry } = require('./sheets');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

app.post('/waitlist', async (req, res) => {
  const { email, zip } = req.body || {};

  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return res.status(400).json({ error: 'Please enter a valid email address.' });
  }
  if (!zip || !/^\d{5}$/.test(zip)) {
    return res.status(400).json({ error: 'Please enter a valid 5-digit zip code.' });
  }

  try {
    await appendWaitlistEntry(email, zip);
    return res.json({ ok: true });
  } catch (err) {
    console.error('Sheets error:', err.message);
    return res.status(500).json({ error: 'Something went wrong. Please try again.' });
  }
});

if (require.main === module) {
  app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
}

module.exports = app;
```

- [ ] **Step 5: Create stub `sheets.js`** (real implementation in Task 4)

```javascript
async function appendWaitlistEntry(email, zip) {
  throw new Error('sheets.js not yet implemented');
}

module.exports = { appendWaitlistEntry };
```

- [ ] **Step 6: Run test to confirm it passes**

```bash
npx jest tests/server.test.js --forceExit
```

Expected: PASS — `GET / serves the landing page with 200`

- [ ] **Step 7: Smoke test locally**

```bash
npm run dev
```

Open http://localhost:3000 — should see "Qbicle" heading. Ctrl+C to stop.

- [ ] **Step 8: Commit**

```bash
git add server.js sheets.js public/index.html tests/server.test.js
git commit -m "feat: express server with static file serving"
```

---

## Task 3: POST /waitlist — validation tests

**Files:**
- Modify: `tests/server.test.js` — add POST /waitlist describe block

- [ ] **Step 1: Add POST /waitlist tests**

Append to `tests/server.test.js` (after the `GET /` describe block):

```javascript
const { appendWaitlistEntry } = require('../sheets');

describe('POST /waitlist', () => {
  beforeEach(() => {
    appendWaitlistEntry.mockClear();
  });

  test('200 with valid email and zip', async () => {
    const res = await request(app)
      .post('/waitlist')
      .send({ email: 'test@example.com', zip: '10001' });
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ ok: true });
    expect(appendWaitlistEntry).toHaveBeenCalledWith('test@example.com', '10001');
  });

  test('400 for missing email', async () => {
    const res = await request(app).post('/waitlist').send({ zip: '10001' });
    expect(res.status).toBe(400);
    expect(res.body.error).toMatch(/email/i);
  });

  test('400 for invalid email format', async () => {
    const res = await request(app)
      .post('/waitlist')
      .send({ email: 'notanemail', zip: '10001' });
    expect(res.status).toBe(400);
    expect(res.body.error).toMatch(/email/i);
  });

  test('400 for missing zip', async () => {
    const res = await request(app)
      .post('/waitlist')
      .send({ email: 'test@example.com' });
    expect(res.status).toBe(400);
    expect(res.body.error).toMatch(/zip/i);
  });

  test('400 for 4-digit zip', async () => {
    const res = await request(app)
      .post('/waitlist')
      .send({ email: 'test@example.com', zip: '1234' });
    expect(res.status).toBe(400);
    expect(res.body.error).toMatch(/zip/i);
  });

  test('400 for alphabetic zip', async () => {
    const res = await request(app)
      .post('/waitlist')
      .send({ email: 'test@example.com', zip: 'abcde' });
    expect(res.status).toBe(400);
    expect(res.body.error).toMatch(/zip/i);
  });

  test('500 when sheets throws', async () => {
    appendWaitlistEntry.mockRejectedValueOnce(new Error('API error'));
    const res = await request(app)
      .post('/waitlist')
      .send({ email: 'test@example.com', zip: '10001' });
    expect(res.status).toBe(500);
    expect(res.body.error).toBeTruthy();
  });
});
```

- [ ] **Step 2: Run all tests**

```bash
npx jest tests/server.test.js --forceExit
```

Expected: all 8 tests PASS (validation is already in server.js from Task 2)

- [ ] **Step 3: Commit**

```bash
git add tests/server.test.js
git commit -m "test: POST /waitlist validation and error handling"
```

---

## Task 4: Google Sheets module

**Files:**
- Modify: `sheets.js` — replace stub with real implementation
- Create: `tests/sheets.test.js`

- [ ] **Step 1: Write the failing test**

Create `tests/sheets.test.js`:

```javascript
jest.mock('googleapis', () => {
  const mockAppend = jest.fn().mockResolvedValue({});
  return {
    google: {
      auth: {
        GoogleAuth: jest.fn().mockImplementation(() => ({})),
      },
      sheets: jest.fn().mockReturnValue({
        spreadsheets: {
          values: {
            append: mockAppend,
          },
        },
      }),
      _mockAppend: mockAppend,
    },
  };
});

const { google } = require('googleapis');
const { appendWaitlistEntry } = require('../sheets');

beforeEach(() => {
  process.env.GOOGLE_SERVICE_ACCOUNT_JSON = JSON.stringify({
    type: 'service_account',
    client_email: 'test@proj.iam.gserviceaccount.com',
    private_key: 'fake-key',
  });
  process.env.GOOGLE_SHEET_ID = 'test-sheet-id-123';
  google._mockAppend.mockClear();
  google.sheets.mockClear();
  google.auth.GoogleAuth.mockClear();
});

test('initializes GoogleAuth with parsed credentials and sheets scope', async () => {
  await appendWaitlistEntry('test@example.com', '10001');
  expect(google.auth.GoogleAuth).toHaveBeenCalledWith(
    expect.objectContaining({
      credentials: expect.objectContaining({ type: 'service_account' }),
      scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    })
  );
});

test('calls spreadsheets.values.append with correct spreadsheet ID and range', async () => {
  await appendWaitlistEntry('hello@example.com', '90210');
  expect(google._mockAppend).toHaveBeenCalledWith(
    expect.objectContaining({
      spreadsheetId: 'test-sheet-id-123',
      range: 'Sheet1!A:C',
      valueInputOption: 'RAW',
    })
  );
});

test('row values include email and zip as second and third columns', async () => {
  await appendWaitlistEntry('user@test.com', '33101');
  const call = google._mockAppend.mock.calls[0][0];
  const row = call.requestBody.values[0];
  expect(row[1]).toBe('user@test.com');
  expect(row[2]).toBe('33101');
});

test('first column is an ISO timestamp string', async () => {
  await appendWaitlistEntry('ts@example.com', '10001');
  const call = google._mockAppend.mock.calls[0][0];
  const timestamp = call.requestBody.values[0][0];
  expect(new Date(timestamp).toString()).not.toBe('Invalid Date');
});
```

- [ ] **Step 2: Run test to confirm it fails**

```bash
npx jest tests/sheets.test.js --forceExit
```

Expected: FAIL — tests error because `appendWaitlistEntry` throws `'not yet implemented'`

- [ ] **Step 3: Implement `sheets.js`**

Replace the entire contents of `sheets.js`:

```javascript
const { google } = require('googleapis');

async function appendWaitlistEntry(email, zip) {
  const credentials = JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT_JSON);
  const spreadsheetId = process.env.GOOGLE_SHEET_ID;

  const auth = new google.auth.GoogleAuth({
    credentials,
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });

  const sheets = google.sheets({ version: 'v4', auth });

  await sheets.spreadsheets.values.append({
    spreadsheetId,
    range: 'Sheet1!A:C',
    valueInputOption: 'RAW',
    requestBody: {
      values: [[new Date().toISOString(), email, zip]],
    },
  });
}

module.exports = { appendWaitlistEntry };
```

- [ ] **Step 4: Run all tests**

```bash
npx jest --forceExit
```

Expected: all 12 tests PASS

- [ ] **Step 5: Commit**

```bash
git add sheets.js tests/sheets.test.js
git commit -m "feat: google sheets waitlist integration"
```

---

## Task 5: HTML — complete landing page

**Files:**
- Modify: `public/index.html` — replace placeholder with full page

- [ ] **Step 1: Replace `public/index.html` with the complete page**

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="description" content="Qbicle — residential storage by mail. Ship us a box, pay monthly, get it back anytime. Starting at $9/mo.">
  <title>Qbicle — Storage by Mail</title>
  <link rel="stylesheet" href="styles.css">
</head>
<body>

  <!-- ── Hero ────────────────────────────────────────────────── -->
  <section class="hero">
    <div class="hero-inner">
      <div class="hero-content">
        <div class="logo">Qbicle</div>
        <h1>Your stuff, stored.<br>Shipped back whenever.</h1>
        <p class="hero-sub">Skip the storage unit. Ship us a box, pay monthly, get it back anytime.</p>
        <a href="#waitlist" class="btn-primary">Join the waitlist →</a>
        <p class="hero-price">Starting at $9/mo · No contracts</p>
      </div>
      <div class="hero-illustration" aria-hidden="true">
        <svg viewBox="0 0 320 260" fill="none" xmlns="http://www.w3.org/2000/svg">
          <ellipse cx="160" cy="250" rx="90" ry="10" fill="rgba(0,0,0,0.1)"/>
          <rect x="55" y="115" width="210" height="130" rx="10" fill="#CCEDE4"/>
          <path d="M210 115 L265 115 L265 245 L210 245 Z" fill="#aed4c9" clip-path="url(#box-clip)"/>
          <clipPath id="box-clip">
            <rect x="55" y="115" width="210" height="130" rx="10"/>
          </clipPath>
          <rect x="148" y="115" width="24" height="130" fill="rgba(255,255,255,0.2)"/>
          <path d="M55 115 L160 78 L265 115 Z" fill="#0b8177"/>
          <path d="M55 115 L160 135 L265 115 L160 78 Z" fill="#0D9488"/>
          <line x1="55" y1="115" x2="265" y2="115" stroke="rgba(255,255,255,0.2)" stroke-width="1"/>
          <circle cx="292" cy="85" r="7" fill="#CCEDE4" opacity="0.45"/>
          <circle cx="30" cy="155" r="5" fill="#CCEDE4" opacity="0.35"/>
          <circle cx="285" cy="205" r="4" fill="#CCEDE4" opacity="0.3"/>
          <circle cx="48" cy="230" r="3" fill="#CCEDE4" opacity="0.3"/>
        </svg>
      </div>
    </div>
  </section>

  <!-- ── How it works ─────────────────────────────────────────── -->
  <section class="how-it-works">
    <div class="container">
      <h2>Three steps. Zero trips.</h2>
      <div class="steps">

        <div class="step">
          <div class="step-icon" aria-hidden="true">
            <svg viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg">
              <rect x="4" y="52" width="18" height="22" rx="3" fill="#CCEDE4"/>
              <path d="M4 52 L13 44 L22 52 Z" fill="#0D9488"/>
              <rect x="28" y="40" width="24" height="34" rx="3" fill="#CCEDE4"/>
              <path d="M28 40 L40 30 L52 40 Z" fill="#0D9488"/>
              <rect x="57" y="28" width="20" height="46" rx="3" fill="#CCEDE4"/>
              <path d="M57 28 L67 19 L77 28 Z" fill="#0D9488"/>
            </svg>
          </div>
          <div class="step-num">1</div>
          <h3>Choose a size</h3>
          <p>Pick Small, Medium, or Large based on what you're storing. Month-to-month, no commitment.</p>
        </div>

        <div class="step-arrow" aria-hidden="true">→</div>

        <div class="step">
          <div class="step-icon" aria-hidden="true">
            <svg viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg">
              <rect x="8" y="28" width="44" height="38" rx="6" fill="#CCEDE4"/>
              <path d="M8 28 L30 17 L52 28 Z" fill="#0D9488"/>
              <rect x="16" y="40" width="28" height="18" rx="2" fill="white" opacity="0.8"/>
              <line x1="20" y1="47" x2="40" y2="47" stroke="#0D9488" stroke-width="1.5" stroke-linecap="round"/>
              <line x1="20" y1="52" x2="36" y2="52" stroke="#0D9488" stroke-width="1.5" stroke-linecap="round"/>
              <path d="M58 47 L72 47" stroke="#0D9488" stroke-width="2.5" stroke-linecap="round"/>
              <path d="M67 41 L73 47 L67 53" stroke="#0D9488" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </div>
          <div class="step-num">2</div>
          <h3>Ship your stuff</h3>
          <p>We send you a prepaid FedEx label. Box it up and drop it off at any FedEx location.</p>
        </div>

        <div class="step-arrow" aria-hidden="true">→</div>

        <div class="step">
          <div class="step-icon" aria-hidden="true">
            <svg viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg">
              <rect x="18" y="28" width="44" height="38" rx="6" fill="#CCEDE4"/>
              <path d="M18 28 L40 17 L62 28 Z" fill="#0D9488"/>
              <path d="M14 44 C6 44 4 36 4 30 C4 22 10 16 18 16 L26 16" stroke="#0D9488" stroke-width="2.5" stroke-linecap="round" fill="none"/>
              <path d="M22 11 L27 16 L22 21" stroke="#0D9488" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" fill="none"/>
            </svg>
          </div>
          <div class="step-num">3</div>
          <h3>Get it back anytime</h3>
          <p>Request a return from your account. We ship it back to you — no trip to a facility required.</p>
        </div>

      </div>
    </div>
  </section>

  <!-- ── Pricing ───────────────────────────────────────────────── -->
  <section class="pricing">
    <div class="container">
      <h2>Simple, month-to-month pricing</h2>
      <p class="section-sub">No contracts. No hidden fees. Cancel anytime.</p>
      <div class="pricing-cards">

        <div class="pricing-card">
          <h3>Small</h3>
          <p class="box-size">Up to 1 cu ft</p>
          <p class="price">$9<span>/mo</span></p>
          <ul>
            <li>Books &amp; paperwork</li>
            <li>Small electronics</li>
            <li>Keepsakes &amp; memorabilia</li>
          </ul>
          <a href="#waitlist" class="btn-secondary">Join waitlist</a>
        </div>

        <div class="pricing-card featured">
          <div class="badge">Most popular</div>
          <h3>Medium</h3>
          <p class="box-size">Up to 3 cu ft</p>
          <p class="price">$19<span>/mo</span></p>
          <ul>
            <li>Seasonal clothes</li>
            <li>Gear &amp; accessories</li>
            <li>Small appliances</li>
          </ul>
          <a href="#waitlist" class="btn-primary">Join waitlist</a>
        </div>

        <div class="pricing-card">
          <h3>Large</h3>
          <p class="box-size">Up to 6 cu ft</p>
          <p class="price">$29<span>/mo</span></p>
          <ul>
            <li>Sporting equipment</li>
            <li>Bulk items</li>
            <li>Bulky clothes &amp; linens</li>
          </ul>
          <a href="#waitlist" class="btn-secondary">Join waitlist</a>
        </div>

      </div>
      <p class="pricing-note">Inbound shipping is on us. Return shipping is charged when you request a retrieval.</p>
    </div>
  </section>

  <!-- ── Comparison ───────────────────────────────────────────── -->
  <section class="comparison">
    <div class="container">
      <h2>Why not just rent a storage unit?</h2>
      <div class="comparison-table" role="table" aria-label="Qbicle vs self-storage comparison">
        <div class="comparison-header" role="row">
          <div role="columnheader"></div>
          <div class="col-old" role="columnheader">Self-storage</div>
          <div class="col-new" role="columnheader">Qbicle</div>
        </div>
        <div class="comparison-row" role="row">
          <div class="row-label" role="cell">Getting your stuff</div>
          <div class="col-old" role="cell">Drive to the facility</div>
          <div class="col-new" role="cell">We ship it to you</div>
        </div>
        <div class="comparison-row" role="row">
          <div class="row-label" role="cell">Contracts</div>
          <div class="col-old" role="cell">Often 3–12 months</div>
          <div class="col-new" role="cell">Month-to-month</div>
        </div>
        <div class="comparison-row" role="row">
          <div class="row-label" role="cell">Access</div>
          <div class="col-old" role="cell">Facility hours only</div>
          <div class="col-new" role="cell">Request anytime</div>
        </div>
        <div class="comparison-row" role="row">
          <div class="row-label" role="cell">Getting started</div>
          <div class="col-old" role="cell">Rent a truck, haul boxes</div>
          <div class="col-new" role="cell">Print a label, ship a box</div>
        </div>
        <div class="comparison-row" role="row">
          <div class="row-label" role="cell">Price</div>
          <div class="col-old" role="cell">$50–$200+/mo</div>
          <div class="col-new" role="cell">From $9/mo</div>
        </div>
      </div>
    </div>
  </section>

  <!-- ── FAQ ──────────────────────────────────────────────────── -->
  <section class="faq">
    <div class="container">
      <h2>Questions? Good.</h2>
      <div class="faq-items">

        <details class="faq-item">
          <summary>What happens to my stuff after I ship it?</summary>
          <p>Your box is received, logged, and stored securely at our partner warehouse. We track everything by your account — you'll see status updates once you're subscribed.</p>
        </details>

        <details class="faq-item">
          <summary>How do I get my things back?</summary>
          <p>From your account dashboard, submit a return request. We generate a shipping label and send your box back to the address on file. Return shipping is charged at the time of the request.</p>
        </details>

        <details class="faq-item">
          <summary>What can't I store?</summary>
          <p>No perishables, liquids, hazardous materials, or anything illegal. Standard FedEx shipping restrictions apply — if you wouldn't put it on a FedEx truck, don't put it in the box.</p>
        </details>

        <details class="faq-item">
          <summary>What if my box is lost or damaged in transit?</summary>
          <p>Shipments are covered by FedEx's standard declared value coverage. We recommend not shipping irreplaceable items. Full coverage details will be in our terms at launch.</p>
        </details>

        <details class="faq-item">
          <summary>Is there a minimum commitment?</summary>
          <p>No long-term contract — we charge month-to-month. Cancel anytime. Before canceling, you'll need to either retrieve your box or let us know how you'd like us to handle it.</p>
        </details>

        <details class="faq-item">
          <summary>Which zip codes do you serve?</summary>
          <p>We're still figuring that out — which is exactly why we're collecting zip codes on this form. Sign up and we'll let you know when Qbicle launches in your area.</p>
        </details>

      </div>
    </div>
  </section>

  <!-- ── Waitlist Form ─────────────────────────────────────────── -->
  <section class="waitlist" id="waitlist">
    <div class="container">
      <h2>Be the first to know when we launch in your area.</h2>
      <p class="waitlist-sub">No spam. Just a heads-up when Qbicle is available near you.</p>
      <form id="waitlist-form" novalidate>
        <div class="form-row">
          <input
            type="email"
            name="email"
            placeholder="your@email.com"
            autocomplete="email"
            aria-label="Email address"
            required
          >
          <input
            type="text"
            name="zip"
            placeholder="Zip code"
            maxlength="5"
            inputmode="numeric"
            aria-label="Zip code"
            required
          >
          <button type="submit">Join the waitlist</button>
        </div>
        <div id="form-message" class="form-message" aria-live="polite" role="status"></div>
      </form>
    </div>
  </section>

  <!-- ── Footer ───────────────────────────────────────────────── -->
  <footer>
    <div class="footer-inner">
      <span class="footer-logo">Qbicle</span>
      <span class="footer-tagline">Storage by mail, delivered to your door.</span>
      <a href="mailto:hello@qbicle.com" class="footer-contact">hello@qbicle.com</a>
      <span class="footer-copy">© 2026 Qbicle</span>
    </div>
  </footer>

  <script src="app.js"></script>
</body>
</html>
```

- [ ] **Step 2: Verify the server still passes all tests**

```bash
npx jest --forceExit
```

Expected: all 12 tests PASS

- [ ] **Step 3: Commit**

```bash
git add public/index.html
git commit -m "feat: complete landing page HTML — all sections"
```

---

## Task 6: CSS — complete styles

**Files:**
- Create: `public/styles.css`

- [ ] **Step 1: Create `public/styles.css`**

```css
/* ── Reset & Base ─────────────────────────────────────────── */
*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
html { scroll-behavior: smooth; }
body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', sans-serif;
  color: #1A2E2A;
  background: #fff;
  line-height: 1.6;
  -webkit-font-smoothing: antialiased;
}

/* ── Tokens ───────────────────────────────────────────────── */
:root {
  --teal:        #0D9488;
  --teal-hover:  #0b8177;
  --teal-dark:   #1A2E2A;
  --mint:        #CCEDE4;
  --mint-light:  #F0FAF6;
  --text:        #1A2E2A;
  --text-muted:  #4A7A6E;
  --white:       #ffffff;
  --radius:      10px;
}

/* ── Typography ───────────────────────────────────────────── */
h1 { font-size: clamp(2rem, 5vw, 3.25rem); font-weight: 800; line-height: 1.1; letter-spacing: -0.02em; }
h2 { font-size: clamp(1.5rem, 3vw, 2.25rem); font-weight: 700; line-height: 1.2; letter-spacing: -0.01em; }
h3 { font-size: 1.125rem; font-weight: 600; }

/* ── Layout helpers ───────────────────────────────────────── */
.container { max-width: 1100px; margin: 0 auto; padding: 0 1.5rem; }
section { padding: 5rem 1.5rem; }

/* ── Buttons ──────────────────────────────────────────────── */
.btn-primary {
  display: inline-block;
  background: var(--teal);
  color: var(--white);
  padding: 0.875rem 1.75rem;
  border-radius: var(--radius);
  text-decoration: none;
  font-weight: 600;
  font-size: 1rem;
  border: 2px solid var(--teal);
  cursor: pointer;
  transition: background 0.15s, border-color 0.15s;
}
.btn-primary:hover { background: var(--teal-hover); border-color: var(--teal-hover); }

.btn-secondary {
  display: inline-block;
  background: transparent;
  color: var(--teal);
  padding: 0.875rem 1.75rem;
  border-radius: var(--radius);
  text-decoration: none;
  font-weight: 600;
  font-size: 1rem;
  border: 2px solid var(--teal);
  cursor: pointer;
  transition: background 0.15s;
}
.btn-secondary:hover { background: var(--mint-light); }

/* ── Hero ─────────────────────────────────────────────────── */
.hero {
  background: var(--teal-dark);
  color: var(--white);
  min-height: 100vh;
  display: flex;
  align-items: center;
  padding: 4rem 1.5rem;
}
.hero-inner {
  max-width: 1100px;
  margin: 0 auto;
  width: 100%;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 4rem;
  align-items: center;
}
.logo {
  font-size: 1.5rem;
  font-weight: 800;
  color: var(--mint);
  margin-bottom: 2.5rem;
  letter-spacing: -0.03em;
}
.hero h1 { color: var(--white); margin-bottom: 1rem; }
.hero-sub {
  font-size: 1.15rem;
  color: var(--mint);
  opacity: 0.9;
  margin-bottom: 2rem;
  max-width: 420px;
  line-height: 1.65;
}
.hero-price {
  margin-top: 1rem;
  font-size: 0.9rem;
  color: var(--mint);
  opacity: 0.65;
}
.hero-illustration {
  display: flex;
  justify-content: center;
  align-items: center;
}
.hero-illustration svg { width: 100%; max-width: 380px; }

/* ── How it works ─────────────────────────────────────────── */
.how-it-works { background: var(--mint-light); text-align: center; }
.how-it-works h2 { margin-bottom: 3rem; }
.steps {
  display: flex;
  align-items: flex-start;
  justify-content: center;
  gap: 1rem;
  max-width: 860px;
  margin: 0 auto;
}
.step { flex: 1; max-width: 220px; }
.step-icon { margin-bottom: 1rem; }
.step-icon svg { width: 72px; height: 72px; }
.step-num {
  width: 30px;
  height: 30px;
  background: var(--teal);
  color: var(--white);
  border-radius: 50%;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-size: 0.8rem;
  margin-bottom: 0.75rem;
}
.step h3 { margin-bottom: 0.5rem; }
.step p { color: var(--text-muted); font-size: 0.9rem; line-height: 1.6; }
.step-arrow {
  font-size: 1.4rem;
  color: var(--mint);
  padding-top: 2.5rem;
  flex-shrink: 0;
  opacity: 0.8;
}

/* ── Pricing ──────────────────────────────────────────────── */
.pricing { background: var(--white); text-align: center; }
.pricing h2 { margin-bottom: 0.5rem; }
.section-sub { color: var(--text-muted); margin-bottom: 2.5rem; }
.pricing-cards {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1.5rem;
  max-width: 860px;
  margin: 0 auto 1.5rem;
}
.pricing-card {
  border: 2px solid var(--mint);
  border-radius: 16px;
  padding: 2rem;
  position: relative;
  text-align: left;
  transition: box-shadow 0.2s;
}
.pricing-card:hover { box-shadow: 0 6px 28px rgba(13,148,136,0.12); }
.pricing-card.featured { border-color: var(--teal); }
.badge {
  position: absolute;
  top: -13px;
  left: 50%;
  transform: translateX(-50%);
  background: var(--teal);
  color: var(--white);
  padding: 0.2rem 0.85rem;
  border-radius: 20px;
  font-size: 0.72rem;
  font-weight: 700;
  letter-spacing: 0.02em;
  white-space: nowrap;
}
.pricing-card h3 { font-size: 1rem; color: var(--text-muted); margin-bottom: 0.2rem; text-transform: uppercase; letter-spacing: 0.05em; }
.box-size { font-size: 0.8rem; color: var(--text-muted); margin-bottom: 1rem; }
.price { font-size: 2.75rem; font-weight: 800; color: var(--teal); line-height: 1; margin-bottom: 1.25rem; }
.price span { font-size: 1rem; font-weight: 400; color: var(--text-muted); }
.pricing-card ul { list-style: none; margin-bottom: 1.75rem; }
.pricing-card li { padding: 0.3rem 0; font-size: 0.875rem; color: var(--text-muted); }
.pricing-card li::before { content: "✓ "; color: var(--teal); font-weight: 700; }
.pricing-card .btn-primary,
.pricing-card .btn-secondary { width: 100%; text-align: center; display: block; }
.pricing-note { color: var(--text-muted); font-size: 0.875rem; max-width: 480px; margin: 0 auto; }

/* ── Comparison ───────────────────────────────────────────── */
.comparison { background: var(--mint-light); }
.comparison h2 { text-align: center; margin-bottom: 2.5rem; }
.comparison-table {
  max-width: 680px;
  margin: 0 auto;
  border-radius: 14px;
  overflow: hidden;
  box-shadow: 0 2px 16px rgba(13,148,136,0.1);
}
.comparison-header,
.comparison-row {
  display: grid;
  grid-template-columns: 2fr 1.5fr 1.5fr;
}
.comparison-header {
  background: var(--teal-dark);
  color: var(--white);
  font-weight: 600;
  font-size: 0.85rem;
  letter-spacing: 0.03em;
}
.comparison-header > div,
.comparison-row > div { padding: 0.9rem 1.25rem; }
.comparison-header .col-new { color: var(--mint); }
.comparison-row { background: var(--white); border-bottom: 1px solid var(--mint); }
.comparison-row:last-child { border-bottom: none; }
.row-label { font-weight: 500; font-size: 0.875rem; }
.col-old { text-align: center; color: var(--text-muted); font-size: 0.875rem; }
.col-new { text-align: center; color: var(--teal); font-weight: 600; font-size: 0.875rem; }
.comparison-header .col-old,
.comparison-header .col-new { text-align: center; }

/* ── FAQ ──────────────────────────────────────────────────── */
.faq { background: var(--white); }
.faq h2 { text-align: center; margin-bottom: 2.5rem; }
.faq-items { max-width: 660px; margin: 0 auto; }
.faq-item { border-bottom: 1px solid var(--mint); }
.faq-item:first-child { border-top: 1px solid var(--mint); }
.faq-item summary {
  padding: 1.2rem 0;
  font-weight: 600;
  font-size: 0.975rem;
  cursor: pointer;
  list-style: none;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1rem;
  user-select: none;
}
.faq-item summary::-webkit-details-marker { display: none; }
.faq-item summary::after {
  content: '+';
  color: var(--teal);
  font-size: 1.4rem;
  font-weight: 300;
  flex-shrink: 0;
  line-height: 1;
  transition: transform 0.2s;
}
.faq-item[open] summary::after { content: '−'; }
.faq-item p {
  padding-bottom: 1.25rem;
  color: var(--text-muted);
  font-size: 0.925rem;
  line-height: 1.7;
}

/* ── Waitlist ─────────────────────────────────────────────── */
.waitlist {
  background: var(--teal-dark);
  color: var(--white);
  text-align: center;
}
.waitlist h2 { color: var(--white); margin-bottom: 0.75rem; }
.waitlist-sub { color: var(--mint); opacity: 0.8; margin-bottom: 2.25rem; }
#waitlist-form { max-width: 580px; margin: 0 auto; }
.form-row {
  display: flex;
  gap: 0.75rem;
  flex-wrap: wrap;
  justify-content: center;
}
.form-row input {
  flex: 1;
  min-width: 180px;
  padding: 0.9rem 1rem;
  border-radius: var(--radius);
  border: 2px solid transparent;
  font-size: 1rem;
  background: rgba(255,255,255,0.1);
  color: var(--white);
  outline: none;
  transition: border-color 0.15s, background 0.15s;
}
.form-row input::placeholder { color: rgba(204,237,228,0.55); }
.form-row input:focus {
  border-color: var(--mint);
  background: rgba(255,255,255,0.14);
}
.form-row button {
  padding: 0.9rem 1.75rem;
  background: var(--teal);
  color: var(--white);
  border: 2px solid var(--teal);
  border-radius: var(--radius);
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.15s, border-color 0.15s;
  white-space: nowrap;
}
.form-row button:hover:not(:disabled) { background: var(--teal-hover); border-color: var(--teal-hover); }
.form-row button:disabled { opacity: 0.55; cursor: not-allowed; }
.form-message {
  margin-top: 1rem;
  font-size: 0.925rem;
  min-height: 1.5em;
}
.form-message.success { color: var(--mint); }
.form-message.error   { color: #fca5a5; }

/* ── Footer ───────────────────────────────────────────────── */
footer {
  background: var(--teal-dark);
  border-top: 1px solid rgba(204,237,228,0.12);
  padding: 2rem 1.5rem;
}
.footer-inner {
  max-width: 1100px;
  margin: 0 auto;
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 1.25rem;
  font-size: 0.85rem;
  color: var(--mint);
  opacity: 0.65;
}
.footer-logo { font-weight: 800; font-size: 1rem; opacity: 1; letter-spacing: -0.02em; }
.footer-inner a { color: var(--mint); text-decoration: none; }
.footer-inner a:hover { opacity: 1; }
.footer-copy { margin-left: auto; }

/* ── Responsive ───────────────────────────────────────────── */
@media (max-width: 820px) {
  .hero-inner { grid-template-columns: 1fr; gap: 2.5rem; }
  .hero-illustration { display: none; }
  .steps { flex-direction: column; align-items: center; }
  .step { max-width: 300px; }
  .step-arrow { transform: rotate(90deg); padding: 0; }
  .pricing-cards { grid-template-columns: 1fr; max-width: 360px; }
  .comparison-header,
  .comparison-row { grid-template-columns: 1.5fr 1fr 1fr; }
  .form-row { flex-direction: column; align-items: stretch; }
  .form-row input,
  .form-row button { min-width: unset; width: 100%; }
  .footer-inner { justify-content: center; text-align: center; }
  .footer-copy { margin-left: 0; }
}
```

- [ ] **Step 2: Start dev server and visually inspect each section**

```bash
npm run dev
```

Open http://localhost:3000 and scroll through all sections. Confirm:
- Hero: dark background, teal button, box SVG visible
- How it works: mint background, 3 steps with numbered circles
- Pricing: 3 cards, middle card has teal border and "Most popular" badge
- Comparison: rounded table, teal "Qbicle" column
- FAQ: accordion items expand/collapse natively
- Waitlist: dark background, form inputs visible
- Footer: same dark background, dimmed text

Ctrl+C to stop.

- [ ] **Step 3: Commit**

```bash
git add public/styles.css
git commit -m "feat: complete CSS — teal/mint palette, responsive"
```

---

## Task 7: Client-side JavaScript

**Files:**
- Create: `public/app.js`

- [ ] **Step 1: Create `public/app.js`**

```javascript
document.getElementById('waitlist-form').addEventListener('submit', async function (e) {
  e.preventDefault();

  const form = e.target;
  const btn = form.querySelector('button[type="submit"]');
  const msg = document.getElementById('form-message');
  const email = form.email.value.trim();
  const zip = form.zip.value.trim();

  btn.disabled = true;
  btn.textContent = 'Submitting…';
  msg.textContent = '';
  msg.className = 'form-message';

  try {
    const res = await fetch('/waitlist', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, zip }),
    });
    const data = await res.json();

    if (res.ok) {
      msg.textContent = "You're on the list! We'll be in touch when we launch near you.";
      msg.className = 'form-message success';
      form.reset();
    } else {
      msg.textContent = data.error || 'Something went wrong. Please try again.';
      msg.className = 'form-message error';
    }
  } catch {
    msg.textContent = 'Network error. Please check your connection and try again.';
    msg.className = 'form-message error';
  } finally {
    btn.disabled = false;
    btn.textContent = 'Join the waitlist';
  }
});
```

- [ ] **Step 2: Smoke test the form locally**

```bash
npm run dev
```

Open http://localhost:3000, scroll to the waitlist form. Submit with a valid email + zip. Expected: 500 response (sheets.js throws because `GOOGLE_SERVICE_ACCOUNT_JSON` isn't set in dev env yet). The error message should appear inline — confirm no page reload happens.

Ctrl+C.

- [ ] **Step 3: Create `.env` from your credentials**

If you haven't already run the setup command from the brainstorming session:

```bash
echo "GOOGLE_SERVICE_ACCOUNT_JSON='$(cat ~/Downloads/<your-key-file>.json)'" >> .env
echo "GOOGLE_SHEET_ID=1qW1ryJu6yVBvuHMEGqZxZSrzDyTnPuJiM18HhuNbdgo" >> .env
```

- [ ] **Step 4: Test the full flow end-to-end**

```bash
npm run dev
```

Submit the form again with a real email + valid zip. Expected: inline success message ("You're on the list!"). Check the Google Sheet — a new row should appear with timestamp, email, and zip.

Ctrl+C.

- [ ] **Step 5: Run all tests one final time**

```bash
npx jest --forceExit
```

Expected: all 12 tests PASS

- [ ] **Step 6: Commit**

```bash
git add public/app.js
git commit -m "feat: waitlist form AJAX submission with inline feedback"
```

---

## Task 8: Heroku deploy

**Prerequisites:** [Heroku CLI](https://devcenter.heroku.com/articles/heroku-cli) installed and logged in (`heroku login`).

- [ ] **Step 1: Create the Heroku app**

```bash
heroku create qbicle
```

Expected output includes a URL like `https://qbicle.herokuapp.com` and a git remote `heroku` added.

If `qbicle` is taken, use `heroku create qbicle-landing` or any available name.

- [ ] **Step 2: Set environment variables on Heroku**

```bash
heroku config:set GOOGLE_SHEET_ID=1qW1ryJu6yVBvuHMEGqZxZSrzDyTnPuJiM18HhuNbdgo
heroku config:set GOOGLE_SERVICE_ACCOUNT_JSON="$(cat ~/Downloads/<your-key-file>.json)"
```

Verify:
```bash
heroku config
```

Expected: both vars listed.

- [ ] **Step 3: Deploy**

```bash
git push heroku main
```

Expected: build completes, dyno starts, no errors in output.

- [ ] **Step 4: Open and verify**

```bash
heroku open
```

The landing page should load. Scroll through all sections, then submit the waitlist form with a real email and zip. Confirm:
- Success message appears inline
- New row appears in the Google Sheet

- [ ] **Step 5: Check logs if anything fails**

```bash
heroku logs --tail
```

- [ ] **Step 6: Commit Heroku app name to notes (optional)**

Update `CLAUDE.md` — add the deployed URL under a "Deployment" section so future sessions know where it lives.

---

## Done

All 12 tests pass. The page is deployed. Waitlist submissions write to Google Sheets.

Next: share the Heroku URL, start driving traffic, and watch the zip codes roll in.
