#!/bin/bash

# CampusKinect Web Frontend - AWS EC2 Deployment Script
# Customized for EC2 Instance: i-0217127ec92c47c9e (54.183.218.0)
# Domain: campuskinect.net

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# AWS EC2 Configuration
EC2_IP="54.183.218.0"
EC2_INSTANCE_ID="i-0217127ec92c47c9e"
DOMAIN="campuskinect.net"
SSH_KEY_PATH="${SSH_KEY_PATH:-./campuskinect.pem}"
SSH_USER="ec2-user"

echo -e "${BLUE}🚀 CampusKinect AWS Deployment Script${NC}"
echo -e "${BLUE}EC2 Instance: ${EC2_INSTANCE_ID} (${EC2_IP})${NC}"
echo -e "${BLUE}Domain: ${DOMAIN}${NC}"
echo ""

# Function to print status
print_status() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

# Check if SSH key exists
if [ ! -f "$SSH_KEY_PATH" ]; then
    print_error "SSH key not found at $SSH_KEY_PATH"
    echo "Please ensure your EC2 key pair file is available and update SSH_KEY_PATH"
    echo "Usage: SSH_KEY_PATH=/path/to/your/key.pem $0"
    exit 1
fi

# Test SSH connection
echo -e "${BLUE}🔍 Testing SSH connection...${NC}"
if ssh -i "$SSH_KEY_PATH" -o ConnectTimeout=10 -o StrictHostKeyChecking=no "$SSH_USER@$EC2_IP" "echo 'SSH connection successful'" 2>/dev/null; then
    print_status "SSH connection verified"
else
    print_error "Cannot connect to EC2 instance"
    echo "Please check:"
    echo "1. SSH key path: $SSH_KEY_PATH"
    echo "2. Security group allows SSH from your IP"
    echo "3. EC2 instance is running"
    exit 1
fi

# Check DNS resolution
echo -e "${BLUE}🌐 Checking DNS resolution...${NC}"
if nslookup "$DOMAIN" > /dev/null 2>&1; then
    RESOLVED_IP=$(nslookup "$DOMAIN" | grep -A1 "Name:" | tail -n1 | awk '{print $2}' | head -n1)
    if [ "$RESOLVED_IP" = "$EC2_IP" ]; then
        print_status "DNS correctly points to EC2 instance"
    else
        print_warning "DNS points to $RESOLVED_IP instead of $EC2_IP"
        echo "Please update your DNS records to point to $EC2_IP"
    fi
else
    print_warning "DNS not yet propagated for $DOMAIN"
    echo "You may need to wait for DNS propagation or check your DNS settings"
fi

# Function to run commands on EC2
run_on_ec2() {
    ssh -i "$SSH_KEY_PATH" -o StrictHostKeyChecking=no "$SSH_USER@$EC2_IP" "$1"
}

# Prepare EC2 instance
echo -e "${BLUE}📦 Preparing EC2 instance...${NC}"

# Check if Docker is installed
if run_on_ec2 "command -v docker" > /dev/null 2>&1; then
    print_status "Docker is installed"
else
    echo -e "${BLUE}Installing Docker...${NC}"
    run_on_ec2 "
        sudo yum update -y &&
        sudo yum install -y docker &&
        sudo systemctl start docker &&
        sudo systemctl enable docker &&
        sudo usermod -a -G docker ec2-user
    "
    print_status "Docker installed"
fi

# Check if Docker Compose is installed
if run_on_ec2 "command -v docker-compose" > /dev/null 2>&1; then
    print_status "Docker Compose is installed"
else
    echo -e "${BLUE}Installing Docker Compose...${NC}"
    run_on_ec2 "
        sudo curl -L \"https://github.com/docker/compose/releases/latest/download/docker-compose-\$(uname -s)-\$(uname -m)\" -o /usr/local/bin/docker-compose &&
        sudo chmod +x /usr/local/bin/docker-compose
    "
    print_status "Docker Compose installed"
fi

# Check if Git is installed
if run_on_ec2 "command -v git" > /dev/null 2>&1; then
    print_status "Git is installed"
else
    echo -e "${BLUE}Installing Git...${NC}"
    run_on_ec2 "sudo yum install -y git"
    print_status "Git installed"
fi

# Check if Certbot is installed
if run_on_ec2 "command -v certbot" > /dev/null 2>&1; then
    print_status "Certbot is installed"
else
    echo -e "${BLUE}Installing Certbot...${NC}"
    run_on_ec2 "sudo yum install -y certbot"
    print_status "Certbot installed"
fi

# Create application directory and clone repository
echo -e "${BLUE}📁 Setting up application directory...${NC}"
run_on_ec2 "
    sudo mkdir -p /opt/campuskinect &&
    sudo chown ec2-user:ec2-user /opt/campuskinect
"

# Check if repository already exists
if run_on_ec2 "[ -d /opt/campuskinect/CampusKinect ]"; then
    echo -e "${BLUE}🔄 Updating existing repository...${NC}"
    run_on_ec2 "
        cd /opt/campuskinect/CampusKinect &&
        git pull origin main
    "
else
    echo -e "${BLUE}📥 Cloning repository...${NC}"
    echo -e "${BLUE}Cloning from https://github.com/lmckeown27/CampusKinect.git${NC}"
    run_on_ec2 "
        cd /opt/campuskinect &&
        git clone https://github.com/lmckeown27/CampusKinect.git
    "
fi

