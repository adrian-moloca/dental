# Multi-stage Dockerfile for Health Aggregator Service
# Stage 1: Build dependencies and compile TypeScript

FROM node:20-alpine AS builder

# Install build dependencies
RUN apk add --no-cache python3 make g++

# Set working directory
WORKDIR /app

# Copy package files
COPY package.json pnpm-lock.yaml* ./
COPY apps/backend-health-aggregator/package.json ./apps/backend-health-aggregator/
COPY packages/shared-infra/package.json ./packages/shared-infra/
COPY packages/shared-config/package.json ./packages/shared-config/
COPY packages/shared-types/package.json ./packages/shared-types/

# Install pnpm
RUN npm install -g pnpm

# Install dependencies
RUN pnpm install --frozen-lockfile

# Copy source code
COPY apps/backend-health-aggregator ./apps/backend-health-aggregator
COPY packages ./packages
COPY tsconfig.base.json ./

# Build the application
WORKDIR /app/apps/backend-health-aggregator
RUN pnpm run build

# Stage 2: Production runtime
FROM node:20-alpine AS runner

# Install production dependencies only
RUN apk add --no-cache dumb-init

# Create non-root user
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nestjs -u 1001

# Set working directory
WORKDIR /app

# Copy package files
COPY --from=builder /app/package.json /app/pnpm-lock.yaml* ./
COPY --from=builder /app/apps/backend-health-aggregator/package.json ./apps/backend-health-aggregator/

# Install pnpm
RUN npm install -g pnpm

# Install production dependencies only
RUN pnpm install --prod --frozen-lockfile

# Copy built application
COPY --from=builder --chown=nestjs:nodejs /app/apps/backend-health-aggregator/dist ./apps/backend-health-aggregator/dist
COPY --from=builder --chown=nestjs:nodejs /app/packages ./packages

# Switch to non-root user
USER nestjs

# Expose port
EXPOSE 3099

# Health check
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3099/api/v1/health/liveness', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"

# Use dumb-init to handle signals properly
ENTRYPOINT ["dumb-init", "--"]

# Start application
CMD ["node", "apps/backend-health-aggregator/dist/main.js"]
