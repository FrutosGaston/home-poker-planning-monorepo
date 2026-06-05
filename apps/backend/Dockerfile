FROM node:22-alpine AS builder

WORKDIR /app

RUN npm install -g pnpm

COPY package.json pnpm-workspace.yaml pnpm.yaml ./
COPY packages/shared ./packages/shared
COPY apps/backend ./apps/backend

RUN pnpm install --no-lockfile --ignore-scripts

# Build shared first, then backend
RUN pnpm --filter shared build
RUN pnpm --filter backend build

FROM node:22-alpine AS runner

WORKDIR /app

COPY --from=builder /app/apps/backend/dist ./dist
COPY --from=builder /app/apps/backend/node_modules ./node_modules
COPY --from=builder /app/apps/backend/package.json ./
COPY --from=builder /app/node_modules/.pnpm ./node_modules/.pnpm

# Run seed (errors are logged but won't block startup), then start app
CMD ["sh", "-c", "node /app/dist/seed.js || echo 'Seed failed, continuing...' && node /app/dist/main"]
