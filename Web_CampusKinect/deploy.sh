#!/bin/bash

# CampusKinect Web Frontend - Production Deployment Script
# This script automates the deployment process for production environments

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
PROJECT_NAME="campuskinect-web"
DOCKER_IMAGE="campuskinect/web"
PRODUCTION_TAG="latest"
BACKUP_TAG="backup-$(date +%Y%m%d-%H%M%S)"

echo -e "${BLUE}🚀 Starting CampusKinect Web Production Deployment${NC}"

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

# Check if required files exist
echo -e "${BLUE}📋 Checking prerequisites...${NC}"

if [ ! -f ".env.production" ]; then
    print_error "Production environment file (.env.production) not found!"
    echo "Please create .env.production with your production environment variables."
    exit 1
fi

if [ ! -f "Dockerfile" ]; then
    print_error "Dockerfile not found!"
    exit 1
fi

print_status "Prerequisites check completed"

# Environment selection
if [ "$1" = "--env" ] && [ -n "$2" ]; then
    ENV_FILE=".env.$2"
    if [ ! -f "$ENV_FILE" ]; then
        print_error "Environment file $ENV_FILE not found!"
        exit 1
    fi
    print_status "Using environment file: $ENV_FILE"
else
    ENV_FILE=".env.production"
    print_status "Using default production environment"
fi

# Build process
echo -e "${BLUE}🔨 Building production image...${NC}"

# Clean previous builds
npm run clean

# Type checking
echo -e "${BLUE}🔍 Running type checks...${NC}"
npm run type-check

# Linting
echo -e "${BLUE}🧹 Running linter...${NC}"
npm run lint

# Build Docker image (force clean build)
echo -e "${BLUE}🐳 Building Docker image...${NC}"
docker build --no-cache -t $DOCKER_IMAGE:$PRODUCTION_TAG .

# Tag backup image
docker tag $DOCKER_IMAGE:$PRODUCTION_TAG $DOCKER_IMAGE:$BACKUP_TAG

print_status "Docker image built successfully"

# Deploy based on method
DEPLOY_METHOD=${DEPLOY_METHOD:-"docker-compose"}

case $DEPLOY_METHOD in
    "docker-compose")
        echo -e "${BLUE}🚢 Deploying with Docker Compose...${NC}"
        
        # Stop existing containers
        if docker-compose -f docker-compose.prod.yml ps | grep -q "Up"; then
            print_warning "Stopping existing containers..."
            docker-compose -f docker-compose.prod.yml down
        fi
        
        # Start new containers
        docker-compose -f docker-compose.prod.yml up -d
        print_status "Application deployed with Docker Compose"
        ;;
        
    "vercel")
        echo -e "${BLUE}☁️  Deploying to Vercel...${NC}"
        
        # Check if Vercel CLI is installed
        if ! command -v vercel &> /dev/null; then
            print_error "Vercel CLI not found. Install with: npm i -g vercel"
            exit 1
        fi
        
        # Deploy to Vercel
        vercel --prod --yes
        print_status "Application deployed to Vercel"
        ;;
        
    "manual")
        echo -e "${BLUE}📦 Manual deployment mode${NC}"
        print_status "Docker image ready for manual deployment"
        echo "Image: $DOCKER_IMAGE:$PRODUCTION_TAG"
        ;;
        
    *)
        print_error "Unknown deployment method: $DEPLOY_METHOD"
        echo "Supported methods: docker-compose, vercel, manual"
        exit 1
        ;;
esac

# Health check
echo -e "${BLUE}🏥 Running health checks...${NC}"
sleep 10  # Wait for application to start

case $DEPLOY_METHOD in
    "docker-compose")
        HEALTH_URL="http://localhost:3000/api/health"
        ;;
    "vercel")
        HEALTH_URL="https://campuskinect.com/api/health"
        ;;
    *)
        print_warning "Skipping health check for manual deployment"
        ;;
esac

if [ -n "$HEALTH_URL" ]; then
    if curl -f -s "$HEALTH_URL" > /dev/null; then
        print_status "Health check passed"
    else
        print_warning "Health check failed - please verify deployment manually"
    fi
fi

# Cleanup old images (keep last 5)
echo -e "${BLUE}🧹 Cleaning up old Docker images...${NC}"
docker images $DOCKER_IMAGE --format "table {{.Tag}}\t{{.CreatedAt}}" | grep -v "latest\|backup" | tail -n +6 | awk '{print $1}' | xargs -r docker rmi $DOCKER_IMAGE: 2>/dev/null || true

print_status "Deployment completed successfully! 🎉"

echo -e "${GREEN}"
echo "=================================================="
echo "🎉 DEPLOYMENT SUCCESSFUL!"
echo "=================================================="
echo "Project: $PROJECT_NAME"
echo "Image: $DOCKER_IMAGE:$PRODUCTION_TAG"
echo "Backup: $DOCKER_IMAGE:$BACKUP_TAG"
echo "Environment: $ENV_FILE"
echo "Method: $DEPLOY_METHOD"
if [ -n "$HEALTH_URL" ]; then
    echo "Health Check: $HEALTH_URL"
fi
echo "=================================================="
echo -e "${NC}"

# Optional: Send deployment notification
if [ -n "$SLACK_WEBHOOK_URL" ]; then
    curl -X POST -H 'Content-type: application/json' \
        --data "{\"text\":\"✅ CampusKinect Web deployed successfully to production!\"}" \
        "$SLACK_WEBHOOK_URL" || true
fi 