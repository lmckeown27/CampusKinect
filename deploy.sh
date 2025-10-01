#!/bin/bash

echo "🚀 Starting safe deployment..."

# Navigate to project root
cd "$(dirname "$0")"

# Backup current .env files
echo "📦 Backing up environment files..."
cp backend/.env.production backend/.env.production.backup.$(date +%Y%m%d_%H%M%S) 2>/dev/null || true

# Stash any local changes to tracked files
echo "💾 Stashing local changes..."
git stash push -m "Auto-stash before deployment $(date +%Y%m%d_%H%M%S)"

# Pull latest changes
echo "⬇️ Pulling latest changes from main..."
git pull origin main

if [ $? -ne 0 ]; then
    echo "❌ Git pull failed! Restoring from stash..."
    git stash pop
    exit 1
fi

# Navigate to backend directory
cd backend

# Install/update dependencies if package.json changed
if git diff --name-only HEAD@{1} HEAD | grep -q "backend/package.json"; then
    echo "📦 package.json changed, running npm install..."
    npm install --production
fi

# Restart backend with PM2
echo "🔄 Restarting backend services..."
pm2 restart all

# Check if backend is running
sleep 2
if pm2 list | grep -q "online"; then
    echo "✅ Backend deployed successfully!"
    pm2 status
else
    echo "❌ Backend failed to start! Check logs:"
    pm2 logs --lines 20
    exit 1
fi

echo "🎉 Deployment complete!" 