# Build stage
FROM node:20-alpine AS builder

# Install build dependencies
RUN apk add --no-cache libc6-compat

WORKDIR /app

# Install pnpm globally
RUN npm install -g pnpm@8

# Copy only dependency files first (better layer caching)
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./

# Copy workspace packages for dependency resolution
COPY packages/shared-auth/package.json ./packages/shared-auth/
COPY packages/shared-domain/package.json ./packages/shared-domain/
COPY packages/shared-errors/package.json ./packages/shared-errors/
COPY packages/shared-events/package.json ./packages/shared-events/
COPY packages/shared-infra/package.json ./packages/shared-infra/
COPY packages/shared-types/package.json ./packages/shared-types/
COPY packages/shared-validation/package.json ./packages/shared-validation/
COPY apps/backend-enterprise-service/package.json ./apps/backend-enterprise-service/

# Install dependencies (this layer will be cached unless package files change)
RUN pnpm install --frozen-lockfile --prod=false

# Copy source code
COPY packages ./packages
COPY apps/backend-enterprise-service ./apps/backend-enterprise-service

# Build the application
WORKDIR /app/apps/backend-enterprise-service
RUN pnpm build

# Remove dev dependencies
WORKDIR /app
RUN pnpm install --frozen-lockfile --prod

# Production stage
FROM node:20-alpine AS production

# Install dumb-init for proper signal handling
RUN apk add --no-cache dumb-init

WORKDIR /app

# Copy only production dependencies
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/apps/backend-enterprise-service/dist ./dist
COPY --from=builder /app/apps/backend-enterprise-service/package.json ./package.json

# Create non-root user for security
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nestjs -u 1001 && \
    chown -R nestjs:nodejs /app

# Switch to non-root user
USER nestjs

# Expose application port
EXPOSE 3017

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=40s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3017/health/liveness', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"

# Set production environment
ENV NODE_ENV=production \
    NODE_OPTIONS="--max-old-space-size=512" \
    PORT=3017

# Use dumb-init to handle signals properly
ENTRYPOINT ["dumb-init", "--"]

# Start the application
CMD ["node", "dist/apps/backend-enterprise-service/src/main.js"]
