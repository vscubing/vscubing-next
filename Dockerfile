FROM oven/bun:latest

RUN apt-get update && apt-get install -y bash curl unzip
WORKDIR /app
COPY . .

RUN bun install \
  && ./install-vendor.sh
RUN bun run build

# Remove devDependencies from package.json manually because --prune devDependencies doesn't work
# RUN bunx jq 'del(.devDependencies)' package.json > package.json.tmp && \
#     mv package.json.tmp package.json && rm package.json.tml
# RUN bun install 

ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

CMD ["bun", "run", "db:migrate"]
CMD ["bun", "next", "start"]
