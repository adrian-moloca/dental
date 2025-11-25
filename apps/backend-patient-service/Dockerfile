# Multi-stage Dockerfile for backend-patient-service
# Stage 1: Builder
FROM node:20-alpine AS builder

# Install build tools
RUN apk add --no-cache python3 make g++

WORKDIR /app

# Copy package files
COPY package.json pnpm-lock.yaml ./
COPY packages ./packages
COPY apps/backend-patient-service ./apps/backend-patient-service

# Install pnpm and dependencies
RUN npm install -g pnpm@8 && \
    pnpm install --frozen-lockfile --filter @dentalos/backend-patient-service...

# Build the service
WORKDIR /app/apps/backend-patient-service
RUN pnpm build

# Stage 2: Production
FROM node:20-alpine

# Add non-root user for security
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nestjs -u 1001

WORKDIR /app

# Copy built application and dependencies
COPY --from=builder --chown=nestjs:nodejs /app/apps/backend-patient-service/dist ./dist
COPY --from=builder --chown=nestjs:nodejs /app/node_modules ./node_modules
COPY --from=builder --chown=nestjs:nodejs /app/apps/backend-patient-service/package.json ./

# Switch to non-root user
USER nestjs

# Expose port
EXPOSE 3004

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3004/health/liveness', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"

# Start the application
CMD ["node", "dist/main"]
