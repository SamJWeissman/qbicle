# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**Qbicle** is a residential storage-by-mail service. Customers pay a monthly subscription, ship physical items to a warehouse using a prepaid FedEx label, and request returns on demand. The business partner already operates storage/shipping infrastructure for B2B customers and has discounted FedEx rates.

This project is in the **pre-implementation** stage. The full context is in `qbicle-project-brief.md` — read it before writing any code.

## Stack

- **Framework:** Next.js (App Router) + TypeScript
- **Database:** PostgreSQL via Prisma or Drizzle ORM
- **Auth:** NextAuth.js or Clerk
- **Payments:** Stripe (subscriptions + webhooks)
- **Shipping:** FedEx Web Services API (Ship API)
- **Hosting:** Vercel
- **Email:** Resend or SendGrid

## Commands

> No scaffold exists yet. Once Next.js is initialized, standard commands will be:

```bash
npm run dev       # local dev server
npm run build     # production build
npm run lint      # ESLint
npm run typecheck # tsc --noEmit
```

Tests: add as needed (Jest + React Testing Library is the natural fit for Next.js).

## Build Phases

Build sequentially — each phase ships independently:

1. **Phase 1 (current):** Landing page + waitlist form (email + zip code). No auth, no payments.
2. **Phase 2:** Auth (email/password) + Stripe recurring subscriptions + account page.
3. **Phase 3:** FedEx label generation for active subscribers (prepaid inbound label, PDF download).
4. **Phase 4+:** Customer dashboard, return requests, item-level tracking, admin panel. **Do not build yet.**

## Data Model

```
User              → email, password_hash, address, stripe_customer_id
Subscription      → user, stripe_subscription_id, tier (small|medium|large), status
ShippingLabel     → user, subscription, fedex_tracking_number, label_pdf_url, status
StoredBox         → user, shipping_label, tier, status, photo_url (nullable)
ReturnRequest     → stored_box, return_tracking_number, cost (Phase 4+)
```

## Pricing Tiers

| Tier   | Box Size       | Price  |
|--------|----------------|--------|
| Small  | Up to 1 cu ft  | $9/mo  |
| Medium | Up to 3 cu ft  | $19/mo |
| Large  | Up to 6 cu ft  | $29/mo |

## Environment Variables

```
DATABASE_URL
NEXTAUTH_SECRET / NEXTAUTH_URL
STRIPE_SECRET_KEY / STRIPE_PUBLISHABLE_KEY / STRIPE_WEBHOOK_SECRET
STRIPE_PRICE_ID_SMALL / STRIPE_PRICE_ID_MEDIUM / STRIPE_PRICE_ID_LARGE
FEDEX_API_KEY / FEDEX_SECRET_KEY / FEDEX_ACCOUNT_NUMBER  # Phase 3
RESEND_API_KEY                                           # when email is added
```

## Design Direction

Clean, modern, trustworthy — closer to Dropbox than Public Storage. Key message: "Your stuff, stored and shipped back whenever you need it." Emphasize 3 simple steps (choose plan → ship stuff → get it back), no trips to a facility, no contracts.

## Open Decisions

- Minimum commitment period (3-month to protect economics)?
- One-time setup fee ($5–10)?
- Return shipping: flat fee per tier or pass-through FedEx cost?
- Warehouse address (needed for Phase 3 label generation — partner to provide)
- Brand assets (logo, color palette)
