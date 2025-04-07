FROM oven/bun:latest AS base

# Stage 1: Install dependencies
FROM base AS deps
RUN apt update && apt install curl bash unzip -y
WORKDIR /app
COPY package.json bun.lock install-vendor.sh ./
RUN bun install --no-save --frozen-lockfile && ./install-vendor.sh

# Stage 2: Build the application
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/vendor ./vendor
COPY . .
RUN bun run build

# Stage 3: Production server
FROM base AS runner
WORKDIR /app
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static

ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

# CMD ["bun", "run", "db:migrate"]

CMD ["bun", "run", "server.js"]
