# 🚀 Automated Deployment Guide

**Status:** ✅ Vercel auto-deploy configured  
**Live URL:** https://summit-site-seven.vercel.app

---

## 🎯 3 Ways to Deploy

### Option 1: Manual Git Deploy Script (Recommended)

**One-time setup:**
```bash
cd /home/ubuntu/.openclaw/workspace/vercel-summit
bash scripts/setup-git-deploy.sh
```

**Then deploy anytime:**
```bash
git deploy "feat: Add new feature"
```

**What it does:**
1. ✅ Stages all changes
2. ✅ Commits with your message
3. ✅ Pushes to main branch
4. ✅ Waits for Vercel deployment
5. ✅ Shows when deployment completes

---

### Option 2: Direct Deploy Script

**No setup needed, works immediately:**
```bash
bash scripts/deploy.sh "feat: Add chat modal"
```

**Output:**
```
═══════════════════════════════════════════════════════════════
🚀 AUTOMATED DEPLOYMENT WORKFLOW
═══════════════════════════════════════════════════════════════

📋 Step 1: Checking git status...
✅ Changes detected

📝 Step 2: Staging and committing changes...
✅ Committed: a1b2c3d

📤 Step 3: Pushing to GitHub (main branch)...
✅ Pushed to GitHub

⏳ Step 4: Waiting for Vercel deployment...
✅ Vercel site is responding

✓ Step 5: Deployment verification
✅ Commit: a1b2c3d
✅ Message: feat: Add chat modal
✅ Live URL: https://summit-site-seven.vercel.app

🎉 DEPLOYMENT WORKFLOW COMPLETE
═══════════════════════════════════════════════════════════════
```

---

### Option 3: Automatic Post-Commit Hook (Already Enabled)

**Automatic on every commit:**
```bash
git commit -m "feat: Add feature"
# Automatically pushes to main
# Vercel auto-deploys
```

**The hook:** `.git/hooks/post-commit`
- Runs after every commit
- Automatically pushes to main
- Vercel detects push and deploys

**To disable:**
```bash
rm .git/hooks/post-commit
```

---

## 📊 Deployment Flow

### With Deploy Script
```
You run: bash scripts/deploy.sh "message"
                ↓
Script stages all changes (git add -A)
                ↓
Script commits with message (git commit)
                ↓
Script pushes to main (git push origin main)
                ↓
Vercel webhook triggers on push
                ↓
Vercel builds and deploys (2-5 min)
                ↓
Script waits and verifies
                ↓
You get success confirmation
```

### Automatic Post-Commit Hook
```
You run: git commit -m "message"
                ↓
Commit completes locally
                ↓
Post-commit hook triggers automatically
                ↓
Hook checks current branch
                ↓
If on main: automatically runs git push
                ↓
Vercel webhook triggers
                ↓
Vercel auto-deploys (2-5 min)
```

---

## ✅ Verification

### Check Deployment Status

**Vercel Dashboard:**
```
https://vercel.com/toofuturetechnologies/summitsite/deployments
```

**Live URL:**
```
https://summit-site-seven.vercel.app
```

**Vercel Logs:**
```
https://vercel.com/toofuturetechnologies/summitsite/logs
```

---

## 💡 Best Practices

### Before Deploying

1. **Test locally:**
   ```bash
   npm run build  # Verify build works
   npm run dev    # Test features locally
   ```

2. **Stage only what you want:**
   ```bash
   git add src/  # Add specific files
   git add -A    # Or add everything
   ```

3. **Write clear commit messages:**
   ```bash
   # Good ✅
   git deploy "feat: Add instant chat modal to trip pages"
   
   # Bad ❌
   git deploy "update"
   ```

---

## 🔄 Typical Workflow

```bash
# 1. Make changes to code
# ... edit files ...

# 2. Deploy with message
bash scripts/deploy.sh "feat: Add chat modal"

# 3. Wait for Vercel (shows in terminal)
# Output shows deployment progress

# 4. Test live at https://summit-site-seven.vercel.app

# 5. If issues, commit a fix
bash scripts/deploy.sh "fix: Chat modal scroll issue"

# 6. Repeat until satisfied
```

