# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev          # dev server on localhost:3000
npm run build        # Next.js production build
npm run lint         # ESLint
npm test             # Vitest unit tests (run once)
npm run test:watch   # Vitest in watch mode
npm run test:coverage # coverage report (lcov + text)
npm run test:e2e     # Playwright E2E (requires running server or CI build)
```

Run a single unit test file:
```bash
npx vitest run __tests__/unit/feature-flags.test.ts
```

E2E tests require the dev server or a production build:
```bash
# Local — dev server auto-started by playwright config
npm run test:e2e

# CI — uses npm start (pre-built app must exist)
CI=true npm run test:e2e
```

**Note:** `next.config.mjs` sets `typescript.ignoreBuildErrors: true`, so the build never fails on type errors — run `tsc --noEmit` separately to catch them.

## Architecture

### Stack
Next.js 16 App Router · React 19 · TypeScript · Tailwind CSS v4 · Supabase (backend) · Vitest (unit) · Playwright (E2E)

### Purpose
This is the **staging/homologation platform** for BioAnalytics Pro — a healthcare analytics system. It is not the production app itself; every page validates, simulates, or documents a readiness check for go-live. All pages under `/staging/*` display a warning banner and use mock data.

### Auth layer (dual-mode)

Two auth systems coexist depending on context:

| Layer | Files | What it does |
|---|---|---|
| **Mock auth** (active) | `lib/auth/`, `components/auth-guard.tsx`, `components/app-nav.tsx` | localStorage + cookie session, 5 demo users, 8h TTL |
| **Supabase auth** (wired, inactive) | `lib/supabase/`, `app/auth/callback/route.ts` | Real Supabase Auth — used by API routes, dormant in UI |

The **middleware** (`middleware.ts`) enforces server-side protection by checking the `bioanalytics_auth` cookie (set by the mock auth login). `AuthGuard` (client-side) calls `isSessionValid()` to handle expiry within open tabs.

The 5 mock roles — `admin`, `medico`, `secretaria`, `paciente`, `suporte` — are defined in `lib/staging/types.ts` and shared across both auth systems via `lib/auth/types.ts`.

### Data flow

```
app/layout.tsx
  └─ AuthProvider (lib/auth/context.tsx)   ← session state, login/logout
       └─ AuthGuard (components/auth-guard.tsx) ← redirects unauthenticated
            └─ AppNav (components/app-nav.tsx)  ← top nav with role badge
                 └─ page content
```

API routes (`app/api/`) use the **Supabase server client** (`lib/supabase/server.ts`) and require `NEXT_PUBLIC_SUPABASE_URL` / `NEXT_PUBLIC_SUPABASE_ANON_KEY`. Without those env vars, all API routes return 500 and pages fall back to mock data silently.

### Supabase schema

5 tables defined in `supabase/migrations/001_initial_schema.sql`, typed in `lib/supabase/types.ts`:
- `patients`, `appointments`, `triage_records` — core clinical data
- `audit_logs` — append-only (RLS blocks UPDATE/DELETE)
- `feature_flags_state` — runtime flag overrides per environment

Seed data is in `002_seed_data.sql`.

### Feature flags

`lib/feature-flags/flags.ts` owns the full flag catalogue and evaluation engine. `evaluateFlag(flag, userId, role, env)` applies this priority: **flag disabled → role override → role not targeted → rollout bucket** (deterministic hash of userId % 100). The `/staging/flags` page can merge state from `GET /api/feature-flags` when Supabase is configured.

### Staging modules (`/staging/*`)

Each route is a self-contained interactive dashboard:

| Route | Module | Key lib |
|---|---|---|
| `/staging` | E2E flow simulator | `lib/staging/mock-data.ts` |
| `/staging/perfis` | RBAC permission matrix | `lib/staging/mock-data.ts` → `ROLE_PERMISSIONS` |
| `/staging/rollback` | Incident runbook | `lib/staging/mock-data.ts` → `ROLLBACK_RUNBOOK` |
| `/staging/carga` | Load test simulator | `lib/staging/load-test.ts` |
| `/staging/flags` | Feature flags dashboard | `lib/feature-flags/flags.ts` |
| `/staging/golive` | Go-live checklist (21 items) | `lib/staging/golive-data.ts` |
| `/staging/observabilidade` | Real-time metrics (1s interval) | inline state |
| `/staging/lgpd` | LGPD compliance controls | inline state |

### Testing

- **Unit tests** live in `__tests__/unit/` and cover pure lib functions only (`lib/**/*.ts`). Vitest runs in `node` environment (no DOM).
- **E2E tests** (`__tests__/e2e/staging.spec.ts`) inject a valid admin session into `localStorage` via `page.addInitScript` before each test to bypass `AuthGuard`.
- Coverage is measured only over `lib/**/*.ts`.

### Path alias

`@/` maps to the repo root. Use it for all imports across `app/`, `components/`, `lib/`.
