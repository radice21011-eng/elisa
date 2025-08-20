# 🚀 ELISA Quantum AI Council - Production Deployment Guide

This guide provides comprehensive instructions for deploying the ELISA Quantum AI Council system to production environments.

## 📋 Prerequisites

### System Requirements
- **Server**: Linux (Ubuntu 20.04+ recommended)
- **CPU**: Minimum 2 cores, 4+ cores recommended
- **RAM**: Minimum 4GB, 8GB+ recommended
- **Storage**: Minimum 20GB SSD
- **Network**: Static IP with domain name (optional)

### Software Dependencies
- **Docker**: Version 20.10+
- **Docker Compose**: Version 2.0+
- **Node.js**: Version 18+ (for build process)
- **PostgreSQL**: Version 14+ (if not using Docker)
- **Nginx**: Latest stable (for reverse proxy)

## 🔐 Security Setup

### 1. Environment Configuration

Create production environment file:
```bash
cp .env.example .env.production
```

Configure required variables:
```bash
# Database
DATABASE_URL="postgresql://elisa_user:STRONG_PASSWORD@localhost:5432/elisa_db"

# Security
JWT_SECRET="YOUR_256_BIT_SECRET_KEY"
SESSION_SECRET="YOUR_256_BIT_SESSION_KEY"

# ELISA Owner Access
ELISA_OWNER_EMAIL="ervin210@icloud.com"
ELISA_BACKUP_EMAIL="radosavlevici.ervin@gmail.com"
```

### 2. SSL Certificate Setup

Generate SSL certificates for HTTPS:
```bash
# Using Let's Encrypt (recommended)
sudo certbot certonly --nginx -d yourdomain.com

# Or generate self-signed for testing
openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
    -keyout /etc/nginx/ssl/elisa.key \
    -out /etc/nginx/ssl/elisa.crt
```

### 3. Firewall Configuration

Configure UFW firewall:
```bash
sudo ufw allow 22    # SSH
sudo ufw allow 80    # HTTP
sudo ufw allow 443   # HTTPS
sudo ufw allow 5432  # PostgreSQL (if external access needed)
sudo ufw enable
```

## 🐳 Docker Deployment

### Quick Start
```bash
# Clone repository
git clone https://github.com/radice21011-eng/elisa.git
cd elisa

# Set environment variables
export POSTGRES_PASSWORD="your-secure-password"
export JWT_SECRET="your-jwt-secret"
export SESSION_SECRET="your-session-secret"

# Deploy with Docker Compose
docker-compose up -d

# Check deployment status
docker-compose ps
docker-compose logs -f elisa-app
```

### Production Deployment Script
```bash
# Make deployment script executable
chmod +x scripts/deploy-production.sh

# Run production deployment
./scripts/deploy-production.sh
```

## 🏗️ Manual Deployment

### 1. Build Application
```bash
# Install dependencies
npm ci

# Build for production
npm run build

# Run database migrations
npm run db:push
```

### 2. Process Management
```bash
# Using PM2 (recommended)
npm install -g pm2
pm2 start ecosystem.config.js
pm2 save
pm2 startup

# Using systemd
sudo cp scripts/elisa.service /etc/systemd/system/
sudo systemctl enable elisa
sudo systemctl start elisa
```

### 3. Nginx Configuration
```nginx
# /etc/nginx/sites-available/elisa
server {
    listen 80;
    listen 443 ssl http2;
    server_name yourdomain.com;

    ssl_certificate /etc/nginx/ssl/elisa.crt;
    ssl_certificate_key /etc/nginx/ssl/elisa.key;

    location / {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

Enable site:
```bash
sudo ln -s /etc/nginx/sites-available/elisa /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

## 📊 Database Setup

### PostgreSQL Installation
```bash
# Install PostgreSQL
sudo apt update
sudo apt install postgresql postgresql-contrib

# Create database and user
sudo -u postgres psql
```

```sql
CREATE DATABASE elisa_db;
CREATE USER elisa_user WITH PASSWORD 'secure_password';
GRANT ALL PRIVILEGES ON DATABASE elisa_db TO elisa_user;
\q
```

### Database Configuration
```bash
# Configure PostgreSQL
sudo nano /etc/postgresql/14/main/postgresql.conf

# Key settings:
listen_addresses = 'localhost'
max_connections = 100
shared_buffers = 256MB
effective_cache_size = 1GB
```

### Database Migrations
```bash
# Push schema to database
npm run db:push

# Generate migrations (if needed)
npm run db:generate

# Backup database
pg_dump -U elisa_user -h localhost elisa_db > elisa_backup.sql
```

## 🔍 Monitoring Setup

### Health Checks
```bash
# Application health
curl -f http://localhost:5000/health

# Database health
pg_isready -h localhost -p 5432 -U elisa_user

# Service status
systemctl status elisa
```

