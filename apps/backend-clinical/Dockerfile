# Multi-stage Dockerfile for backend-clinical service

# Stage 1: Builder
FROM node:20-alpine AS builder

# Install pnpm
RUN npm install -g pnpm@8

WORKDIR /app

# Copy workspace files
COPY pnpm-workspace.yaml package.json pnpm-lock.yaml ./
COPY packages ./packages
COPY apps/backend-clinical ./apps/backend-clinical

# Install dependencies
RUN pnpm install --frozen-lockfile

# Build shared packages first
RUN pnpm --filter @dentalos/shared-types build
RUN pnpm --filter @dentalos/shared-domain build
RUN pnpm --filter @dentalos/shared-errors build
RUN pnpm --filter @dentalos/shared-validation build
RUN pnpm --filter @dentalos/shared-auth build
RUN pnpm --filter @dentalos/shared-events build

# Build the service
RUN pnpm --filter @dentalos/backend-clinical build

# Stage 2: Production
FROM node:20-alpine AS production

# Install pnpm
RUN npm install -g pnpm@8

WORKDIR /app

# Copy workspace files
COPY pnpm-workspace.yaml package.json pnpm-lock.yaml ./

# Copy built artifacts
COPY --from=builder /app/apps/backend-clinical/dist ./apps/backend-clinical/dist
COPY --from=builder /app/apps/backend-clinical/package.json ./apps/backend-clinical/
COPY --from=builder /app/packages ./packages

# Install production dependencies only
RUN pnpm install --frozen-lockfile --prod

# Expose port
EXPOSE 3005

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3005/health', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"

# Start the service
CMD ["node", "apps/backend-clinical/dist/main"]