# Copy local environment file to EC2
echo -e "${BLUE}⚙️  Setting up environment configuration...${NC}"
if [ -f "./env.production.example" ]; then
    # Upload environment template
    scp -i "$SSH_KEY_PATH" -o StrictHostKeyChecking=no "./env.production.example" "$SSH_USER@$EC2_IP:/tmp/env.production.example"
    
    run_on_ec2 "
        cd /opt/campuskinect/CampusKinect/Web_CampusKinect &&
        cp /tmp/env.production.example .env.production
    "
    print_status "Environment template uploaded"
    print_warning "Remember to edit .env.production with your actual values"
else
    print_warning "env.production.example not found locally"
fi

# Upload deployment files
echo -e "${BLUE}📤 Uploading deployment files...${NC}"
deployment_files=("docker-compose.prod.yml" "deploy.sh" "Dockerfile" ".dockerignore")

for file in "${deployment_files[@]}"; do
    if [ -f "./$file" ]; then
        scp -i "$SSH_KEY_PATH" -r -o StrictHostKeyChecking=no "./$file" "$SSH_USER@$EC2_IP:/opt/campuskinect/CampusKinect/Web_CampusKinect/"
    fi
done

# Upload nginx configuration
if [ -d "./nginx" ]; then
    scp -i "$SSH_KEY_PATH" -r -o StrictHostKeyChecking=no "./nginx" "$SSH_USER@$EC2_IP:/opt/campuskinect/CampusKinect/Web_CampusKinect/"
fi

print_status "Deployment files uploaded"

# SSL Certificate setup
echo -e "${BLUE}🔒 Setting up SSL certificates...${NC}"
print_warning "SSL certificate generation requires domain to point to this server"

read -p "Do you want to generate SSL certificates now? (y/N): " -r
if [[ $REPLY =~ ^[Yy]$ ]]; then
    read -p "Enter your email for Let's Encrypt: " EMAIL
    
    if [ -n "$EMAIL" ]; then
        echo -e "${BLUE}Generating SSL certificates...${NC}"
        run_on_ec2 "
            sudo systemctl stop nginx 2>/dev/null || true &&
            sudo certbot certonly --standalone \
                -d campuskinect.net \
                -d www.campuskinect.net \
                -d api.campuskinect.net \
                --email $EMAIL \
                --agree-tos \
                --non-interactive || true
        "
        
        # Copy certificates to nginx directory
        run_on_ec2 "
            cd /opt/campuskinect/CampusKinect/Web_CampusKinect &&
            sudo mkdir -p nginx/ssl &&
            sudo cp /etc/letsencrypt/live/campuskinect.net/fullchain.pem nginx/ssl/campuskinect.net.crt 2>/dev/null || true &&
            sudo cp /etc/letsencrypt/live/campuskinect.net/privkey.pem nginx/ssl/campuskinect.net.key 2>/dev/null || true &&
            sudo chown -R ec2-user:ec2-user nginx/ssl/ || true
        "
        print_status "SSL certificates configured"
    fi
else
    print_warning "Skipping SSL certificate generation"
    echo "You can generate certificates later with:"
    echo "sudo certbot certonly --standalone -d campuskinect.net -d www.campuskinect.net -d api.campuskinect.net"
fi

# Deploy application
echo -e "${BLUE}🚀 Deploying application...${NC}"
run_on_ec2 "
    cd /opt/campuskinect/CampusKinect/Web_CampusKinect &&
    chmod +x deploy.sh &&
    ./deploy.sh
"

# Health check
echo -e "${BLUE}🏥 Running health check...${NC}"
sleep 15

# Test HTTP redirect
if curl -s -I "http://$DOMAIN" | grep -q "301\|302"; then
    print_status "HTTP to HTTPS redirect working"
else
    print_warning "HTTP redirect may not be working"
fi

# Test HTTPS health endpoint
if curl -s -f "https://$DOMAIN/api/health" > /dev/null 2>&1; then
    print_status "HTTPS health check passed"
    echo -e "${GREEN}🎉 Application is live at https://$DOMAIN${NC}"
else
    print_warning "HTTPS health check failed - this is normal if SSL certificates aren't set up yet"
    echo "You can test with: curl -k https://$DOMAIN/api/health"
fi

# Display final status
echo -e "${GREEN}"
echo "=========================================="
echo "🎉 AWS DEPLOYMENT COMPLETED!"
echo "=========================================="
echo "EC2 Instance: $EC2_INSTANCE_ID"
echo "Public IP: $EC2_IP"
echo "Domain: $DOMAIN"
echo "Application URL: https://$DOMAIN"
echo "Health Check: https://$DOMAIN/api/health"
echo "=========================================="
echo -e "${NC}"

# Next steps
echo -e "${BLUE}📋 Next Steps:${NC}"
echo "1. Verify DNS records point to $EC2_IP"
echo "2. Edit .env.production on the server with your actual values:"
echo "   ssh -i $SSH_KEY_PATH $SSH_USER@$EC2_IP"
echo "   cd /opt/campuskinect/CampusKinect/Web_CampusKinect"
echo "   nano .env.production"
echo "3. If SSL certificates weren't generated, run:"
echo "   sudo certbot certonly --standalone -d campuskinect.net -d www.campuskinect.net"
echo "4. Restart the application: docker-compose -f docker-compose.prod.yml restart"

# Optional: Open browser
if command -v open > /dev/null 2>&1; then
    read -p "Open https://$DOMAIN in browser? (y/N): " -r
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        open "https://$DOMAIN"
    fi
fi

echo -e "${GREEN}Deployment script completed successfully! 🚀${NC}" 