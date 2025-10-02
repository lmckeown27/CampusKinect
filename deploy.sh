#!/bin/bash

echo "🚀 Starting safe deployment..."

# Navigate to project root
cd "$(dirname "$0")"

# Create full backend backup before deployment
echo "💾 Creating full backend backup before deployment..."
./backup-backend.sh
if [ $? -ne 0 ]; then
    echo "⚠️  Backup failed, but continuing with deployment..."
fi
echo ""

# Run database migrations FIRST (before code changes)
echo "📊 Running database migrations..."
if [ -d "backend/migrations" ]; then
    for migration in backend/migrations/*.sql; do
        if [ -f "$migration" ]; then
            echo "  Running $(basename $migration)..."
            sudo -u postgres psql -d "$(grep -oP 'postgresql://[^:]+:[^@]+@[^/]+/\K[^?]+' backend/.env.production 2>/dev/null || echo 'campuskinect')" -f "$migration"
            if [ $? -eq 0 ]; then
                echo "  ✅ $(basename $migration) completed"
            else
                echo "  ⚠️  $(basename $migration) failed (might already be applied)"
            fi
        fi
    done
else
    echo "  ℹ️  No migrations directory found, skipping..."
fi
echo ""

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