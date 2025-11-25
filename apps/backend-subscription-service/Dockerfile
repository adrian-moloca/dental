# syntax=docker/dockerfile:1.6

# ============================================================================
# Stage 1: Builder - Build application and dependencies
# ============================================================================
FROM node:22-alpine AS builder

# Install build dependencies
RUN apk add --no-cache python3 make g++

# Enable corepack for pnpm
RUN corepack enable && corepack prepare pnpm@10.22.0 --activate

WORKDIR /workspace

# Copy workspace configuration
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml nx.json tsconfig.base.json ./

# Copy all package.json files for dependency resolution
COPY apps/backend-subscription-service/package.json ./apps/backend-subscription-service/
COPY packages/shared-types/package.json ./packages/shared-types/
COPY packages/shared-domain/package.json ./packages/shared-domain/
COPY packages/shared-validation/package.json ./packages/shared-validation/
COPY packages/shared-auth/package.json ./packages/shared-auth/
COPY packages/shared-errors/package.json ./packages/shared-errors/
COPY packages/shared-events/package.json ./packages/shared-events/
COPY packages/shared-infra/package.json ./packages/shared-infra/
COPY packages/shared-security/package.json ./packages/shared-security/
COPY packages/shared-testing/package.json ./packages/shared-testing/
COPY packages/shared-tracing/package.json ./packages/shared-tracing/

# Install all dependencies
RUN pnpm install --frozen-lockfile

# Copy source code
COPY packages ./packages
COPY apps/backend-subscription-service ./apps/backend-subscription-service

# Build shared packages
RUN pnpm --filter @dentalos/shared-types build && \
    pnpm --filter @dentalos/shared-domain build && \
    pnpm --filter @dentalos/shared-validation build && \
    pnpm --filter @dentalos/shared-auth build && \
    pnpm --filter @dentalos/shared-errors build && \
    pnpm --filter @dentalos/shared-events build && \
    pnpm --filter @dentalos/shared-infra build && \
    pnpm --filter @dentalos/shared-security build && \
    pnpm --filter @dentalos/shared-testing build && \
    pnpm --filter @dentalos/shared-tracing build

# Build the subscription service
RUN pnpm --filter @dentalos/backend-subscription-service build

# Prune dev dependencies
RUN pnpm --filter @dentalos/backend-subscription-service --prod deploy /prod/backend-subscription-service

# ============================================================================
# Stage 2: Production - Minimal runtime image
# ============================================================================
FROM node:22-alpine AS production

# Install runtime dependencies
RUN apk add --no-cache dumb-init curl

# Create non-root user
RUN addgroup -g 1001 -S dentalos && \
    adduser -S -u 1001 -G dentalos dentalos

WORKDIR /app

# Copy production dependencies and built artifacts
COPY --chown=dentalos:dentalos --from=builder /prod/backend-subscription-service ./

# Copy built packages
COPY --chown=dentalos:dentalos --from=builder /workspace/packages ./packages

# Switch to non-root user
USER dentalos

# Expose port
EXPOSE 3007

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=60s --retries=3 \
  CMD curl -f http://localhost:3007/api/v1/health/liveness || exit 1

# Use dumb-init for proper signal handling
ENTRYPOINT ["dumb-init", "--"]

# Start application
CMD ["node", "dist/main.js"]
