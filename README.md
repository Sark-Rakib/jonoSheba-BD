# জনসেবা BD (JonoSheba BD)

বাংলাদেশ-কেন্দ্রিক একটি পাবল-সার্ভিস ও লোকাল-ডিসকভারি ওয়েব অ্যাপ — স্থানীয় সেবা/প্রতিষ্ঠান খোঁজা, জনসেবা নির্দেশিকা (NID, পাসপোর্ট, জন্মনিবন্ধন ইত্যাদি), চাকরি ও শিক্ষার সুযোগ, ব্যবসার জন্য নিজস্ব ড্যাশবোর্ড এবং অ্যাডমিন মডারেশন প্যানেলসহ সম্পূর্ণ প্ল্যাটফর্ম।

A complete, Bangla-first public-service & local-discovery web app built with Next.js App Router.

## Tech stack

| Layer | Choice |
| --- | --- |
| Framework | Next.js 16.4 (App Router, Cache Components/PPR, React Compiler, Turbopack) |
| UI | React 19.3, Tailwind CSS v4, lucide-react, sonner |
| Data | MongoDB + Mongoose 9 |
| Validation | Zod 4 (server + route handlers) |
| Auth | Custom session — jose JWT (HS256) httpOnly cookie + Node `scrypt` password hashing |
| Tests | Vitest 5 (unit/component) + Playwright (e2e) |

## Quick start

```bash
# 1. Install
npm install

# 2. Environment
cp .env.example .env.local
#    SESSION_SECRET must be ≥32 chars: openssl rand -base64 32

# 3. Local MongoDB — either:
npm run db:dev                # ephemeral mongodb-memory-server on :27017
#    or run a real mongod with MONGODB_URI from .env.local

# 4. Seed demo data (idempotent — safe to re-run)
npm run seed

# 5. Develop
npm run dev                    # http://localhost:3000
```

## Scripts

| Command | What it does |
| --- | --- |
| `npm run dev` | Start dev server (Turbopack) |
| `npm run build` | Production build |
| `npm run start` | Serve production build |
| `npm run lint` | ESLint |
| `npm run typecheck` | `next typegen` + `tsc --noEmit` |
| `npm run test` | Vitest unit/component tests |
| `npm run test:e2e` | Playwright e2e (auto-starts `next dev`; needs `npm run db:dev` running) |
| `npm run seed` | Idempotent Bengali demo seed |
| `npm run db:dev` | Boot ephemeral MongoDB on port 27017 |

## Seeded demo accounts

| Role | Email | Password |
| --- | --- | --- |
| Admin | `admin@jonosheba.example` | printed by `npm run seed` (or set `ADMIN_SEED_PASSWORD` in `.env.local`) |
| Business | `business1@jonosheba.example` | `business-demo-123` |
| Business | `business2@jonosheba.example` | `business-demo-123` |
| Reviewer (user) | `reviewer@jonosheba.example` | `reviewer-demo-123` |

Seed passwords are **insert-only**: re-running `npm run seed` updates content but never churns existing credentials. An explicitly set `ADMIN_SEED_PASSWORD` is enforced on every run.

Seeded content: 8 categories, 8 demo listings (mixed statuses), 4 reviews, 6 guides with official source links (bdris.gov.bd, passport.gov.bd, teletalk.com.bd, …), 5 demo opportunities (`isDemo: true`), 1 open report, 1 saved listing. Demo content is labelled “ডেমো”; opportunities are always marked demo — no fake claims of real jobs.

## Environment variables (`.env.local`)

| Var | Required | Notes |
| --- | --- | --- |
| `MONGODB_URI` | yes | `mongodb://…` or `mongodb+srv://…` |
| `SESSION_SECRET` | yes | ≥ 32 chars; HMAC key for session JWT |
| `SITE_URL` | yes* | Canonical origin (no trailing slash); defaults to `http://localhost:3000` |
| `ADMIN_SEED_EMAIL` | no | Seed admin email (default `admin@jonosheba.example`) |
| `ADMIN_SEED_PASSWORD` | no | ≥ 8 chars; empty means “generate & print once on first seed” |

