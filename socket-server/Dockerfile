FROM oven/bun:slim AS base

# Stage 1: Install dependencies
FROM base AS deps
WORKDIR /app
COPY package.json bun.lock ./
RUN bun install --no-save --frozen-lockfile

# Stage 2: Production server
FROM base AS runner
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY socket-server ./socket-server

ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

EXPOSE 3000

CMD ["bun", "run", "socket-server/index.ts"]
