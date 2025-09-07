# AWS EC2 Deployment Guide for CampusKinect Web Frontend

## 🎯 Your Setup
- ✅ AWS EC2 instance (ready)
- ✅ Domain: `campuskinect.net` (registered)
- ✅ Production-ready frontend code

## 🚀 Step-by-Step AWS Deployment

### Step 1: DNS Configuration

Set up your domain to point to your EC2 instance:

```bash
# In your domain registrar (Route 53, Namecheap, etc.), create these DNS records:

# A Record for main domain
campuskinect.net → 54.183.218.0

# A Record for www subdomain  
www.campuskinect.net → 54.183.218.0

# A Record for API subdomain (if backend is on same server)
api.campuskinect.net → 54.183.218.0

# Optional: CNAME for CDN
cdn.campuskinect.net → YOUR_CDN_DOMAIN
```

### Step 2: EC2 Instance Preparation

SSH into your EC2 instance and install required software:

```bash
# SSH into your EC2 instance
ssh -i your-key.pem ec2-user@54.183.218.0

# Update system
sudo yum update -y

# Install Docker
sudo yum install -y docker
sudo systemctl start docker
sudo systemctl enable docker
sudo usermod -a -G docker ec2-user

# Install Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# Install Git
sudo yum install -y git

# Install nginx (for SSL certificate generation)
sudo yum install -y nginx

# Logout and login again for docker group to take effect
exit
ssh -i your-key.pem ec2-user@54.183.218.0
```

### Step 3: Clone and Setup Application

```bash
# Create application directory
sudo mkdir -p /opt/campuskinect
sudo chown ec2-user:ec2-user /opt/campuskinect
cd /opt/campuskinect

# Clone the repository
git clone https://github.com/lmckeown27/CampusKinect.git
cd CampusKinect/Web_CampusKinect

# Create production environment file
cp env.production.example .env.production
```

### Step 4: Configure Environment Variables

Edit your production environment file:

```bash
nano .env.production
```

**Required configuration for campuskinect.net:**

```bash
# Core API Configuration
NEXT_PUBLIC_API_URL=https://api.campuskinect.net/api/v1
NEXT_PUBLIC_WS_URL=wss://api.campuskinect.net
NEXT_PUBLIC_APP_URL=https://campuskinect.net

# Security
NEXT_PUBLIC_JWT_STORAGE_KEY=ck_prod_token_unique_key
NEXT_PUBLIC_REFRESH_TOKEN_KEY=ck_prod_refresh_unique_key

# Features
NEXT_PUBLIC_ENABLE_ANALYTICS=true
NEXT_PUBLIC_DEBUG_MODE=false

# External Services (replace with your actual keys)
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=your_production_cloudinary
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your_production_google_maps_key

# Environment
NEXT_PUBLIC_ENVIRONMENT=production
NEXT_PUBLIC_APP_VERSION=1.0.0
```

### Step 5: SSL Certificate Setup

Install and configure SSL certificates using Let's Encrypt:

```bash
# Install Certbot
sudo yum install -y certbot python3-certbot-nginx

# Create nginx directories
sudo mkdir -p /opt/campuskinect/CampusKinect/Web_CampusKinect/nginx/ssl
sudo mkdir -p /opt/campuskinect/CampusKinect/Web_CampusKinect/nginx/logs

# Generate SSL certificate
sudo certbot certonly --standalone \
  -d campuskinect.net \
  -d www.campuskinect.net \
  -d api.campuskinect.net \
  --email your-email@example.com \
  --agree-tos \
  --non-interactive

# Copy certificates to nginx directory
sudo cp /etc/letsencrypt/live/campuskinect.net/fullchain.pem nginx/ssl/campuskinect.net.crt
sudo cp /etc/letsencrypt/live/campuskinect.net/privkey.pem nginx/ssl/campuskinect.net.key
sudo chown -R ec2-user:ec2-user nginx/ssl/
```

### Step 6: AWS Security Group Configuration

Configure your EC2 security group to allow web traffic:

```bash
# In AWS Console > EC2 > Security Groups > Your Security Group
# Add these inbound rules:

HTTP (80)    | 0.0.0.0/0    | Allow HTTP traffic
HTTPS (443)  | 0.0.0.0/0    | Allow HTTPS traffic  
SSH (22)     | YOUR_IP/32   | Allow SSH from your IP only
Custom (3000)| 0.0.0.0/0    | Allow Next.js (if needed for testing)
```

### Step 7: Deploy the Application

```bash
# Make deployment script executable
chmod +x deploy.sh

# Run deployment
./deploy.sh
```

### Step 8: Configure Automatic SSL Renewal

