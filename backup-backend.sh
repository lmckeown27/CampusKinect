#!/bin/bash

echo "💾 Creating backend backup..."

# Navigate to project root
cd "$(dirname "$0")"

# Create backups directory if it doesn't exist
mkdir -p backups

# Generate timestamp
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="backups/backend_${TIMESTAMP}"

echo "📦 Backing up to: ${BACKUP_DIR}"

# Create backup directory
mkdir -p "${BACKUP_DIR}"

# Copy backend files (excluding node_modules and logs)
echo "📂 Copying backend files..."
rsync -av --progress \
    --exclude 'node_modules' \
    --exclude 'logs' \
    --exclude 'uploads' \
    --exclude '*.log' \
    backend/ "${BACKUP_DIR}/"

# Backup .env file separately (with special attention)
if [ -f "backend/.env.production" ]; then
    echo "🔐 Backing up .env.production..."
    cp backend/.env.production "${BACKUP_DIR}/.env.production"
fi

# Create a manifest file with backup info
echo "📝 Creating backup manifest..."
cat > "${BACKUP_DIR}/BACKUP_INFO.txt" << EOF
Backup Created: $(date)
Timestamp: ${TIMESTAMP}
Git Commit: $(git rev-parse HEAD 2>/dev/null || echo "unknown")
Git Branch: $(git branch --show-current 2>/dev/null || echo "unknown")
Node Version: $(node --version 2>/dev/null || echo "unknown")
NPM Packages: See package.json and package-lock.json

To restore this backup:
./restore-backend.sh ${TIMESTAMP}
EOF

# List PM2 processes
if command -v pm2 &> /dev/null; then
    echo "📊 Saving PM2 process list..."
    pm2 jlist > "${BACKUP_DIR}/pm2_processes.json" 2>/dev/null || true
fi

# Create a "LATEST" symlink
ln -sfn "backend_${TIMESTAMP}" "backups/LATEST"

echo "✅ Backup complete!"
echo "📍 Location: ${BACKUP_DIR}"
echo "🔗 Latest backup: backups/LATEST"
echo ""
echo "To restore this backup, run:"
echo "  ./restore-backend.sh ${TIMESTAMP}" 