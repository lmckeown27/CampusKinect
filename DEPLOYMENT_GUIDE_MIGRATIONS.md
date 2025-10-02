# Deployment Guide: Schema Changes & Migrations

## 🎯 Critical Rule: **MIGRATIONS BEFORE CODE**

When deploying features that change the database schema, **ALWAYS** run migrations BEFORE deploying new code.

---

## 📋 Proper Deployment Order

### ✅ CORRECT (Automated with deploy.sh)
```bash
cd ~/CampusKinect
./deploy.sh
```

This script automatically:
1. 💾 Creates backup
2. 📊 **Runs migrations FIRST**
3. 📦 Pulls new code
4. 🔄 Restarts services

### ❌ WRONG (Manual - Don't do this!)
```bash
git pull origin main    # ❌ Code first = BREAKS PRODUCTION
pm2 restart all         # ❌ New code with old schema = ERRORS
# Oops, forgot migrations!
```

---

## 🔧 Manual Deployment (If deploy.sh fails)

### Step 1: Backup
```bash
cd ~/CampusKinect
./backup-backend.sh
```

### Step 2: Run Migrations FIRST
```bash
cd ~/CampusKinect/backend/migrations

# Get database name from .env
DB_NAME=$(grep -oP 'postgresql://[^:]+:[^@]+@[^/]+/\K[^?]+' ../.env.production)

# Run all migrations
for migration in *.sql; do
    echo "Running $migration..."
    sudo -u postgres psql -d "$DB_NAME" -f "$migration"
done
```

### Step 3: Deploy Code
```bash
cd ~/CampusKinect
git stash
git pull origin main
cd backend
npm install --production
pm2 restart all
```

### Step 4: Verify
```bash
pm2 status
pm2 logs --lines 50
# Test the app!
```

---

## 📁 Migration File Structure

Migrations are in: `backend/migrations/`

**Naming Convention:** `XXX-description.sql`
- `001-allow-multiple-report-reasons.sql`
- `002-add-user-preferences.sql`
- `003-add-notification-settings.sql`

**Requirements:**
- Pure SQL only (no Node.js)
- Idempotent (safe to run multiple times)
- Use `IF EXISTS` / `IF NOT EXISTS`

---

## 🚨 What Went Wrong (October 2, 2025)

### The Bug
Users couldn't submit reports after updating to multiple-reason feature.

**Error:** `violates check constraint "content_reports_reason_check"`

### Root Cause
1. ✅ Code deployed with multiple reasons feature
2. ❌ Migration never ran (CHECK constraint still active)
3. ❌ iOS sent `"harassment, spam"` → Database expected single value only
4. 🔥 **Production broken**

### The Fix
1. Reverted code to single-reason version
2. Created proper SQL migration file
3. Updated deploy.sh to run migrations automatically
4. Will redeploy with correct order

---

## ✅ Testing Checklist Before Deployment

- [ ] Test migration on local database first
- [ ] Verify migration is idempotent (run twice, should succeed)
- [ ] Migration file is in `backend/migrations/`
- [ ] Migration filename follows naming convention
- [ ] Code changes are backward compatible (if possible)
- [ ] Deployment uses `deploy.sh` (not manual `git pull`)
- [ ] Monitor logs during deployment
- [ ] Test user flows immediately after deploy

---

## 🆘 Emergency Rollback

If deployment breaks production:

```bash
cd ~/CampusKinect

# Option 1: Restore from backup (safest)
./restore-backend.sh LATEST

# Option 2: Revert to previous commit
git revert HEAD
git push origin main
./deploy.sh

# Option 3: Manual rollback
git reset --hard HEAD~1
pm2 restart all
```

---

## 📝 Lesson Learned

**Schema changes are NEVER "minor"!**

Even small UI changes can require database modifications. Always:
1. Create migration file first
2. Test locally
3. Deploy with automated script
4. Migrations run BEFORE code
5. Monitor and verify

**Remember:** Database schema + Code must always match! 🎯 