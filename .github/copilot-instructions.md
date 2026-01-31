# vscubing-next AI Agent Instructions

## Project Overview

Virtual speedcubing platform built with Next.js 15 (App Router), tRPC, Drizzle ORM, and PostgreSQL. Users compete in solving Rubik's Cube puzzles via keyboard-controlled emulators.

## Architecture

### Tech Stack

- **Frontend**: Next.js 15 (App Router, Turbopack), React 19, TailwindCSS, Radix UI
- **Backend**: tRPC v11 for type-safe APIs, Drizzle ORM with PostgreSQL
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

## Do's

- Use <SolveTimeLinkOrDnf> component for displaying finished solve times, they look like 00:00:000 or DNF and have id's
- use <SolveTimeLabel> component for displaying average times and placeholders, they look like 00:00:000 or DNF
- Use types from ./src/types.ts if applicable
