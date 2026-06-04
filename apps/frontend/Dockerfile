FROM node:22-alpine AS builder

WORKDIR /app

RUN npm install -g pnpm

COPY package.json pnpm-workspace.yaml pnpm.yaml ./
COPY packages/shared ./packages/shared
COPY apps/frontend ./apps/frontend

RUN pnpm install --no-lockfile --ignore-scripts

ARG VITE_API_URL
ENV VITE_API_URL=$VITE_API_URL

RUN pnpm --filter frontend build

FROM nginx:alpine AS runner

COPY --from=builder /app/apps/frontend/dist /usr/share/nginx/html

# Write nginx config at runtime using PORT env var (Railway sets this)
CMD ["/bin/sh", "-c", "printf 'server {\\n  listen %s;\\n  root /usr/share/nginx/html;\\n  index index.html;\\n  location / { try_files $uri $uri/ /index.html; }\\n  location /health { return 200 ok; add_header Content-Type text/plain; }\\n}\\n' \"${PORT:-80}\" > /etc/nginx/conf.d/default.conf && nginx -g 'daemon off;'"]
