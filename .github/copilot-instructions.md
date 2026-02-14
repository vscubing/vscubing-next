# vscubing-next AI Agent Instructions

## Project Overview

Virtual speedcubing platform built with Next.js 15 (App Router), tRPC, Drizzle ORM, and PostgreSQL. Users compete in solving Rubik's Cube puzzles via keyboard-controlled emulators.

## Commands

```bash
bun run dev          # Start dev server with Turbopack
bun run check        # Format, lint, typecheck, and test in sequence
bun run lint:check   # ESLint only
bun run type:check   # TypeScript only
bun test             # Run all tests
bun test path/to/file.spec.ts  # Run single test file

# Database
bun run db:local     # Spin up local PostgreSQL in Docker
bun run db:migrate-no-legacy  # Run migrations (fresh setup)
bun run db:generate  # Generate migration from schema changes
bun run db:studio    # Open Drizzle Studio
```

## Architecture

### Tech Stack

- **Frontend**: Next.js 15 (App Router, Turbopack), React 19, TailwindCSS, Radix UI
- **Backend**: tRPC v11 for type-safe APIs, Drizzle ORM with PostgreSQL
- **Auth**: Custom session-based auth with Oslo/Arctic (Google + WCA OAuth)
- **Cube Engine**: Custom fork `@vscubing/cubing` (based on cubing.js)
- **Runtime**: Bun (not Node.js)

### Directory Structure

- `src/backend/`: Server-side code (DB, tRPC routers, auth, business logic)
  - `api/routers/`: tRPC router definitions
  - `db/schema/`: Drizzle table schemas (split across core.ts, contest.ts, user.ts, account.ts)
  - `shared/`: Backend business logic utilities
- `src/frontend/`: Client components and utilities
  - `shared/`: Reusable React components
  - `ui/`: Base UI components (buttons, tooltips, etc.)
- `src/app/`: Next.js App Router
  - `(app)/`: Main authenticated app
  - `(extras)/`: Landing page (separate layout)
- `src/lib/`: Framework integrations (tRPC, Pusher, utilities)
- `src/types.ts`: Shared domain types (Discipline, ResultDnfable, etc.)

### Path Aliases

Use `@/*` for all imports from `src/`: `@/backend/db`, `@/frontend/ui`, `@/types`

## Key Patterns

### tRPC Usage

```typescript
// Server Components
import { api } from '@/lib/trpc/server'
const data = await api.contest.getOngoing()

// Client Components
import { useTRPC } from '@/lib/trpc/react'
const { data } = useTRPC.contest.getOngoing.useSuspenseQuery()

// Procedure types: publicProcedure, protectedProcedure, adminProcedure
```

### Database Rules

- **NEVER** use `.delete()` or `.update()` without `.where()` - enforced by eslint-plugin-drizzle
- Access via `ctx.db` in tRPC procedures

### Environment Variables

- Validated in `src/env.js` with `@t3-oss/env-nextjs`
- Always import from `@/env`, never use `process.env` directly

## Code Conventions

- Use `'use client'` directive ONLY when needed (interactivity, hooks, browser APIs)
- Use `type` imports: `import type { User } from '@/types'`
- Use `cn()` utility from `@/frontend/utils/cn` for conditional/merged classNames
- Prefer TypeScript `type` over `interface`
- Test files use `.spec.ts` extension (not `.test.ts`)
- Use `<SolveTimeLinkOrDnf>` for clickable solve times with links
- Use `<SolveTimeLabel>` for non-interactive solve times (averages, placeholders)