`src/lib/env.ts` validates everything at startup; empty strings are treated as unset.

## Architecture

```
src/
├── app/
│   ├── (public pages)        /, /services, /guides, /opportunities, /about, …
│   ├── dashboard/            user: profile, my listings, saved
│   ├── business/             owner: business dashboard, listing create/edit
│   ├── admin/                moderation: listings, reports, users, guides, opps, categories
│   ├── api/                  auth (login/register/logout), listing search, contact-click
│   ├── sitemap.ts, robots.ts
│   └── proxy.ts              request middleware (locale cookie, route protection)
├── actions/                  server actions (listings, profile, reviews, admin)
├── components/               common / layout / search / cards / feature
├── lib/
│   ├── auth/                 scrypt hashing, jose session, requireUser/requireAdmin DAL
│   ├── db/connect.ts         cached mongoose connection
│   ├── services/             data access + DTO mapping (listings, guides, …)
│   ├── validations/          Zod schemas
│   └── env.ts, utils/, constants/
├── models/                   Mongoose schemas
└── types/                    shared DTO types
scripts/                      seed.ts, dev-db.mjs
e2e/                          Playwright specs
```

### Auth & security

- Session: signed JWT (jose, HS256) in an httpOnly, SameSite=Lax `js_session` cookie (7-day expiry).
- Passwords: Node `crypto.scrypt` with per-user salt (no external hashing dep).
- Route protection: `src/proxy.ts` guards `/dashboard`, `/business`, `/admin`; server components additionally call `requireUser()` / `requireAdmin()` (redirect + `next` param preserved).
- Route handlers check `isSameOrigin()` for state-changing requests and apply per-IP/per-key in-memory rate limits (login, register, review, search, contact-click).
- User-uploaded image URLs are restricted to `http(s)`; admin/owner actions re-check ownership server-side.

### Next.js 16 Cache Components notes

This app runs with `cacheComponents: true`, which shaped several patterns:

- **Public reads are cached with tags** — `searchListings`, `getActiveCategories`, `getPublishedGuides`, `getPublishedOpportunities` use `"use cache"` + `cacheTag(…)`. Mutations call `revalidateTag(tag, "max")`.
- **Auth-gated routes are request-time** — pages/layouts behind `requireUser`/`requireAdmin` start with `await connection()` and export `instant = false`, so no static shell is attempted for them.
- **Streaming** — header auth cluster and public list sections render inside `<Suspense>` fallbacks (PPR partial shells).
- **No raw time in prerendered code** — the footer’s year is read inside a `"use cache"` scope; never put bare `new Date()` in a statically rendered tree.

### i18n

Bangla-first UI. A `js_lang` cookie + `LocaleProvider` (`useSyncExternalStore`) enables an EN toggle for chrome strings; deep content stays Bangla. Server components render Bangla by default.

### SEO

- Per-route `metadata` (title/description/canonical/open-graph) with Bangla copy.
- `sitemap.xml` lists static routes + up to 5000 listings / 500 guides / 500 opportunities (DB-failure safe).
- `robots.txt` disallows `/dashboard`, `/business`, `/admin`, `/api/`.
- Detail pages emit JSON-LD (Article/Breadcrumb-ish) where applicable.

## Testing

```bash
npm run test        # 24 unit tests: slugify (Bangla marks), password, rate-limit,
                    # search params, StatusBadge rendering
npm run test:e2e    # 5 specs: home nav, login link, static pages, register, robots
```

## Honest-content policy

- All seeded listings/opportunities/guides are marked demo or carry official source links + review dates.
- Opportunities UI always shows a demo badge; nothing implies a real vacancy.
- The platform is presented as an independent community site — no claim of government affiliation.
