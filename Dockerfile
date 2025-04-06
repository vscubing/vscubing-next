FROM oven/bun:alpine AS base
RUN apk add --no-cache bash curl

# Stage 1: Install dependencies
FROM base AS deps
WORKDIR /app
COPY package.json bun.lock ./install-vendor.sh ./
RUN bun install --no-save --frozen-lockfile \
  && ./install-vendor.sh

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
ENV NODE_ENV=staging
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next ./.next 
COPY --from=builder /app/node_modules ./node_modules

ENV PORT 3001
ENV HOSTNAME "localhost"

EXPOSE 3001

CMD ["bun", "run", "server.js"]
