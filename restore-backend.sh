#!/bin/bash

# Navigate to project root
cd "$(dirname "$0")"

# Check if timestamp argument provided
if [ -z "$1" ]; then
    echo "🔍 Available backups:"
    ls -lt backups/ | grep "^d" | grep "backend_" | head -10
    echo ""
    echo "Usage: ./restore-backend.sh <timestamp>"
    echo "Or:    ./restore-backend.sh LATEST"
    echo ""
    echo "Example: ./restore-backend.sh 20241001_143022"
    exit 1
fi

TIMESTAMP=$1
BACKUP_DIR="backups/backend_${TIMESTAMP}"

# Handle "LATEST" shortcut
if [ "$TIMESTAMP" == "LATEST" ]; then
    if [ -L "backups/LATEST" ]; then
        BACKUP_DIR="backups/$(readlink backups/LATEST)"
        TIMESTAMP=$(basename "$BACKUP_DIR" | sed 's/backend_//')
        echo "📍 Using latest backup: ${TIMESTAMP}"
    else
        echo "❌ No LATEST backup found!"
        exit 1
    fi
fi

# Check if backup exists
if [ ! -d "$BACKUP_DIR" ]; then
    echo "❌ Backup not found: ${BACKUP_DIR}"
    echo ""
    echo "Available backups:"
    ls -lt backups/ | grep "^d" | grep "backend_"
    exit 1
fi

echo "⚠️  WARNING: This will restore backend from backup: ${TIMESTAMP}"
echo "📍 Backup location: ${BACKUP_DIR}"
echo ""

# Show backup info if available
if [ -f "${BACKUP_DIR}/BACKUP_INFO.txt" ]; then
    echo "📄 Backup Info:"
    cat "${BACKUP_DIR}/BACKUP_INFO.txt"
    echo ""
fi

# Confirmation
read -p "Are you sure you want to restore? (yes/no): " -r
echo ""
if [[ ! $REPLY =~ ^[Yy][Ee][Ss]$ ]]; then
    echo "❌ Restore cancelled."
    exit 1
fi

# Stop PM2 processes
echo "⏸️  Stopping backend services..."
pm2 stop all

# Create a pre-restore backup of current state
echo "💾 Creating pre-restore backup of current state..."
PRESTORE_BACKUP="backups/pre_restore_$(date +%Y%m%d_%H%M%S)"
mkdir -p "${PRESTORE_BACKUP}"
rsync -a --exclude 'node_modules' --exclude 'logs' --exclude 'uploads' backend/ "${PRESTORE_BACKUP}/" 2>/dev/null || true
echo "   Saved current state to: ${PRESTORE_BACKUP}"

# Restore backend files
echo "📂 Restoring backend files..."
rsync -av --progress \
    --exclude 'node_modules' \
    --exclude 'logs' \
    --exclude 'uploads' \
    "${BACKUP_DIR}/" backend/

# Restore .env file
if [ -f "${BACKUP_DIR}/.env.production" ]; then
    echo "🔐 Restoring .env.production..."
    cp "${BACKUP_DIR}/.env.production" backend/.env.production
fi

# Navigate to backend and reinstall dependencies
cd backend
echo "📦 Installing dependencies..."
npm install --production

# Start PM2 processes
echo "▶️  Starting backend services..."
pm2 restart all

# Wait and check status
sleep 3
echo ""
echo "📊 Backend Status:"
pm2 status

if pm2 list | grep -q "online"; then
    echo ""
    echo "✅ Backend restored successfully from backup: ${TIMESTAMP}"
    echo "📍 Backup location: ${BACKUP_DIR}"
    echo "💾 Pre-restore backup saved to: ${PRESTORE_BACKUP}"
else
    echo ""
    echo "⚠️  Backend may have issues. Check logs:"
    echo "   pm2 logs"
    echo ""
    echo "If needed, you can restore the pre-restore state from:"
    echo "   ${PRESTORE_BACKUP}"
fi 