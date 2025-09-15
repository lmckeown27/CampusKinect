#!/bin/bash

# CampusKinect SSL Certificate and Nginx Update Script
# This script updates the SSL certificate to include api.campuskinect.net
# and deploys the new nginx configuration

set -e

echo "🔧 CampusKinect Domain Configuration Update"
echo "=========================================="

# Check if running as root
if [[ $EUID -ne 0 ]]; then
   echo "❌ This script must be run as root (use sudo)"
   exit 1
fi

# Backup current nginx configuration
echo "📋 Backing up current nginx configuration..."
cp /etc/nginx/nginx.conf /etc/nginx/nginx.conf.backup.$(date +%Y%m%d_%H%M%S)

# Update SSL certificate to include api.campuskinect.net
echo "🔒 Updating SSL certificate to include api.campuskinect.net..."
certbot certonly --nginx \
    -d campuskinect.net \
    -d www.campuskinect.net \
    -d api.campuskinect.net \
    --expand \
    --non-interactive \
    --agree-tos

# Copy new nginx configuration
echo "📝 Updating nginx configuration..."
cp nginx/nginx.conf /etc/nginx/nginx.conf

# Test nginx configuration
echo "🧪 Testing nginx configuration..."
nginx -t

if [ $? -eq 0 ]; then
    echo "✅ Nginx configuration is valid"
    
    # Reload nginx
    echo "🔄 Reloading nginx..."
    systemctl reload nginx
    
    echo "✅ SSL certificate and nginx configuration updated successfully!"
    echo ""
    echo "🎯 Next steps:"
    echo "1. Test web frontend: https://campuskinect.net"
    echo "2. Test API endpoint: https://api.campuskinect.net/api/v1/health"
    echo "3. Test iOS app login"
    echo ""
    echo "📋 Configuration summary:"
    echo "- Main domain: campuskinect.net (web frontend + API)"
    echo "- API subdomain: api.campuskinect.net (API only)"
    echo "- Both domains route to same backend on port 8080"
    echo "- SSL certificate covers all domains"
    
else
    echo "❌ Nginx configuration test failed!"
    echo "🔄 Restoring backup configuration..."
    cp /etc/nginx/nginx.conf.backup.$(date +%Y%m%d)* /etc/nginx/nginx.conf
    systemctl reload nginx
    echo "⚠️  Please check the nginx configuration and try again"
    exit 1
fi 