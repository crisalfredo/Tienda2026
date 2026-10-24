# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project layout

Two independent npm packages in one repo:

- **Root** — React 19 + Vite 7 + Tailwind 4 frontend (public store + admin panel). Served on `http://localhost:5173`.
- **`backend/`** — Express 5 + Prisma + PostgreSQL API. Served on `http://localhost:4000/api`.

Each has its own `package.json`, `tsconfig`, and `node_modules`. Install both: `npm install` **and** `npm --prefix backend install`.

## Common commands

```bash
# Dev (run from root)
npm run dev:all                       # frontend + backend together (concurrently)
npm run dev                           # frontend only
npm run dev:backend                   # backend only (tsx watch)
docker compose up -d postgres         # local PostgreSQL 17 (urbano/urbano_dev @ 5432)

# Database (Prisma, backend package)
npm --prefix backend run prisma:deploy   # apply migrations
npm --prefix backend run prisma:seed     # seed 4 categories, 8 products, 1 superadmin
npm --prefix backend run prisma:migrate  # create a new migration in dev

# Build
npm run build                         # frontend: tsc -b && vite build -> dist/
npm run build:all                     # frontend + backend (backend -> backend/dist/)
npm --prefix backend run build        # backend only (tsc)
npm --prefix backend run start        # run compiled backend (node dist/server.js)
```

There is **no test runner and no linter configured**. The only automated check is the TypeScript compiler (`tsc`), which the build scripts run.

## Non-obvious conventions

- **ESM throughout** (`"type": "module"`). The backend uses NodeNext resolution, so **relative imports in backend TypeScript must carry a `.js` extension** (e.g. `import { prisma } from '../../lib/prisma.js'`) even though the source file is `.ts`. Omitting it breaks the build/runtime.
- Backend requires **Node >= 22**.
- `backend/src/config/env.ts` validates all env vars with Zod and **calls `process.exit(1)` on failure** — the server will not boot with a missing/short `JWT_ACCESS_SECRET` (min 32 chars) or missing `DATABASE_URL`.
- Env files are split: root `.env` (`VITE_*` vars for the frontend) and `backend/.env`. Copy from the respective `.env.example`. `FRONTEND_ORIGIN` may be a comma-separated list; it becomes the CORS allowlist.
- Prices/totals are Prisma `Decimal` in the DB and converted to `number` in DTOs before sending to the client — follow the existing `number(value)` DTO pattern in the modules.

## Backend architecture

- `backend/src/app.ts` assembles the Express app: Helmet, CORS (exact-origin allowlist from `env`), global rate limit, JSON/body parsers, cookie-parser, then mounts one router per module, then `notFound` + `errorHandler` last.
- **Feature modules** live in `backend/src/modules/<feature>/` (`auth`, `categories`, `products`, `orders`, `admin`, `settings`). Each exports an Express `Router`. Products split public vs. admin routes into separate routers.
- **Cross-cutting middleware** in `backend/src/middleware/`: `authenticate`/`authorize` (JWT + role gate), `requireCsrf` (double-submit CSRF), `validate` (Zod schema validation). `lib/` holds `prisma`, `auth` (tokens/cookies), `cloudinary`, `http-error`. Errors are thrown as `HttpError` and shaped by the central error handler.
- **Response envelope**: success is `{ "data": ... }`; errors are `{ "error": { "message", "code" } }`. The frontend `parse()` helper depends on this shape.

### Auth & security model

Admin-only authentication (customer accounts are a future feature). Passwords use **Argon2id**. A short-lived **access JWT** lives in an HttpOnly cookie; a random **refresh token** is rotated on use and stored only as a SHA-256 hash (`RefreshSession` table). Cookie names switch to `__Host-` prefixes and `Secure` in production (see `lib/auth.ts`). CSRF uses a non-HttpOnly double-submit cookie echoed back via the `X-CSRF-Token` header. See `SECURITY.md` for the full control list and pre-production checklist.

### Order flow

Client sends only variant IDs + quantities. The backend recomputes current prices and checks inventory, creates the order as `AWAITING_CONFIRMATION`, and returns a WhatsApp deep link. Inventory is decremented when an order is confirmed and restocked if it is cancelled before delivery. Order numbers follow `USV-YYYYMMDD-XXXXXX`. Status lifecycle: `AWAITING_CONFIRMATION → CONFIRMED → PREPARING → SHIPPED → DELIVERED` (or `CANCELLED`).

### Data model (Prisma, `backend/prisma/schema.prisma`)

`User`, `RefreshSession`, `Category`, `Product`, `ProductImage`, `ProductOption`, `OptionValue`, `ProductVariant`, `VariantOptionValue`, `Order`, `OrderItem`, `StoreSettings`, `AuditLog`. Products support options (size/color/etc.) that combine into priced, inventoried variants with SKUs. Products and categories are **archived logically**, not hard-deleted.

## Frontend architecture

- **Routing** (`src/App.tsx`, React Router 7): public pages render inside `<Layout>`; the admin area is gated by `<AdminRoute>` and rendered inside `<AdminLayout>` under `/admin/*`. Admin login is at `/admin/login`.
- **State** via three React contexts in `src/context/`: `CatalogContext` (products/categories), `CartContext` (persistent cart, cleared after order creation), `AdminAuthContext` (admin session).
- **All HTTP goes through `src/services/api.ts`.** It sends `credentials: 'include'`, lazily fetches and caches the CSRF token, and attaches `X-CSRF-Token` to protected mutations. Base URL comes from `VITE_API_URL`. Do not call `fetch` directly from components.
- **Demo mode**: `VITE_ENABLE_DEMO_DATA=true` lets the public store render from `src/data/catalog.ts` when the API is down. It never enables the admin panel or real orders — set it to `false` in production.

## Deployment

Frontend deploys to **Vercel** as static files; `vercel.json` rewrites `/api/*` to the Render-hosted backend and serves `index.html` for all other paths (SPA). The backend expects `VITE_API_URL` (frontend) and `FRONTEND_ORIGIN` (backend CORS) to point at the real HTTPS domains in production.
