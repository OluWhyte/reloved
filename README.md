# Reloved

**Give what you don't need. Relove what you find.**

Reloved is a donor-to-recipient rehoming platform. Donors list pre-loved items for free â€” **no account needed**, guests just leave a name and phone number on the listing â€” recipients claim what they need and cover courier delivery (or pick up free at a Safe Spot), an admin dispatches the courier, and once delivery is confirmed a registered donor earns **+1 karma point** and the recipient can post a thank-you story to the **Impact Wall**.

Built with **Next.js 16 (App Router) + TypeScript + Tailwind CSS 4**, and delivered as a **REST API** (`/api/*` route handlers) that the UI consumes through a typed client.

---

## Table of contents

- [How it works (5 steps)](#how-it-works-5-steps)
- [Tech stack](#tech-stack)
- [Getting started](#getting-started)
- [Project structure](#project-structure)
- [API reference](#api-reference)
- [Data model](#data-model)
- [Domain rules](#domain-rules)
- [Persistence modes](#persistence-modes)
- [Scripts](#scripts)

---

## How it works (5 steps)

```
 Donor                     Reloved API                    Recipient / Admin
 ------                    ----------                    -----------------
  1. List item ----------> POST /api/listings   (account optional - guests just leave a phone)
  2. Sign up (optional) -> POST /api/auth/signup   (to earn karma + track claims)
                           (choose FCFS or manual pick)
                                                        3. "I Want This" -> POST /api/claims
                                                           FCFS => auto-locked
                                                           courier => pay fee (PATCH pay)
                                                        4. Admin queue --> PATCH dispatch
                                                           courier delivers
                                                        5. Recipient ----> PATCH confirm_receipt
                                                           donor +1 karma, story on /impact
```

**Karma is awarded by the server** when a claim reaches `delivered` - clients cannot grant themselves points.

---

## Tech stack

| Layer | Choice |
| --- | --- |
| Framework | Next.js 16.4.1 (App Router, Turbopack, Cache Components) |
| Language | TypeScript 5 (strict) |
| Styling | Tailwind CSS 4 + hand-rolled `card` / `input` / `btn-*` / `badge` utilities |
| Validation | Zod (server-side payload validation on every write route) |
| API | REST route handlers under `src/app/api/**` |
| Auth | Bearer-token sessions issued by `/api/auth/signup|signin`, verified via `Authorization` header |
| Persistence | In-memory server store (demo) - Supabase-ready (schema provided) |
| Icons | lucide-react |

---

## Getting started

### Prerequisites

- Node.js 20+
- npm 10+

### Install & run

```bash
npm install
npm run dev        # http://localhost:3000
```

### Production build

```bash
npm run lint       # ESLint
npx tsc --noEmit   # type check
npm run build      # production build
npm start
```

### Try the demo flow

1. Open `http://localhost:3000` - seeded listings (sofa, books, baby cot) appear.
2. As donor: **+ List item** â€” sign up first to earn karma, or list as a **guest** (name + phone on the listing); choose *First Come, First Served* or *Manual Selection*.
3. **Sign up** a recipient account in a second browser profile.
4. As recipient: open the item, **I Want This** (pickup = free, courier = pay the distance fee).
5. **Dashboard** shows the claim - pay fee / confirm pickup / confirm receipt.
6. **Admin** page shows the dispatch queue - dispatch the courier.
7. After **Confirm receipt**, the donor's karma +1 and the recipient can post to the **Impact Wall**.

---## Project structure

```
reloved/
|- src/
|  |- app/                      # Next.js App Router pages
|  |  |- page.tsx               # Home: browse + search listings
|  |  |- signup/  signin/       # AuthCard-based auth pages
|  |  |- list/                  # Step 1 - donor creates a listing
|  |  |- items/[id]/            # Step 2 - item detail + claim
|  |  |- dashboard/             # My listings + my claims + actions
|  |  |- admin/                 # Step 3 - dispatch queue
|  |  |- impact/                # Step 5 - thank-you stories wall
|  |  `- api/                   # REST API route handlers
|  |     |- health/route.ts
|  |     |- auth/{signup,signin,me}/route.ts
|  |     |- listings/route.ts           + listings/[id]/route.ts
|  |     |- claims/route.ts             + claims/[id]/route.ts
|  |     |- delivery/quote/route.ts
|  |     |- admin/queue/route.ts
|  |     `- stories/route.ts
|  |- components/               # Navbar, AuthCard, MyListings, ClaimsList, dash-actions
|  |- lib/
|  |  |- api.ts                 # typed fetch client for /api/*
|  |  |- auth-api.tsx           # AuthProvider backed by the API
|  |  |- types.ts               # shared domain types
|  |  `- delivery.ts            # Naira fee tiers, delivery codes, uid
|  `- server/
|     `- db.ts                  # server-side store + seed data + publicUser()
|- supabase/schema.sql          # Postgres schema for production persistence
|- .env.example
`- package.json
```

---

## API reference

All routes return JSON. Errors return `{ "error": string }` with an appropriate 4xx/5xx status. Authenticated calls send `Authorization: Bearer <token>`.

### Health

| Method | Path | Auth | Description |
| --- | --- | --- | --- |
| GET | `/api/health` | - | Liveness check `{ ok, service, time }` |

### Auth

| Method | Path | Auth | Description |
| --- | --- | --- | --- |
| POST | `/api/auth/signup` | - | Create account -> `{ user, token }` (409 if email taken) |
| POST | `/api/auth/signin` | - | Sign in -> `{ user, token }` (401 on bad credentials) |
| GET | `/api/auth/me` | Bearer | Current user (401 if token invalid) |

`user` is the **public** shape - never includes `password`.

```bash
curl -X POST http://localhost:3000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{"name":"Ada","email":"ada@example.com","password":"secret1","phone":"+2348012345678"}'
# -> { "user": { "id":"user_...", "karmaPoints":0, ... }, "token":"tok_..." }
```

### Listings

| Method | Path | Auth | Description |
| --- | --- | --- | --- |
| GET | `/api/listings?q=&category=` | - | Browse; filter by search text and category |
| POST | `/api/listings` | - | Create listing -> 201 `{ item }`. Body needs `donorId` (account) **or** guest contact: `donorName` + `donorPhone` (`donorEmail?`) |
| GET | `/api/listings/:id` | - | Single listing -> `{ item }` (404 if missing) |

### Claims

| Method | Path | Auth | Description |
| --- | --- | --- | --- |
| GET | `/api/claims?listingId=&recipientId=&status=` | - | Filter claims |
| POST | `/api/claims` | - | Apply for an item -> 201 `{ claim, listing }` |
| PATCH | `/api/claims/:id` | - | Advance a claim (see actions below) |

**PATCH actions** - body `{ "action": ... }`:

| Action | Effect |
| --- | --- |
| `choose` | Donor manually picks this claim -> listing locked |
| `pay` | Courier claim paid -> listing locked (courier only) |
| `confirm_pickup` | Item handed to courier / picked up |
| `dispatch` | Admin dispatches -> `in_transit` |
| `confirm_receipt` | Delivered -> **donor +1 karma** |

### Delivery

| Method | Path | Auth | Description |
| --- | --- | --- | --- |
| POST | `/api/delivery/quote` | - | `{ distanceKm }` -> `{ fee, formatted }` (Naira) |

### Admin

| Method | Path | Auth | Description |
| --- | --- | --- | --- |
| GET | `/api/admin/queue` | - | Locked/paid/pickup-confirmed claims with donor phone |

### Stories

| Method | Path | Auth | Description |
| --- | --- | --- | --- |
| GET | `/api/stories` | - | Impact Wall entries |
| POST | `/api/stories` | - | Post a thank-you story -> 201 `{ story }` |

---## Data model

Shared TypeScript types live in `src/lib/types.ts`.

- **User** - `id, name, email, password, phone?, karmaPoints, createdAt`
- **Listing** - `id, donorId?, donorName, donorPhone?, donorEmail?, title, description, category, location, originStory, photos[], selectionMethod (fcfs|manual), status, lockedClaimId?, lockedByName?, deliveryCode, createdAt` (guest listings have no `donorId` â€” contact travels on the listing)
- **Claim** - `id, listingId, recipientId, recipientName, deliveryMethod (pickup|courier), fee, distanceKm, status, isChosen, createdAt`
- **ThankStory** - `id, listingId, listingTitle, donorName, recipientName, note, photo, createdAt`

**Statuses**

- Listing: `available -> locked -> in_transit -> delivered`
- Claim: `pending -> locked -> paid (courier) -> pickup_confirmed -> in_transit -> delivered -> story_shared`

**Categories:** Furniture, Clothes, Kids & Baby, Electronics, Kitchen, Books, Shoes & Bags, Other.

---

## Domain rules

Enforced **server-side** in the route handlers:

1. **Listing is always free for the donor** - donors never pay delivery.
2. **FCFS auto-lock** - the first claim on an `fcfs` listing while `available` immediately becomes `locked`/`isChosen` and locks the listing.
3. **Manual pick** - claims stay `pending` until the donor calls `choose` (defaults to first applicant if they never pick).
4. **You cannot claim your own listing** (`400`).
5. **One claim per recipient per listing** (`409`).
6. **Courier fees are distance-based** and paid by the recipient; **pickup is free** (verified Safe Spot meetup).
7. **Karma (+1) is granted by the server** only when a claim transitions to `delivered`.
8. **Passwords never leave the server** - all responses use the public user shape.

### Naira courier fee tiers

| Distance | Fee |
| --- | --- |
| <= 3 km | 1,200 N |
| <= 7 km | 2,000 N |
| <= 15 km | 3,200 N |
| <= 30 km | 5,000 N |
| > 30 km | 5,000 N + 150 N/km over 30 |

---

## Persistence modes

Reloved runs **out of the box with zero configuration** using a server-side in-memory store (`src/server/db.ts`) seeded with demo listings and one story. This is ideal for local development and demos.

> The in-memory store **resets on server restart** and is per-process.

### Moving to production (Supabase)

A production-ready Postgres schema is provided in **`supabase/schema.sql`** with tables for `users`, `listings`, `claims`, `stories`. To switch:

1. Create a Supabase project and run `supabase/schema.sql` in the SQL editor.
2. Copy `.env.example` -> `.env.local` and fill in:
   ```
   NEXT_PUBLIC_SUPABASE_URL=...
   NEXT_PUBLIC_SUPABASE_ANON_KEY=...
   SUPABASE_SERVICE_ROLE_KEY=...
   ```
3. Replace the helpers in `src/server/db.ts` with Supabase queries (`@supabase/ssr` / `@supabase/supabase-js` are already installed). The API surface (`/api/*`) and the client (`src/lib/api.ts`) stay exactly the same - only the storage implementation changes.

For real authentication, swap the demo token issue/verify logic in `src/app/api/auth/*` for Supabase Auth sessions.

---

## Scripts

| Command | Purpose |
| --- | --- |
| `npm run dev` | Dev server with Turbopack |
| `npm run build` | Production build |
| `npm start` | Serve the production build |
| `npm run lint` | ESLint |
| `npx tsc --noEmit` | Type check |

---

## Roadmap ideas

- Photo uploads (currently photo URL paste) - Supabase Storage
- Real payment provider for courier fees (Paystack/Flutterwave)
- Push/email notifications on claim status changes
- Safe Spot directory with geolocation
- Admin roles & auth-gated `/admin`

---

MIT (c) Reloved
