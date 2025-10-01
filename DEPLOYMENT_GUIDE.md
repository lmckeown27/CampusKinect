# 🚀 Deployment & Backup Guide

## 🎯 Quick Start

### On Server (18.191.157.192)

```bash
cd ~/CampusKinect
./deploy.sh          # Deploy latest code (auto-creates backup)
```

That's it! The script handles everything automatically.

---

## 💾 Backup System

### Create Manual Backup
```bash
./backup-backend.sh
```

This creates a timestamped backup in `backups/backend_YYYYMMDD_HHMMSS/`

**What gets backed up:**
- All backend source code
- .env.production file
- package.json and package-lock.json
- Migrations and config files
- PM2 process list
- Git commit info

**What's excluded:**
- node_modules (reinstalled during restore)
- logs (not needed)
- uploads (user data, stays in place)

### Restore from Backup
```bash
# Restore latest backup
./restore-backend.sh LATEST

# Restore specific backup
./restore-backend.sh 20241001_143022
```

**Safety features:**
- Shows backup info before restoring
- Requires confirmation (yes/no)
- Creates pre-restore backup automatically
- Reinstalls dependencies
- Restarts PM2 services

### List Available Backups
```bash
./restore-backend.sh
# Shows list of available backups
```

---

## 📦 Deployment Process

When you run `./deploy.sh`, it automatically:

1. ✅ **Creates backup** of current working backend
2. ✅ **Stashes** any local changes
3. ✅ **Pulls** latest code from GitHub
4. ✅ **Installs** npm packages if package.json changed
5. ✅ **Restarts** backend with PM2
6. ✅ **Verifies** backend is running

If deployment fails, you can quickly restore:
```bash
./restore-backend.sh LATEST
```

---

## 🔧 First-Time Server Setup

Run these commands once to set up the deployment system:

```bash
ssh ubuntu@18.191.157.192
cd ~/CampusKinect

# Clean up git conflicts (one-time)
git rm --cached -r backend/node_modules backend/logs 2>/dev/null || true
git rm --cached backend/.env.production backend/package-lock.json 2>/dev/null || true
git checkout -- .

# Pull deployment scripts
git pull origin main

# Make scripts executable
chmod +x deploy.sh backup-backend.sh restore-backend.sh

# Create initial backup of current working backend
./backup-backend.sh
```

---

## 📋 Common Scenarios

### Scenario 1: Regular Deployment
```bash
cd ~/CampusKinect
./deploy.sh
```

### Scenario 2: Deployment Broke Something
```bash
# Restore to last working version
./restore-backend.sh LATEST

# Or restore to specific backup
./restore-backend.sh 20241001_120000
```

### Scenario 3: Before Major Change
```bash
# Create manual backup first
./backup-backend.sh

# Then make your changes
# ...

# If something breaks, restore
./restore-backend.sh LATEST
```

### Scenario 4: Check Backup History
```bash
# List all backups
ls -lh backups/

# View specific backup info
cat backups/backend_20241001_143022/BACKUP_INFO.txt
```

---

## 🎯 Best Practices

1. **Before any manual backend changes:**
   ```bash
   ./backup-backend.sh
   ```

2. **Regular deployments use:**
   ```bash
   ./deploy.sh  # Already includes backup
   ```

3. **Keep at least 5-10 recent backups**
   ```bash
   # Remove old backups (keep last 10)
   cd ~/CampusKinect/backups
   ls -t | grep "backend_" | tail -n +11 | xargs rm -rf
   ```

4. **Test restore periodically:**
   - Pick an old backup
   - Note current LATEST timestamp
   - Restore old backup to test
   - Restore back to LATEST

---

## 🆘 Emergency Recovery

If backend is completely broken:

```bash
cd ~/CampusKinect

# 1. Stop everything
pm2 stop all

# 2. Restore latest known-good backup
./restore-backend.sh LATEST

# 3. If that doesn't work, try previous backup
./restore-backend.sh  # Lists backups
./restore-backend.sh <previous-timestamp>

# 4. Check logs
pm2 logs --lines 50
```

---

## 📊 Monitoring

```bash
# Check backend status
pm2 status

# View logs
pm2 logs

# View recent logs
pm2 logs --lines 100

# Restart if needed
pm2 restart all
```

---

## ❓ FAQ

**Q: How much space do backups take?**
A: Very little! Each backup is ~10-50MB (excludes node_modules and uploads).

**Q: How long do backups take?**
A: Usually 5-10 seconds.

**Q: Can I delete old backups?**
A: Yes! Just delete folders in `backups/` directory. Keep at least a few recent ones.

**Q: What if I accidentally delete all backups?**
A: The code is still in GitHub. You can always `git pull` and `npm install`.

**Q: Do backups include user uploads/images?**
A: No, backups exclude `uploads/` folder. User data stays in place during restore.

---

## 🎉 Summary

- **Deploy:** `./deploy.sh` (includes auto-backup)
- **Backup:** `./backup-backend.sh` (manual backup)
- **Restore:** `./restore-backend.sh LATEST` (emergency recovery)

That's it! You're now protected from backend breakage. 🛡️ 