FROM oven/bun:slim AS base

# Stage 1: Install dependencies
FROM base AS deps
WORKDIR /app
COPY package.json bun.lock ./
RUN bun install --no-save --frozen-lockfile

# Stage 2: Build the application
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN bun run build

# Stage 3: Production server
FROM base AS runner
WORKDIR /app
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY scripts ./scripts
COPY drizzle ./drizzle
COPY drizzle.config.ts ./drizzle.config.ts

ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

EXPOSE 3000

# curl is necessary for swarm health checks
CMD apk add curl bash unzip; bun run vendor; rm package.json; bun install drizzle-orm postgres; bunx drizzle-kit migrate; bun run server.js
