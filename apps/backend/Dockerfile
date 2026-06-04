FROM node:22-alpine AS builder

WORKDIR /app

RUN npm install -g pnpm

# Copy monorepo root files
COPY package.json pnpm-workspace.yaml pnpm-lock.yaml ./

# Disable supply-chain age policy via project .npmrc
RUN echo "minimum-release-age=0s" >> .npmrc

# Copy packages needed for build
COPY packages/shared ./packages/shared
COPY apps/backend ./apps/backend

RUN pnpm install --no-frozen-lockfile

# Build shared first, then backend
RUN pnpm --filter shared build
RUN pnpm --filter backend build

FROM node:22-alpine AS runner

WORKDIR /app

COPY --from=builder /app/apps/backend/dist ./dist
COPY --from=builder /app/apps/backend/node_modules ./node_modules
COPY --from=builder /app/apps/backend/package.json ./
COPY --from=builder /app/node_modules/.pnpm ./node_modules/.pnpm

CMD ["node", "dist/main"]