---

## 📋 Script Features

### The Deploy Script (`scripts/deploy.sh`)

**Commits:** 
- Accepts commit message as argument
- Stages all changes with `git add -A`
- Creates commit with your message

**Pushes:**
- Pushes to origin/main
- Vercel webhook automatically triggered

**Waits:**
- Checks Vercel deployment status
- Waits up to 10 minutes for completion
- Shows progress indicator

**Verifies:**
- Confirms site is responding
- Displays commit hash and message
- Shows live URL

---

## 🛠️ Troubleshooting

### "Deploy script not found"
```bash
cd /home/ubuntu/.openclaw/workspace/vercel-summit
bash scripts/deploy.sh "message"
```

### "Permission denied"
```bash
chmod +x scripts/deploy.sh
bash scripts/deploy.sh "message"
```

### "No changes to commit"
The script detects no changes and exits (expected behavior)

### "Git push failed"
- Check internet connection
- Check GitHub credentials
- Run: `git status` to see what's wrong

### Deployment stuck
- Check Vercel logs: https://vercel.com/toofuturetechnologies/summitsite/logs
- Deployment may still be in progress (takes 2-5 min)
- Refresh the live URL to see if it deployed

### Want to cancel deployment
1. Go to Vercel dashboard
2. Click the latest deployment
3. Click "Cancel" button

---

## 📖 Examples

### Example 1: Deploy Chat Modal Feature
```bash
bash scripts/deploy.sh "feat: Add MessageGuideModal for instant chat on trip pages"
```

### Example 2: Deploy Bug Fix
```bash
bash scripts/deploy.sh "fix: Correct Supabase profile joins in messaging API"
```

### Example 3: Deploy Documentation
```bash
bash scripts/deploy.sh "docs: Add deployment guide and setup instructions"
```

### Example 4: Deploy Multiple Features
```bash
bash scripts/deploy.sh "feat: Add messaging, reviews, and earnings dashboard"
```

---

## ⏱️ Timeline

**After running deploy script:**
- **Seconds 0-2:** Commit and push completes
- **Seconds 2-10:** Script waits for Vercel
- **Minutes 2-5:** Vercel builds and deploys
- **Minute 5+:** Script confirms deployment
- **You:** See success message

---

## 🎯 When to Deploy

**Deploy after:**
- ✅ New feature complete
- ✅ Bug fix tested
- ✅ Documentation updated
- ✅ Code review approved
- ✅ Tests passing

**Don't deploy:**
- ❌ If tests failing
- ❌ If build errors
- ❌ If not ready for production
- ❌ If you're still testing

---

## 📊 Current Setup

**Vercel Auto-Deploy:** ✅ ENABLED
- Automatically deploys on push to main
- No manual trigger needed
- Webhook configured

**Git Post-Commit Hook:** ✅ ENABLED
- Automatically pushes after commit
- Only pushes if on main branch
- Can be disabled: `rm .git/hooks/post-commit`

**Deploy Script:** ✅ READY
- Use: `bash scripts/deploy.sh "message"`
- Commits, pushes, waits, verifies
- Shows all status information

---

## 🚀 Quick Commands Reference

```bash
# Deploy with commit message
bash scripts/deploy.sh "feat: Your feature here"

# Or use git alias (after setup)
git deploy "feat: Your feature here"

# Or just commit normally (auto-deploys via hook)
git commit -m "feat: Your feature here"
# Then git push origin main (auto or manual)

# Check status
git log --oneline -5  # See recent commits
git status            # See working changes

# Monitor deployment
# https://vercel.com/toofuturetechnologies/summitsite/logs
```

---

## ✅ Summary

**You now have 3 ways to deploy:**

1. **`bash scripts/deploy.sh "message"`** - Manual, explicit, shows progress
2. **`git deploy "message"`** - Git alias, requires one-time setup
3. **`git commit -m "message"`** - Automatic via hook, seamless workflow

**All automatically:**
- ✅ Commit your changes
- ✅ Push to GitHub
- ✅ Trigger Vercel deployment
- ✅ Verify live on production

**Status:** Every feature deployed automatically on push to main ✅

