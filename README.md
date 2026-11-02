# SDE Intern Assignment: Shared Bill Splitter

Welcome. In this assignment you build a small bill splitter for a shared home. It has two parts:

1. **Homes and members:** create a home and add members to it.
2. **Bill splitting:** split a bill between the members. Each member pays their own share.

The assignment is small on purpose. We want correct, safe, and clear code. We do not want many features.

## What we look at

- **Your code passes the tests.** The tests decide, not opinion. You get the visible tests. We also run extra tests that you do not see.
- **Your code is safe when things go wrong.** Wrong input, repeated requests, and two requests at the same time must not break your data.
- **Your code is typed.** Use TypeScript. Do not use `any`.
- **You understand your code.** You record a short video and explain it.

Take your time. A careful, correct solution is better than a fast one. We expect 2 to 3 days of real work.

## Stack (required)

- **API:** Hono on Cloudflare Workers
- **Database:** Cloudflare D1 (SQLite). The binding is `DB` in `api/wrangler.jsonc`.
- **Web:** React, Vite, TanStack Router
- **Language:** TypeScript on both sides
- **Tests:** Vitest, running inside the Workers runtime
- **Quality:** Biome. `pnpm check` and `pnpm typecheck` must pass.

You choose the rest (styling, form library, validation library). Pick tools you can explain.

## The task

The assignment has two parts. Do Part 1 first. Part 2 builds on it.

**Database.** Write the schema as SQL migration files in `api/migrations/`. For example `0001_init.sql`. The tests apply every file in this folder. Your schema must have **at least 3 named constraints** that protect the data. For example a foreign key, a `CHECK`, or a `UNIQUE` key. Be ready to explain what each constraint stops.

**Errors.** Every error response is JSON: `{ "error": "message" }`.

## Part 1: Homes and members

Create a home and add members to it. The order in which members are added matters in Part 2.

#### `POST /api/homes`

- Request: `{ "name": string }`
- Success: `201` `{ id, name }`

#### `POST /api/homes/:homeId/members`

- Request: `{ "name": string }`
- Success: `201` `{ id, homeId, name }`
- Errors: `404` home not found

Visible tests: `api/test/homes.test.ts`.

## Part 2: Bill splitting

Add a bill to a home, split it between the members, and let each member pay their share.

All amounts are whole **cents** (integers). `100` cents is 1 dollar. Never use decimals for money.

#### `POST /api/homes/:homeId/bills`

- Request: `{ "title": string, "totalCents": number }`
- Success: `201` `{ id, homeId, title, totalCents, shares: [{ id, memberId, amountCents, paidAt: null }] }`
- Errors: `404` home not found. `422` total is not a positive whole number, or the home has no members.

#### `POST /api/bills/:billId/shares/:shareId/pay`

- Request: header `Idempotency-Key`
- Success: `200` `{ id, memberId, amountCents, paidAt }`
- Errors: `400` key missing. `404` bill or share not found. `409` share already paid with a different key.

#### `GET /api/homes/:homeId/balances`

- Success: `200` `{ balances: [{ memberId, name, outstandingCents }] }`
- Errors: `404` home not found

**Rules**

- **Split.** A bill is split between all members of the home. The shares always add up to `totalCents`. If the amount does not divide evenly, the extra cents go to the members one by one, in the order the members were added to the home. Example: 1000 cents between 3 members gives `334`, `333`, `333`.
- **Pay.** Paying marks one share as paid and sets `paidAt`. If the same `Idempotency-Key` is sent again for the same share, answer `200` with the same result. Do not pay twice. If two requests pay the same share at the same time, only one may succeed.
- **Balances.** `outstandingCents` is the sum of the member's unpaid shares, across all bills of the home. List the members in the order they were added.

Visible tests: `api/test/bills.test.ts` and `api/test/payments.test.ts`.

#### Web page

Build one page that:

- shows the bills of a home and the shares of each bill,
- lets a member pay a share,
- shows clear **loading**, **empty**, and **error** states,
- keeps the share unpaid and shows an error if the payment fails.

The page must not crash when the API answers with an error or is slow.

## Cases you must handle

You must handle these cases and talk about them in your video:

1. A home with no members.
2. An amount that is zero, negative, or not a whole number.
3. An amount that does not divide evenly.
4. The same payment request sent twice.
5. Two members paying the same share at the same time.
6. A bill or share that does not exist.
7. The API answers with a 500 error or is slow. The web page must not crash.

## Run it

This is a pnpm workspace. Install once at the root.

```bash
pnpm install
pnpm dev          # api on :8787 and web on :5173
```

Open http://localhost:5173. The starter page shows a title. `/api/health` returns `{ "status": "ok" }`.

```bash
pnpm test         # run the visible tests in api/test
pnpm check        # Biome: format and lint. Must pass.
pnpm check:fix    # fix what Biome can fix
pnpm typecheck    # tsc on both packages. Must pass.
pnpm build        # production build of the web app
```

`pnpm dev` applies your migrations to a local database before it starts the API.

If pnpm says some build scripts were ignored, run `pnpm approve-builds` and allow `esbuild` and `workerd`.

When you change `api/wrangler.jsonc`, refresh the `Env` types:

```bash
pnpm --filter bill-splitter-api cf-typegen
```

## Rules for the tests

- The visible tests are in `api/test`. They start with a failing result. Your job is to make them pass.
- Do **not** change the visible tests or `api/test/helpers.ts`. We compare them with the original.
- We run extra tests after you submit. They test the cases in "Cases you must handle" more closely.

## AI policy

You can use AI tools. Tell us which ones and where in your answers on the form.
You must understand every line you submit. We check this with your video and in a live call. "The AI wrote it" is not an answer.

