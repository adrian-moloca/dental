# Stage 1: Build
FROM node:22-alpine AS builder

# Install pnpm
RUN corepack enable && corepack prepare pnpm@latest --activate

# Set working directory
WORKDIR /app

# Copy package files
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY apps/backend-auth/package.json ./apps/backend-auth/
COPY packages/*/package.json ./packages/

# Install dependencies
RUN pnpm install --frozen-lockfile

# Copy source code
COPY . .

# Build the application
RUN pnpm --filter @dentalos/backend-auth build

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
COPY --chown=dentalos:dentalos apps/backend-auth/package.json ./apps/backend-auth/
COPY --chown=dentalos:dentalos packages/*/package.json ./packages/

# Install production dependencies only
RUN pnpm install --prod --frozen-lockfile

# Copy built application from builder
COPY --chown=dentalos:dentalos --from=builder /app/apps/backend-auth/dist ./apps/backend-auth/dist
COPY --chown=dentalos:dentalos --from=builder /app/packages ./packages

# Switch to non-root user
USER dentalos

# Expose port
EXPOSE 3001

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=40s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3001/health/liveness', (r) => { process.exit(r.statusCode === 200 ? 0 : 1) })"

# Start application with dumb-init
ENTRYPOINT ["dumb-init", "--"]
CMD ["node", "apps/backend-auth/dist/main.js"]
