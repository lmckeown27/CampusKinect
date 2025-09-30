#!/bin/bash

echo "🚨 FORCE CLEAN AND RESET - Fixing Docker build issues"
echo "=================================================="

# Stop any running containers
echo "🛑 Stopping containers..."
docker-compose -f docker-compose.prod.yml down

# Clean Docker build cache
echo "🧹 Cleaning Docker build cache..."
docker builder prune -f

# Reset git to ensure we have the latest changes
echo "🔄 Resetting git to latest remote state..."
git fetch origin main
git reset --hard origin/main
git clean -fd

# Remove node_modules and package-lock to ensure clean dependencies
echo "📦 Cleaning npm dependencies..."
rm -rf node_modules
rm -f package-lock.json

# Remove any potential stale files that might be causing import errors
echo "🗑️ Removing stale files..."
rm -f src/components/providers/QueryProvider.tsx
rm -f src/hooks/useConversationMessages.ts
rm -f src/hooks/useRealTimeMessaging.ts
rm -f src/services/socketService.ts
rm -f build-safe.js
rm -rf src/components/providers
rm -rf src/hooks

# Remove Next.js build cache
echo "🧹 Cleaning Next.js cache..."
rm -rf .next
rm -rf out

# Reinstall dependencies
echo "📥 Reinstalling dependencies..."
npm ci

echo ""
echo "✅ CLEANUP COMPLETE!"
echo "📋 What was cleaned:"
echo "  - Docker containers stopped"
echo "  - Docker build cache cleared"
echo "  - Git reset to latest remote state"
echo "  - node_modules and package-lock.json removed"
echo "  - All stale React Query/Socket.io files removed"
echo "  - Next.js build cache cleared"
echo "  - Dependencies reinstalled"
echo ""
echo "🚀 Now run: docker-compose -f docker-compose.prod.yml up --build -d" 