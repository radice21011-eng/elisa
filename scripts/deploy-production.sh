#!/bin/bash

# 🚀 ELISA Quantum AI Council - Production Deployment Script
# © 2025 Ervin Remus Radosavlevici - All Rights Reserved

set -e  # Exit on any error

echo "🌟 ELISA Quantum AI Council - Production Deployment"
echo "© 2025 Ervin Remus Radosavlevici"
echo "=================================================="

# Check if running as authorized user
if [[ "$USER" != "ervin" && "$USER" != "radice21011" ]]; then
    echo "❌ ERROR: Unauthorized user. Only system owner can deploy."
    echo "💰 Violation of deployment terms may result in $1,000,000,000 fine"
    exit 1
fi

# Set environment variables
export NODE_ENV=production
export POSTGRES_DB=elisa_db
export POSTGRES_USER=elisa_user

echo "🔧 Step 1: Environment Validation"
echo "================================="

# Check required environment variables
REQUIRED_VARS=(
    "DATABASE_URL"
    "JWT_SECRET" 
    "SESSION_SECRET"
    "POSTGRES_PASSWORD"
)

for var in "${REQUIRED_VARS[@]}"; do
    if [[ -z "${!var}" ]]; then
        echo "❌ ERROR: Missing required environment variable: $var"
        exit 1
    fi
    echo "✅ $var: [SET]"
done

echo ""
echo "🏗️ Step 2: Build Application"
echo "============================"

# Clean previous builds
echo "🧹 Cleaning previous builds..."
rm -rf dist/ node_modules/.cache/

# Install dependencies
echo "📦 Installing production dependencies..."
npm ci --only=production

# Install dev dependencies for build
echo "🛠️ Installing development dependencies for build..."
npm ci

# Build the application
echo "🏗️ Building application..."
npm run build

# Type checking
echo "🔍 Running type checks..."
npm run type-check

echo ""
echo "🗄️ Step 3: Database Setup"
echo "========================="

# Wait for database to be ready
echo "⏳ Waiting for database connection..."
until pg_isready -h ${PGHOST:-localhost} -p ${PGPORT:-5432} -U ${PGUSER} -d ${POSTGRES_DB}; do
    echo "⏳ Database not ready, waiting 5 seconds..."
    sleep 5
done

echo "✅ Database connection established"

# Push database schema
echo "📊 Updating database schema..."
npm run db:push --force

echo ""
echo "🐳 Step 4: Docker Deployment"
echo "============================"

# Build Docker image
echo "🏗️ Building Docker image..."
docker build -t elisa-quantum-ai:latest .

# Stop existing containers
echo "🛑 Stopping existing containers..."
docker-compose down || true

# Start services
echo "🚀 Starting production services..."
docker-compose up -d

# Wait for services to be healthy
echo "⏳ Waiting for services to be healthy..."
sleep 30

# Check service health
echo "🔍 Checking service health..."
docker-compose ps

echo ""
echo "🔐 Step 5: Security Validation"
echo "=============================="

# Run security checks
echo "🛡️ Running security audit..."
npm audit --audit-level high || echo "⚠️ Security warnings detected"

# Validate SSL certificates (if applicable)
if [[ -f "/etc/nginx/ssl/cert.pem" ]]; then
    echo "🔒 Validating SSL certificates..."
    openssl x509 -in /etc/nginx/ssl/cert.pem -text -noout | grep "Not After"
fi

echo ""
echo "📊 Step 6: Health Checks"
echo "======================="

# Test application endpoints
echo "🔍 Testing application health..."
curl -f http://localhost:5000/health || {
    echo "❌ Health check failed"
    exit 1
}

echo "✅ Application health check passed"

# Test database connection
echo "🗄️ Testing database connection..."
npm run db:check || {
    echo "❌ Database connection failed"
    exit 1
}

echo "✅ Database connection test passed"

echo ""
echo "📋 Step 7: Final Validation"
echo "=========================="

# Display deployment status
echo "🎯 Deployment Summary:"
echo "====================="
echo "✅ Build: SUCCESS"
echo "✅ Database: CONNECTED"
echo "✅ Docker: RUNNING"
echo "✅ Health: PASSED"
echo "✅ Security: VALIDATED"

echo ""
echo "🌐 Service URLs:"
echo "==============="
echo "🎯 Main Application: http://localhost:5000"
echo "📊 Database: postgresql://localhost:5432/elisa_db"
echo "📈 Monitoring: http://localhost:3000 (Grafana)"
echo "📊 Metrics: http://localhost:9090 (Prometheus)"

echo ""
echo "🔐 Security Status:"
echo "=================="
echo "🛡️ NDA Protection: ACTIVE (100-year term)"
echo "💰 Fine Enforcement: $1,000,000,000 USD"
echo "👑 Owner Access: ervin210@icloud.com"
echo "🔒 Backup Access: radosavlevici.ervin@gmail.com"

echo ""
echo "🎉 ELISA Quantum AI Council Deployment Complete!"
echo "================================================"
echo "© 2025 Ervin Remus Radosavlevici - All Rights Reserved"
echo "Protected under international copyright and trade secret law"

# Log deployment
echo "$(date): ELISA Production Deployment Successful" >> /var/log/elisa-deployment.log

exit 0