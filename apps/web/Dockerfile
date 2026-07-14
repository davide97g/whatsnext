# Build context: apps/web  (set this as the Docker context path in Dokploy)
FROM oven/bun:1.3-alpine AS build
WORKDIR /app
COPY package.json ./
RUN bun install
COPY . .
# VITE_API_URL is baked into the bundle at build time — pass it as a Dokploy build arg.
ARG VITE_API_URL
ENV VITE_API_URL=$VITE_API_URL
RUN bun run build

FROM nginx:1.27-alpine
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 80
