# 🚀 ELISA Quantum AI Council - Production Dockerfile
# Multi-stage build for optimized production deployment

# ===============================================================================
# Stage 1: Base dependencies
# ===============================================================================
FROM node:18-alpine AS base

# Set working directory
WORKDIR /app

# Install system dependencies
RUN apk add --no-cache \
    python3 \
    make \
    g++ \
    postgresql-client \
    curl \
    && rm -rf /var/cache/apk/*

# Copy package files
COPY package*.json ./
COPY tsconfig.json ./

# Install dependencies
RUN npm ci --only=production && npm cache clean --force

# ===============================================================================
# Stage 2: Build stage
# ===============================================================================
FROM base AS builder

# Install all dependencies (including dev)
RUN npm ci

# Copy source code
COPY . .

# Build the application
RUN npm run build

# ===============================================================================
# Stage 3: Production runtime
# ===============================================================================
FROM node:18-alpine AS production

# Set metadata
LABEL maintainer="Ervin Remus Radosavlevici <ervin210@icloud.com>"
LABEL description="ELISA Quantum AI Council - Production Container"
LABEL version="1.0.0"
LABEL vendor="Ervin Remus Radosavlevici"
LABEL license="Proprietary"

# Create non-root user for security
RUN addgroup -g 1001 -S nodejs && \
    adduser -S elisa -u 1001 -G nodejs

# Set working directory
WORKDIR /app

# Copy production dependencies
COPY --from=base /app/node_modules ./node_modules

# Copy built application
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/drizzle.config.ts ./

# Copy server files
COPY --chown=elisa:nodejs server ./server
COPY --chown=elisa:nodejs shared ./shared

# Install production system dependencies
RUN apk add --no-cache \
    postgresql-client \
    curl \
    dumb-init \
    && rm -rf /var/cache/apk/*

# Create necessary directories
RUN mkdir -p /app/logs /app/uploads && \
    chown -R elisa:nodejs /app

# Set environment variables
ENV NODE_ENV=production
ENV PORT=5000
ENV HOST=0.0.0.0

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=60s --retries=3 \
    CMD curl -f http://localhost:5000/health || exit 1

# Security: Drop root privileges
USER elisa

# Expose port
EXPOSE 5000

# Use dumb-init to handle signals properly
ENTRYPOINT ["dumb-init", "--"]

# Start the application
CMD ["node", "server/index.js"]

# ===============================================================================
# Build commands:
# docker build -t elisa-quantum-ai:latest .
# docker run -p 5000:5000 elisa-quantum-ai:latest
# ===============================================================================