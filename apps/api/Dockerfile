# Build context: apps/api  (set this as the Docker context path in Dokploy)
FROM oven/bun:1.3-alpine AS deps
WORKDIR /app
COPY package.json ./
RUN bun install

FROM oven/bun:1.3-alpine
WORKDIR /app
ENV NODE_ENV=production
COPY --from=deps /app/node_modules ./node_modules
COPY . .
EXPOSE 3000
# Apply migrations, then start the server.
CMD ["sh", "-c", "bun run migrate && bun run start"]
