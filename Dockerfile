FROM oven/bun:alpine AS base

# Stage 1: Install dependencies
FROM base AS deps
RUN apk add --no-cache bash curl
WORKDIR /app
COPY package.json bun.lock install-vendor.sh ./
COPY drizzle.config.ts drizzle ./

RUN bun install --no-save --frozen-lockfile \
  && ./install-vendor.sh

# Stage 2: Build the application
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/vendor ./vendor
COPY . .
RUN bun run build

# FROM base as 

# Stage 3: Production server
FROM base AS runner
WORKDIR /app
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=deps /app/node_modules/drizzle-kit ./node_modules/drizzle-kit
COPY --from=deps /app/drizzle.config.ts /app/drizzle ./

ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

CMD ["bun", "run", "db:migrate"]
CMD ["bun", "run", "server.js"]
