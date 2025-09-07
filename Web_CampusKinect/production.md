# CampusKinect Web Frontend - Production Deployment Guide

This guide covers how to deploy the CampusKinect web frontend to production environments.

## 🚀 Quick Start

1. **Set up environment variables** (see [Environment Configuration](#environment-configuration))
2. **Choose deployment method** (see [Deployment Methods](#deployment-methods))
3. **Run deployment script**: `./deploy.sh`

## 📋 Prerequisites

### Required Software
- Node.js 18+ 
- Docker & Docker Compose (for container deployment)
- nginx (for reverse proxy setup)

### Domain & SSL Setup
- Domain name pointing to your server
- SSL certificate (Let's Encrypt recommended)

## 🔧 Environment Configuration

### 1. Create Production Environment File

**⚠️ Important**: Never commit `.env.production` to version control!

```bash
# Copy the example file
cp .env.example .env.production
```

### 2. Configure Production Variables

Edit `.env.production` with your production values:

```bash
# Core Configuration
NEXT_PUBLIC_API_URL=https://api.campuskinect.com/api/v1
NEXT_PUBLIC_WS_URL=wss://api.campuskinect.com
NEXT_PUBLIC_APP_URL=https://campuskinect.com

# Security
NEXT_PUBLIC_JWT_STORAGE_KEY=ck_prod_token
NEXT_PUBLIC_REFRESH_TOKEN_KEY=ck_prod_refresh

# Features
NEXT_PUBLIC_ENABLE_ANALYTICS=true
NEXT_PUBLIC_DEBUG_MODE=false

# External Services
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=your_production_cloudinary
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your_production_maps_key

# Environment
NEXT_PUBLIC_ENVIRONMENT=production
NEXT_PUBLIC_APP_VERSION=1.0.0
```

## 🚢 Deployment Methods

### Method 1: Docker Compose (Recommended)

**Best for**: VPS, dedicated servers, or local production setups

```bash
# 1. Deploy with script
./deploy.sh

# 2. Or manually
docker-compose -f docker-compose.prod.yml up -d

# 3. Check logs
docker-compose -f docker-compose.prod.yml logs -f web
```

**Features**:
- ✅ nginx reverse proxy with SSL termination
- ✅ Redis caching
- ✅ Health checks
- ✅ Automatic restarts
- ✅ Volume persistence

### Method 2: Vercel (Serverless)

**Best for**: Quick deployment, automatic scaling

```bash
# 1. Install Vercel CLI
npm i -g vercel

# 2. Deploy
DEPLOY_METHOD=vercel ./deploy.sh

# 3. Or manually
vercel --prod
```

**Features**:
- ✅ Automatic SSL
- ✅ Global CDN
- ✅ Automatic scaling
- ✅ Zero downtime deployments

### Method 3: Manual Docker

**Best for**: Custom container orchestration (Kubernetes, etc.)

```bash
# 1. Build image
docker build -t campuskinect/web:latest .

# 2. Run container
docker run -d \
  --name campuskinect-web \
  -p 3000:3000 \
  --env-file .env.production \
  campuskinect/web:latest
```

## 🏥 Health Monitoring

### Health Check Endpoint
```
GET /api/health
```

**Response**:
```json
{
  "status": "ok",
  "timestamp": "2024-01-15T10:30:00.000Z",
  "environment": "production",
  "version": "1.0.0",
  "uptime": 3600,
  "memory": {...},
  "checks": {
    "api": "ok",
    "database": "ok"
  }
}
```

### Monitoring Tools Integration

**Docker Health Checks**:
```bash
# Check container health
docker ps --format "table {{.Names}}\t{{.Status}}"

# View health check logs
docker inspect campuskinect-web-prod | grep -A 20 '"Health"'
```

**External Monitoring**:
- Uptime Robot: `https://campuskinect.com/api/health`
- Pingdom: `https://campuskinect.com/api/health`
- New Relic Browser monitoring

## 🔒 Security Considerations

### Production Security Headers
Already configured in nginx and Next.js:
- `X-Frame-Options: DENY`
- `X-Content-Type-Options: nosniff`
- `X-XSS-Protection: 1; mode=block`
- `Strict-Transport-Security`
- `Referrer-Policy: strict-origin-when-cross-origin`

### Environment Security
- Use strong, unique JWT secrets
- Enable HTTPS only
- Validate all environment variables
- Regular security updates

### Rate Limiting
nginx configuration includes:
- API endpoints: 10 requests/second
- Authentication endpoints: 5 requests/minute

## 📊 Performance Optimization

### Build Optimizations
- SWC minification enabled
- Compression enabled
- Image optimization with WebP/AVIF
- Static asset caching (1 year)

### Runtime Optimizations
- nginx gzip compression
- Redis caching layer
- CDN for static assets
- HTTP/2 support

## 🚨 Troubleshooting

### Common Issues

**1. Container Won't Start**
```bash
# Check logs
docker-compose -f docker-compose.prod.yml logs web

# Common fixes
- Check .env.production file exists
- Verify environment variables
- Check port conflicts
```

**2. Health Check Failing**
```bash
# Test health endpoint
curl -f http://localhost:3000/api/health

# Check backend connectivity
curl -f https://api.campuskinect.com/api/v1/health
```

**3. SSL Certificate Issues**
```bash
# Check certificate
openssl x509 -in nginx/ssl/campuskinect.crt -text -noout

# Renew Let's Encrypt
certbot renew --nginx
```

**4. Performance Issues**
```bash
# Check container resources
docker stats campuskinect-web-prod

# Check nginx logs
tail -f nginx/logs/access.log
tail -f nginx/logs/error.log
```

### Log Locations
- Application logs: `docker-compose logs web`
- nginx access logs: `nginx/logs/access.log`
- nginx error logs: `nginx/logs/error.log`

## 🔄 Backup & Recovery

### Backup Strategy
```bash
# Backup Docker images
docker save campuskinect/web:latest | gzip > campuskinect-web-backup.tar.gz

# Backup environment files
tar -czf env-backup.tar.gz .env.production nginx/ssl/

# Backup nginx config
tar -czf nginx-backup.tar.gz nginx/
```

### Recovery Process
```bash
# Restore from backup
docker load < campuskinect-web-backup.tar.gz

# Rollback to previous version
docker-compose -f docker-compose.prod.yml down
docker tag campuskinect/web:backup-YYYYMMDD-HHMMSS campuskinect/web:latest
docker-compose -f docker-compose.prod.yml up -d
```

## 📈 Scaling

### Horizontal Scaling
For high traffic, consider:
- Load balancer (nginx upstream)
- Multiple container replicas
- Database read replicas
- CDN for static assets

### Example nginx upstream:
```nginx
upstream campuskinect_web {
    server web1:3000;
    server web2:3000;
    server web3:3000;
}
```

## 🛠 Maintenance

### Regular Tasks
- **Weekly**: Check health endpoints
- **Monthly**: Update dependencies (`npm audit`)
- **Quarterly**: SSL certificate renewal
- **As needed**: Scale based on metrics

### Update Process
```bash
# 1. Create backup
./deploy.sh --backup

# 2. Deploy new version
git pull origin main
./deploy.sh

# 3. Verify deployment
curl -f https://campuskinect.com/api/health
```

## 📞 Support

For deployment issues:
1. Check this guide first
2. Review application logs
3. Check backend API connectivity
4. Contact development team with logs and error details

---

**Last Updated**: January 2025  
**Version**: 1.0.0 