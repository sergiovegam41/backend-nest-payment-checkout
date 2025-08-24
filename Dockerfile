# Production-optimized multi-stage build following 2025 best practices
FROM node:22-alpine AS base

# Install security updates
RUN apk --no-cache add dumb-init curl

WORKDIR /app

# Create non-root user for security (early creation)
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nestjs -u 1001

# Builder stage
FROM base AS builder

# Copy package files first for better caching
COPY --chown=nestjs:nodejs package*.json ./

# Install all dependencies for build
RUN npm ci --include=dev && npm cache clean --force

# Copy prisma schema before code for better caching
COPY --chown=nestjs:nodejs prisma ./prisma/

# Generate Prisma client
RUN npx prisma generate

# Copy source code (use .dockerignore to exclude unnecessary files)
COPY --chown=nestjs:nodejs . .

# Build the application
RUN npm run build && \
    npm prune --omit=dev

# Production stage
FROM base AS production

# Switch to non-root user
USER nestjs

# Copy only production dependencies and built app
COPY --from=builder --chown=nestjs:nodejs /app/node_modules ./node_modules
COPY --from=builder --chown=nestjs:nodejs /app/dist ./dist
COPY --from=builder --chown=nestjs:nodejs /app/prisma ./prisma


# Remove health check from Dockerfile (will be in docker-compose)
# Expose port
EXPOSE 3000

# Use dumb-init for proper signal handling and run migrations before starting
CMD ["dumb-init", "sh", "-c", "npx prisma migrate deploy && node dist/main"]