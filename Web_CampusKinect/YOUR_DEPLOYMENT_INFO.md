# Your CampusKinect Deployment Info

## 🎯 **Your Specific Configuration**

### AWS EC2 Instance
- **Instance ID**: `i-0217127ec92c47c9e`
- **Public IP**: `54.183.218.0`
- **SSH Command**: `ssh -i your-key.pem ec2-user@54.183.218.0`

### Domain Configuration
- **Primary Domain**: `campuskinect.net`
- **WWW Domain**: `www.campuskinect.net`
- **API Domain**: `api.campuskinect.net`

### Required DNS Records (Set these in your domain registrar)
```
Type: A Record | Name: campuskinect.net     | Value: 54.183.218.0
Type: A Record | Name: www.campuskinect.net | Value: 54.183.218.0
Type: A Record | Name: api.campuskinect.net | Value: 54.183.218.0
```

## 🚀 **Quick Deployment**

### Option 1: Automated Script (Recommended)
```bash
cd /Users/liammckeown/Desktop/CampusKinect/Web_CampusKinect
./deploy-to-aws.sh
```

### Option 2: Manual Steps
```bash
# 1. SSH into your server
ssh -i your-key.pem ec2-user@54.183.218.0

# 2. Clone repository (update with your GitHub username)
sudo mkdir -p /opt/campuskinect
sudo chown ec2-user:ec2-user /opt/campuskinect
cd /opt/campuskinect
git clone https://github.com/YOUR_USERNAME/CampusKinect.git
cd CampusKinect/Web_CampusKinect

# 3. Configure environment
cp env.production.example .env.production
nano .env.production  # Edit with your values

# 4. Generate SSL certificates
sudo certbot certonly --standalone \
  -d campuskinect.net \
  -d www.campuskinect.net \
  -d api.campuskinect.net \
  --email your-email@example.com \
  --agree-tos

# 5. Deploy
chmod +x deploy.sh
./deploy.sh
```

## 🔍 **Verification Commands**

```bash
# Test DNS resolution
nslookup campuskinect.net

# Test HTTP to HTTPS redirect
curl -I http://campuskinect.net

# Test application health
curl -f https://campuskinect.net/api/health

# Check SSL certificate
openssl s_client -connect campuskinect.net:443 -servername campuskinect.net

# Check Docker containers
ssh -i your-key.pem ec2-user@54.183.218.0 "docker-compose -f /opt/campuskinect/CampusKinect/Web_CampusKinect/docker-compose.prod.yml ps"
```

## 🔧 **Maintenance Commands**

```bash
# SSH into server
ssh -i your-key.pem ec2-user@54.183.218.0

# Check application logs
cd /opt/campuskinect/CampusKinect/Web_CampusKinect
docker-compose -f docker-compose.prod.yml logs -f web

# Restart application
docker-compose -f docker-compose.prod.yml restart

# Update application
git pull origin main
./deploy.sh

# Check SSL certificate expiry
openssl x509 -in nginx/ssl/campuskinect.net.crt -noout -dates
```

## 🔒 **AWS Security Group Settings**

Your EC2 instance needs these inbound rules:
```
Type        | Port | Source      | Description
HTTP        | 80   | 0.0.0.0/0   | Allow HTTP traffic
HTTPS       | 443  | 0.0.0.0/0   | Allow HTTPS traffic
SSH         | 22   | YOUR_IP/32  | Allow SSH from your IP
Custom TCP  | 3000 | 0.0.0.0/0   | Allow Next.js (testing only)
```

## 📱 **Expected Results**

When everything is working:
- ✅ **https://campuskinect.net** → Your application
- ✅ **https://www.campuskinect.net** → Redirects to main domain
- ✅ **https://campuskinect.net/api/health** → Health status JSON
- ✅ **http://campuskinect.net** → Redirects to HTTPS

## 🚨 **Common Issues**

### DNS Not Resolving
```bash
# Check if DNS records are set correctly
nslookup campuskinect.net
# Should return: 54.183.218.0
```

### SSL Certificate Issues
```bash
# Generate certificates manually
ssh -i your-key.pem ec2-user@54.183.218.0
sudo certbot certonly --standalone -d campuskinect.net -d www.campuskinect.net -d api.campuskinect.net
```

### Application Not Starting
```bash
# Check logs
ssh -i your-key.pem ec2-user@54.183.218.0
cd /opt/campuskinect/CampusKinect/Web_CampusKinect
docker-compose -f docker-compose.prod.yml logs
```

## 📞 **Support Files**

- **Complete Guide**: [AWS_DEPLOYMENT.md](./AWS_DEPLOYMENT.md)
- **Step-by-step Checklist**: [AWS_CHECKLIST.md](./AWS_CHECKLIST.md)
- **Automated Deployment**: [deploy-to-aws.sh](./deploy-to-aws.sh)
- **Environment Template**: [env.production.example](./env.production.example)

---

**🎉 Your CampusKinect web frontend will be live at: https://campuskinect.net**

**Next**: Set up your backend API to work with `api.campuskinect.net` 