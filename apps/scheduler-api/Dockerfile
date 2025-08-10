# Multi-stage build for efficient image size
FROM node:20-alpine AS builder

# Install dependencies only when needed
WORKDIR /app

# Copy root package files
COPY package.json yarn.lock ./

# Copy workspace packages
COPY libs/proto/package.json ./libs/proto/
COPY apps/scheduler-api/package.json ./apps/scheduler-api/

# Install dependencies
RUN yarn install --frozen-lockfile

# Copy source code
COPY . .

# Build proto package first (copy .proto only)
RUN yarn nx build proto

# Build the application
RUN yarn nx build scheduler-api

# Production stage
FROM node:20-alpine AS runner

WORKDIR /app

# Create non-root user for security
RUN addgroup -g 1001 -S nodejs && adduser -S nestjs -u 1001

# Copy built application
COPY --from=builder --chown=nestjs:nodejs /app/dist/apps/scheduler-api ./dist
# Copy shared .proto asset
COPY --from=builder --chown=nestjs:nodejs /app/dist/libs/proto ./libs/proto
COPY --from=builder --chown=nestjs:nodejs /app/package.json ./package.json
COPY --from=builder --chown=nestjs:nodejs /app/yarn.lock ./yarn.lock

# Install only production dependencies
RUN yarn install --frozen-lockfile --production && yarn cache clean

# Switch to non-root user
USER nestjs

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3000/api/health', (res) => { process.exit(res.statusCode === 200 ? 0 : 1); })"

# Expose port
EXPOSE 3000

# Start the application
CMD ["node", "dist/main.js"]