```bash
# Add certbot renewal to crontab
sudo crontab -e

# Add this line to auto-renew certificates
0 12 * * * /usr/bin/certbot renew --quiet --deploy-hook "cd /opt/campuskinect/CampusKinect/Web_CampusKinect && sudo cp /etc/letsencrypt/live/campuskinect.net/fullchain.pem nginx/ssl/campuskinect.net.crt && sudo cp /etc/letsencrypt/live/campuskinect.net/privkey.pem nginx/ssl/campuskinect.net.key && docker-compose -f docker-compose.prod.yml restart nginx"
```

## 🔍 Verification Steps

### 1. Check Domain Resolution
```bash
# Test DNS resolution
nslookup campuskinect.net
nslookup www.campuskinect.net
nslookup api.campuskinect.net
```

### 2. Test Application Health
```bash
# Test HTTP redirect to HTTPS
curl -I http://campuskinect.net

# Test HTTPS and health endpoint
curl -f https://campuskinect.net/api/health

# Check SSL certificate
openssl s_client -connect campuskinect.net:443 -servername campuskinect.net
```

### 3. Check Docker Containers
```bash
# View running containers
docker-compose -f docker-compose.prod.yml ps

# Check logs
docker-compose -f docker-compose.prod.yml logs web
docker-compose -f docker-compose.prod.yml logs nginx
```

## 🔧 AWS-Specific Optimizations

### Application Load Balancer (Optional)
For high availability, consider adding an ALB:

```bash
# If using ALB, update security groups:
# - ALB security group: Allow 80, 443 from 0.0.0.0/0
# - EC2 security group: Allow 3000 from ALB security group only
```

### CloudFront CDN (Recommended)
Set up CloudFront for global distribution:

```bash
# 1. Create CloudFront distribution
# 2. Origin: campuskinect.net
# 3. Update .env.production:
#    NEXT_PUBLIC_CDN_URL=https://d1234567890.cloudfront.net
```

### Auto Scaling (Advanced)
For automatic scaling:

```bash
# 1. Create AMI from your configured EC2 instance
# 2. Create Launch Template
# 3. Create Auto Scaling Group
# 4. Create Application Load Balancer
```

## 🔒 AWS Security Best Practices

### EC2 Security
```bash
# 1. Use IAM roles instead of access keys
# 2. Regular security updates
sudo yum update -y

# 3. Enable CloudTrail for auditing
# 4. Use AWS Systems Manager Session Manager instead of SSH keys
```

### Secrets Management
```bash
# Store sensitive data in AWS Secrets Manager
aws secretsmanager create-secret \
  --name "campuskinect/production/env" \
  --description "Production environment variables"
```

## 🚨 Troubleshooting

### Common AWS Issues

**1. Domain not resolving**
```bash
# Check Route 53 or DNS provider settings
# Wait for DNS propagation (up to 48 hours)
```

**2. SSL certificate issues**
```bash
# Check certificate files exist
ls -la nginx/ssl/

# Verify certificate validity
openssl x509 -in nginx/ssl/campuskinect.net.crt -text -noout
```

**3. Docker containers not starting**
```bash
# Check logs
docker-compose -f docker-compose.prod.yml logs

# Check disk space
df -h

# Check memory usage
free -h
```

**4. Application not accessible**
```bash
# Check security group rules
# Check nginx configuration
# Check EC2 instance status
```

## 🔄 Maintenance

### Regular Tasks
```bash
# Weekly: Check application health
curl -f https://campuskinect.net/api/health

# Monthly: Update system and Docker images
sudo yum update -y
docker-compose -f docker-compose.prod.yml pull
docker-compose -f docker-compose.prod.yml up -d

# Quarterly: Review AWS costs and security
```

### Backup Strategy
```bash
# Backup application data
tar -czf campuskinect-backup-$(date +%Y%m%d).tar.gz /opt/campuskinect/

# Backup to S3
aws s3 cp campuskinect-backup-$(date +%Y%m%d).tar.gz s3://your-backup-bucket/
```

## 📊 Monitoring

### CloudWatch Integration
```bash
# Install CloudWatch agent for detailed monitoring
wget https://s3.amazonaws.com/amazoncloudwatch-agent/amazon_linux/amd64/latest/amazon-cloudwatch-agent.rpm
sudo rpm -U ./amazon-cloudwatch-agent.rpm
```

### Custom Metrics
```bash
# Monitor application health
aws cloudwatch put-metric-data \
  --namespace "CampusKinect/Web" \
  --metric-data MetricName=HealthCheck,Value=1,Unit=Count
```

---

## 🎉 Congratulations!

Your CampusKinect web frontend should now be live at:
- **https://campuskinect.net** 🚀
- **https://www.campuskinect.net** 🚀

**Next Steps:**
1. Set up your backend API at `api.campuskinect.net`
2. Configure monitoring and alerting
3. Set up automated backups
4. Consider CDN setup for global performance

**Support**: If you encounter issues, check the logs and refer to the main [production.md](./production.md) guide. 