## How to submit

1. Click **Use this template**, then **Create a new repository**. Make the repository **public**.
2. Build your solution in your new repository. Small, clear commits are welcome.
3. Update this README with a short section called **Decisions**. Write 3 decisions you made and why.
4. Record a video of **3 minutes or less** (Loom or unlisted YouTube). Show the architecture, the data flow, and one trade-off you made. Make sure anyone with the link can view it.
5. Paste the repository link and the video link in the application form.

We will run `pnpm install && pnpm check && pnpm typecheck && pnpm test` on your repository.

## Architecture Overview

The codebase follows a strict layered architecture to decouple HTTP handling, business logic, data persistence, and UI presentation:

```
api/
├── migrations/
│   └── 0001_init.sql           # D1 SQLite schema with 7 named integrity constraints
└── src/
    ├── domain/                 # Pure domain logic (zero side-effects)
    │   ├── splitter.ts         # Deterministic remainder distribution & integer division
    │   └── validation.ts       # Input parsers & centralized HttpError
    ├── repositories/           # Isolated D1 database operations
    │   ├── home.repository.ts
    │   ├── bill.repository.ts
    │   └── payment.repository.ts
    ├── services/               # Orchestration, atomic batch writes & idempotency
    │   ├── home.service.ts
    │   ├── bill.service.ts
    │   └── payment.service.ts
    ├── routes/                 # Thin Hono route handlers
    │   ├── homes.route.ts
    │   ├── bills.route.ts
    │   ├── payments.route.ts
    │   └── balances.route.ts
    ├── types/
    │   └── models.ts           # Strongly typed domain entities
    └── index.ts                # Composition root & global error handler

web/
└── src/
    ├── types/
    │   └── models.ts           # Shared frontend TypeScript interfaces
    ├── lib/
    │   ├── api.ts              # Typed client for Hono endpoints
    │   └── formatters.ts       # Currency (₹), initials & avatar helpers
    ├── components/
    │   ├── Header.tsx          # Brand logo, property dropdown, flat creator
    │   ├── HouseholdSummary.tsx# Balances breakdown & summary metrics
    │   ├── BillsFeed.tsx       # Feed with progress bars & settlement status
    │   ├── BillCard.tsx        # Single bill item with optimistic pay action
    │   ├── SplitBillForm.tsx   # Bill creator with real-time split preview
    │   ├── AddMemberForm.tsx   # Fast roommate onboarding form
    │   ├── ToastContainer.tsx  # Floating toast notifications
    │   └── GlobalErrorBanner.tsx
    ├── routes/
    │   └── index.tsx           # Clean orchestrating route component
    └── app.css                 # Fintech styling, elevation & responsive layout
```

## Decisions

### 1. Explicit Sequential Ordering (`order_idx`) and Atomic Batch Transactions

- **Decision:** Rather than relying on implicit SQLite `rowid` ordering or timestamps (which can suffer from millisecond collisions during rapid inserts), each member in a home and each share in a bill is assigned an explicit integer `order_idx`. When creating a bill, the bill record and all computed member shares are written atomically using `c.env.DB.batch(...)`.
- **Why:** The bill-splitting specification strictly requires extra remainder cents to be distributed to members in the exact order they joined, and balances to be reported in that same order. Explicit indexing guarantees deterministic, collision-free member ordering. Atomic batching ensures that a bill and its shares are written together, preventing orphan bills or partial share allocation if a failure occurs mid-write.

### 2. Atomic Idempotent Payments via Conditional Update and Re-fetch Reconciliation

- **Decision:** Payment processing uses an atomic conditional SQL write: `UPDATE shares SET paid_at = ?, idempotency_key = ? WHERE id = ? AND paid_at IS NULL`, coupled with a database-level `UNIQUE` constraint on `idempotency_key`. If 0 rows are updated, the handler reads the current state to differentiate between an idempotent retry (same key returns `200` with the original `paidAt`) and a concurrent/duplicate conflict (different key returns `409`).
- **Why:** This design eliminates race conditions when two concurrent requests try to pay the same share simultaneously. Only one request can transition `paid_at` from `NULL` to a timestamp. Subsequent or duplicate requests with the exact same `Idempotency-Key` are served safely without double charging or altering timestamps.

### 3. Defensive Schema Integrity with 7 Named Constraints

- **Decision:** Instead of relying solely on API validation, the SQLite schema enforces business invariants at the database level using 7 explicit named constraints:
  1. `fk_members_home_id`: `FOREIGN KEY (home_id) REFERENCES homes(id) ON DELETE CASCADE` (prevents orphan members).
  2. `fk_bills_home_id`: `FOREIGN KEY (home_id) REFERENCES homes(id) ON DELETE CASCADE` (prevents orphan bills).
  3. `chk_bills_total_cents_positive`: `CHECK (total_cents > 0)` (prevents zero or negative bill totals).
  4. `fk_shares_bill_id`: `FOREIGN KEY (bill_id) REFERENCES bills(id) ON DELETE CASCADE` (prevents orphan shares).
  5. `fk_shares_member_id`: `FOREIGN KEY (member_id) REFERENCES members(id) ON DELETE CASCADE` (prevents shares from referencing non-existent members).
  6. `chk_shares_amount_cents_positive`: `CHECK (amount_cents > 0)` (guarantees split amounts are strictly positive).
  7. `uq_shares_idempotency_key`: `UNIQUE (idempotency_key)` (prevents idempotency key collisions across payments).
- **Why:** Financial calculations demand defensive programming. Enforcing constraints at the database boundary guarantees database consistency regardless of network quirks, concurrency, or future API refactors.
