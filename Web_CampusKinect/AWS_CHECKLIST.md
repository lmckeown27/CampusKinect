# AWS Deployment Checklist - campuskinect.net

## ✅ Pre-Deployment Checklist

### Domain & DNS Setup
- [ ] Domain `campuskinect.net` is registered
- [ ] DNS A records created:
  - [ ] `campuskinect.net` → 54.183.218.0
  - [ ] `www.campuskinect.net` → 54.183.218.0  
  - [ ] `api.campuskinect.net` → 54.183.218.0
- [ ] DNS propagation verified (use `nslookup campuskinect.net`)

### EC2 Instance Setup
- [ ] EC2 instance is running
- [ ] Security Group configured:
  - [ ] HTTP (80) from 0.0.0.0/0
  - [ ] HTTPS (443) from 0.0.0.0/0
  - [ ] SSH (22) from your IP
- [ ] SSH access works: `ssh -i your-key.pem ec2-user@54.183.218.0`

### Required Software Installation
- [ ] Docker installed and running
- [ ] Docker Compose installed
- [ ] Git installed
- [ ] Certbot installed (for SSL)

## 🚀 Deployment Steps

### 1. Clone Repository
```bash
cd /opt/campuskinect
git clone https://github.com/YOUR_USERNAME/CampusKinect.git
cd CampusKinect/Web_CampusKinect
```

### 2. Environment Configuration
```bash
# Copy and edit environment file
cp env.production.example .env.production
nano .env.production

# Verify these values are set:
NEXT_PUBLIC_API_URL=https://api.campuskinect.net/api/v1
NEXT_PUBLIC_WS_URL=wss://api.campuskinect.net
NEXT_PUBLIC_APP_URL=https://campuskinect.net
```

### 3. SSL Certificate
```bash
# Generate Let's Encrypt certificate
sudo certbot certonly --standalone \
  -d campuskinect.net \
  -d www.campuskinect.net \
  -d api.campuskinect.net \
  --email YOUR_EMAIL@example.com \
  --agree-tos

# Copy certificates
sudo cp /etc/letsencrypt/live/campuskinect.net/fullchain.pem nginx/ssl/campuskinect.net.crt
sudo cp /etc/letsencrypt/live/campuskinect.net/privkey.pem nginx/ssl/campuskinect.net.key
sudo chown -R ec2-user:ec2-user nginx/ssl/
```

### 4. Deploy Application
```bash
# Make script executable and deploy
chmod +x deploy.sh
./deploy.sh
```

## 🔍 Verification Checklist

### Domain & SSL Tests
- [ ] `curl -I http://campuskinect.net` → redirects to HTTPS
- [ ] `curl -f https://campuskinect.net` → returns 200 OK
- [ ] `curl -f https://www.campuskinect.net` → returns 200 OK
- [ ] SSL certificate is valid (green lock in browser)

### Application Health
- [ ] `curl -f https://campuskinect.net/api/health` → returns health status
- [ ] Web application loads in browser
- [ ] No console errors in browser developer tools

### Docker Containers
- [ ] `docker-compose -f docker-compose.prod.yml ps` → all containers running
- [ ] `docker-compose -f docker-compose.prod.yml logs web` → no errors
- [ ] `docker-compose -f docker-compose.prod.yml logs nginx` → no errors

## 🔧 Post-Deployment Setup

### SSL Auto-Renewal
- [ ] Crontab configured for automatic certificate renewal
- [ ] Test renewal: `sudo certbot renew --dry-run`

### Monitoring Setup
- [ ] Health check endpoint working
- [ ] CloudWatch agent installed (optional)
- [ ] Log rotation configured

### Security
- [ ] Security group rules reviewed
- [ ] SSH key access restricted
- [ ] Firewall rules configured

## 🚨 Common Issues & Solutions

### Issue: Domain not resolving
**Solution**: 
- Check DNS records in your domain registrar
- Wait for DNS propagation (up to 48 hours)
- Test with: `nslookup campuskinect.net`

### Issue: SSL certificate error
**Solution**:
- Ensure ports 80 and 443 are open in security group
- Stop nginx temporarily: `sudo systemctl stop nginx`
- Re-run certbot
- Copy certificates to nginx directory

### Issue: Docker containers not starting
**Solution**:
- Check logs: `docker-compose -f docker-compose.prod.yml logs`
- Verify .env.production exists and has correct values
- Check disk space: `df -h`

### Issue: 502 Bad Gateway
**Solution**:
- Check if web container is running: `docker ps`
- Verify nginx configuration
- Check web container logs

## 📞 Quick Commands

```bash
# Check application status
docker-compose -f docker-compose.prod.yml ps

# View logs
docker-compose -f docker-compose.prod.yml logs -f web

# Restart application
docker-compose -f docker-compose.prod.yml restart

# Update application
git pull origin main
./deploy.sh

# Check SSL certificate expiry
openssl x509 -in nginx/ssl/campuskinect.net.crt -noout -dates
```

## 🎉 Success Indicators

When everything is working correctly, you should see:

1. ✅ **https://campuskinect.net** loads your application
2. ✅ **https://www.campuskinect.net** redirects to main domain
3. ✅ **https://campuskinect.net/api/health** returns JSON health status
4. ✅ Browser shows secure connection (green lock)
5. ✅ All Docker containers are running
6. ✅ No errors in application logs

---

**Your CampusKinect Web Frontend should now be live at https://campuskinect.net! 🚀**

**Next**: Set up your backend API at `api.campuskinect.net` 