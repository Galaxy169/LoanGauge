# syntax=docker/dockerfile:1

# ---- Build stage --------------------------------------------------------
# Produces a static dist/ build. No runtime config baked in here on
# purpose — see src/utils/runtimeConfig.js for why (one image, many
# environments, via env-config.js instead of VITE_* build args).
FROM node:20-alpine AS build
WORKDIR /app

# Copy manifest files first so `npm ci` is cached across builds that only
# change application code, not dependencies.
COPY package.json package-lock.json* ./
RUN npm ci

COPY . .
RUN npm run build

# ---- Runtime stage --------------------------------------------------------
FROM nginx:1.27-alpine AS runtime

RUN rm -rf /usr/share/nginx/html/*
COPY --from=build /app/dist /usr/share/nginx/html
COPY docker/nginx.conf /etc/nginx/conf.d/default.conf

# Runs automatically before nginx starts — see docker/entrypoint.sh for
# what it does and why it lives in this specific directory.
COPY docker/entrypoint.sh /docker-entrypoint.d/40-runtime-config.sh
RUN chmod +x /docker-entrypoint.d/40-runtime-config.sh

EXPOSE 80

HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget -q -O /dev/null http://localhost/healthz || exit 1