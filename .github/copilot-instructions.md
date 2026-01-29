# vscubing-next AI Agent Instructions

## Project Overview

Virtual speedcubing platform built with Next.js 15 (App Router), tRPC, Drizzle ORM, and PostgreSQL. Users compete in solving Rubik's Cube puzzles via keyboard-controlled emulators.

## Architecture

### Tech Stack

- **Frontend**: Next.js 15 (App Router, Turbopack), React 19, TailwindCSS, Radix UI
- **Backend**: tRPC v11 for type-safe APIs, Drizzle ORM with PostgreSQL
- **Auth**: Custom session-based auth with Oslo/Arctic (Google + WCA OAuth)
- **Real-time**: Pusher (development uses local Soketi server on port 6001)
- **Cube Engine**: Custom fork `@vscubing/cubing` (based on cubing.js)
- **Runtime**: Bun (not Node.js)

### Directory Structure

- `src/backend/`: Server-side code (DB, tRPC routers, auth, business logic)
  - `api/routers/`: tRPC router definitions (contest, user, round-session, etc.)
  - `db/schema/`: Drizzle table schemas in separate files
  - `auth/`: Custom session management, OAuth providers
  - `shared/`: Reusable backend utilities
- `src/frontend/`: Client components and utilities
  - `shared/`: Reusable React components
  - `ui/`: Base UI components (buttons, tooltips, etc.)
- `src/app/`: Next.js App Router structure
  - `(app)/`: Main authenticated app with shared layout
  - `(extras)/`: Landing page and marketing (separate layout)
  - `api/`: Next.js API routes (auth callbacks, webhooks, Pusher auth)
- `src/lib/`: Framework integrations (tRPC, Pusher, utilities)
- `vendor/`: Third-party code (cstimer puzzle implementations)
- `drizzle/`: Database migrations
- `socket-server/`: Experimental Socket.io server (not currently used)

### Path Aliases

Use `@/*` for all imports from `src/`: `@/backend/db`, `@/frontend/ui`, `@/types`, etc.

## Development Workflow

### Commands

- `bun run dev`: Start dev server with Turbopack
- `bun run db:local`: Spin up local PostgreSQL in Docker
- `bun run db:migrate-no-legacy`: Run migrations without legacy import
- `bun run db:studio`: Open Drizzle Studio
- `bun run check`: Format, lint, typecheck, and test in sequence
- Tests: Use Bun's built-in test runner (`.spec.ts` files)

### Database Workflow

1. Modify schemas in `src/backend/db/schema/`
2. Generate migration: `bun run db:generate` or `bun run db:custom --name description`
3. Apply: `bun run db:migrate` (or `db:migrate-no-legacy`)
4. Custom SQL migrations go in `drizzle/*.sql`

### Authentication Flow

- Session cookies managed in middleware (`src/middleware.ts`)
- Auth checked via `auth()` function (React cache wrapper)
- OAuth callbacks in `src/app/api/auth/`
- Protections: publicProcedure, protectedProcedure, adminProcedure in tRPC

## Code Conventions

### React Components

- Use `'use client'` directive ONLY when needed (interactivity, hooks, browser APIs)
- Server components by default - prefer server-side data fetching with `api.router.query()`
- Client components: Use tRPC hooks via `useTRPC()` from `@/lib/trpc/react`
- Route groups: `(app)` for main app, `(extras)` for landing/marketing

### tRPC Patterns

```typescript
// Server-side queries (in Server Components)
import { api } from '@/lib/trpc/server'
const data = await api.contest.getOngoing()

// Client-side (in Client Components with 'use client')
import { useTRPC } from '@/lib/trpc/react'
const { data } = useTRPC.contest.getOngoing.useSuspenseQuery()

// Routers live in src/backend/api/routers/
// Use publicProcedure, protectedProcedure, or adminProcedure
```

### Database Access

- NEVER use `.delete()` or `.update()` without `.where()` - enforced by eslint-plugin-drizzle
- Access via `ctx.db` in tRPC procedures
- Schemas split across `src/backend/db/schema/{core,contest,user,account}.ts`
- Import all from `schema/index.ts`

### Styling

- TailwindCSS with custom design system (see `tailwind.config.ts`)
- Custom color palette: `primary`, `secondary`, `black`, `grey`, `yellow`, `red`
- Responsive breakpoints: `sm` (767px), `md` (1023px), `lg` (1365px) - all max-width
- Typography classes: `heading-1` through `heading-5`, `body`, `caption`, `note`
- Use `cn()` utility from `@/frontend/utils/cn` for conditional classes

### Type Safety

- Strict TypeScript with `noUncheckedIndexedAccess: true`
- tRPC provides end-to-end type safety
- Use `type` imports: `import type { User } from '@/types'`
- Shared types in `src/types.ts`

### Environment Variables

- Validated with `@t3-oss/env-nextjs` in `src/env.js`
- Access via `import { env } from '@/env'`
- Never access `process.env` directly except in `env.js`
- Server vars require `DATABASE_URL`, OAuth credentials, etc.
- Client vars prefixed `NEXT_PUBLIC_` (APP_ENV, POSTHOG_KEY, SOLVE_SECRET)

## Key Integration Points

### Cube Simulation

- Uses forked `@vscubing/cubing` package (version `0.57.0-vscubing.1`)
- Import from subpaths: `@vscubing/cubing/alg`, `@vscubing/cubing/puzzles`, `@vscubing/cubing/twisty`
- Vendor cstimer code in `vendor/cstimer/` for legacy puzzle support

### Real-time (Pusher/Soketi)

- Server: `pusherServer` from `@/lib/pusher/pusher-server`
- Client: Use `usePusherChannel()` hook from `@/lib/pusher/pusher-client`
- Local dev: Run Soketi via Docker: `docker run -p 6001:6001 -p 9601:9601 quay.io/soketi/soketi:1.4-16-debian`
- Auth endpoint: `/api/pusher/auth-channel`

### External Services

- TNoodle: External scramble generator (optional in dev, required in prod)
- Telegram: Notifications via bot API
- PostHog: Analytics (disabled in dev/staging)

## Common Patterns

### Middleware & CSRF

- Session cookie auto-extended on GET requests
- CSRF protection checks Origin vs Host headers
- Webhooks bypass middleware via `WEBHOOKS_PATHS` allowlist

### Development Features

- `DEV_ARTIFICIAL_DELAY=ENABLED` simulates network latency in tRPC
- Admin access granted to all users in non-production environments

### Testing

- Test files: `*.spec.ts` (not `.test.ts`)
- Run with `bun test`
- Examples: `validate-solve.spec.ts`, `calculate-avg.spec.ts`

## Deployment

- Hosted on DigitalOcean Droplet with Dokploy
- Production: `main` branch (PR-only, CI required)
- Staging: `dev` branch
- Output: `standalone` mode in Next.js
- Docker: Uses GitHub Container Registry (ghcr.io/vscubing/vscubing-next)

## Anti-Patterns to Avoid

- Don't bypass Drizzle safety guards - always use `.where()` with updates/deletes
- Don't import from deep paths - use path aliases (`@/` not `../../`)
- Don't use `process.env` directly - import from `@/env`
- Don't add `'use client'` unnecessarily - keep server components where possible
- Don't ignore TypeScript errors - eslint/tsc errors are disabled in builds but should be fixed
