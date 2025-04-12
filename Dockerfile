FROM oven/bun:slim

WORKDIR /app
COPY . .
RUN bun install --no-save --frozen-lockfile
RUN apt update && apt install curl unzip -y && bun run vendor

CMD bunx drizzle-kit migrate && bun run start -H 0.0.0.0
