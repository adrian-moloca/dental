# Stage 1: Build
FROM node:22-alpine AS builder

# Install pnpm
RUN corepack enable && corepack prepare pnpm@latest --activate

# Set working directory
WORKDIR /app

# Copy package files
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY apps/backend-patient-portal-gateway/package.json ./apps/backend-patient-portal-gateway/
COPY packages/*/package.json ./packages/

# Install dependencies
RUN pnpm install --frozen-lockfile

# Copy source code
COPY . .

# Build the application
RUN pnpm --filter @dentalos/backend-patient-portal-gateway build

# Stage 2: Production
FROM node:22-alpine AS production

# Install pnpm
RUN corepack enable && corepack prepare pnpm@latest --activate

# Install dumb-init for proper signal handling
RUN apk add --no-cache dumb-init

# Create non-root user
RUN addgroup -g 1001 -S dentalos && \
    adduser -S -u 1001 -G dentalos dentalos

# Set working directory
WORKDIR /app

# Copy package files
COPY --chown=dentalos:dentalos package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY --chown=dentalos:dentalos apps/backend-patient-portal-gateway/package.json ./apps/backend-patient-portal-gateway/
COPY --chown=dentalos:dentalos packages/*/package.json ./packages/

# Install production dependencies only
RUN pnpm install --prod --frozen-lockfile

# Copy built application from builder
COPY --chown=dentalos:dentalos --from=builder /app/apps/backend-patient-portal-gateway/dist ./apps/backend-patient-portal-gateway/dist
COPY --chown=dentalos:dentalos --from=builder /app/packages ./packages

# Switch to non-root user
USER dentalos

# Expose port
EXPOSE 3012

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=40s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3012/health/liveness', (r) => { process.exit(r.statusCode === 200 ? 0 : 1) })"

# Start application with dumb-init
ENTRYPOINT ["dumb-init", "--"]
CMD ["node", "apps/backend-patient-portal-gateway/dist/main.js"]