### Log Management
```bash
# Application logs
pm2 logs elisa-app

# System logs
journalctl -u elisa -f

# Nginx logs
tail -f /var/log/nginx/access.log
tail -f /var/log/nginx/error.log
```

### Monitoring Tools
```bash
# Start monitoring stack
docker-compose -f docker-compose.monitoring.yml up -d

# Access Grafana: http://localhost:3000
# Access Prometheus: http://localhost:9090
```

## 🔒 Security Hardening

### 1. System Security
```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Configure fail2ban
sudo apt install fail2ban
sudo cp /etc/fail2ban/jail.conf /etc/fail2ban/jail.local

# SSH hardening
sudo nano /etc/ssh/sshd_config
# Set: PermitRootLogin no, PasswordAuthentication no
```

### 2. Application Security
```bash
# Set file permissions
chmod 600 .env.production
chown elisa:elisa /app -R

# Configure rate limiting
# (Already implemented in application)
```

### 3. Database Security
```bash
# Configure pg_hba.conf
sudo nano /etc/postgresql/14/main/pg_hba.conf
# Use 'md5' authentication method

# Set secure postgres password
sudo -u postgres psql
\password postgres
```

## 🔄 Backup & Recovery

### Automated Backups
```bash
# Database backup script
#!/bin/bash
BACKUP_DIR="/var/backups/elisa"
DATE=$(date +%Y%m%d_%H%M%S)
pg_dump -U elisa_user elisa_db > $BACKUP_DIR/elisa_backup_$DATE.sql
```

### Recovery Procedures
```bash
# Restore from backup
psql -U elisa_user -d elisa_db < /var/backups/elisa/elisa_backup_20250120.sql

# Container recovery
docker-compose down
docker-compose up -d
```

## 🚀 Performance Optimization

### 1. Database Optimization
```sql
-- Create indexes for performance
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_metrics_timestamp ON metrics(timestamp);
CREATE INDEX idx_audit_logs_timestamp ON audit_logs(timestamp);
```

### 2. Caching Setup
```bash
# Redis for session storage
docker run -d --name elisa-redis \
  -p 6379:6379 \
  redis:7-alpine redis-server --requirepass "secure_password"
```

### 3. CDN Configuration
```nginx
# Static asset caching
location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
    expires 1y;
    add_header Cache-Control "public, immutable";
}
```

## 🔧 Troubleshooting

### Common Issues

1. **Database Connection Failed**
```bash
# Check PostgreSQL status
sudo systemctl status postgresql

# Check connection
pg_isready -h localhost -p 5432
```

2. **Application Won't Start**
```bash
# Check logs
npm run logs
docker-compose logs elisa-app

# Check environment
env | grep ELISA
```

3. **Permission Denied**
```bash
# Fix file permissions
sudo chown -R elisa:elisa /app
chmod +x scripts/deploy-production.sh
```

### Health Check Endpoints
- `GET /health` - Basic health status
- `GET /api/health/db` - Database connectivity
- `GET /api/health/detailed` - Comprehensive system status

## 📞 Support & Maintenance

### Regular Maintenance Tasks
1. **Weekly**: Update security patches
2. **Monthly**: Database optimization and cleanup
3. **Quarterly**: Security audit and penetration testing
4. **Annually**: SSL certificate renewal

### Emergency Contacts
- **System Owner**: ervin210@icloud.com
- **Backup Contact**: radosavlevici.ervin@gmail.com

### Incident Response
1. Identify and contain the issue
2. Document the incident
3. Implement temporary fixes
4. Plan permanent resolution
5. Post-incident review

---

## 📜 Legal Compliance

This deployment guide is for authorized personnel only. The ELISA Quantum AI Council system is protected under:

- **100-Year NDA**: Comprehensive confidentiality agreement
- **$1,000,000,000 Fine**: Enforcement for unauthorized disclosure
- **International Copyright**: Protected under global intellectual property law
- **Trade Secret Protection**: Proprietary algorithms and methods

Unauthorized deployment or access constitutes a serious legal violation.

**© 2025 Ervin Remus Radosavlevici - All Rights Reserved**

---

## ✅ Deployment Checklist

- [ ] Server provisioning and security hardening
- [ ] SSL certificates installed and configured
- [ ] Environment variables set securely
- [ ] Database installed and configured
- [ ] Application built and deployed
- [ ] Reverse proxy configured (Nginx)
- [ ] Monitoring and logging setup
- [ ] Backup procedures implemented
- [ ] Health checks validated
- [ ] Security audit completed
- [ ] Documentation updated
- [ ] Emergency procedures tested

**⚡ ELISA Quantum AI Council - Production Deployment Complete ⚡**