# 📦 QuizLink Release System - Complete Guide

## ✅ What's Been Set Up

I've created a **complete release management system** for QuizLink with:

### 🔧 Release Scripts:

- ✅ `release.sh` - Bash version (Linux/Mac/Git Bash)
- ✅ `release.ps1` - PowerShell version (Windows) **← Use this!**
- ✅ Semantic versioning support (major.minor.patch)
- ✅ Custom tag names (beta, rc, etc.)
- ✅ Auto-sync with remote tags
- ✅ Conflict resolution

### 🚀 Deployment Scripts:

- ✅ `deploy-all.ps1` - Full deployment (Windows)
- ✅ `deploy-all.sh` - Full deployment (Linux/Mac)
- ✅ Deploys backend + frontend in one command

### ✅ Pre-release Checks:

- ✅ `scripts/pre-release.ps1` - Windows checks
- ✅ `scripts/pre-release.sh` - Unix checks
- ✅ Validates code before release
- ✅ Runs linter and builds

### 📝 Version Management:

- ✅ `scripts/update-version.js` - Sync versions
- ✅ `VERSION` file - Current version tracker
- ✅ `CHANGELOG.md` - Version history

### 🤖 GitHub Actions:

- ✅ `.github/workflows/deploy.yml` - Auto-deployment
- ✅ `.github/workflows/test.yml` - CI testing
- ✅ `.github/workflows/release.yml` - Auto-releases
- ✅ Issue templates
- ✅ PR template

### ⚙️ VS Code Integration:

- ✅ `.vscode/settings.json` - Editor config
- ✅ `.vscode/extensions.json` - Recommended extensions
- ✅ `.gitattributes` - Git line endings

---

## 🎯 How to Use (Windows - PowerShell)

### Check Current Version:

```powershell
.\release.ps1 -Current
```

Output:

```
Latest release tag: v0.1.0
Status: Current commit is not tagged
```

### Create Patch Release (Bug Fixes):

```powershell
# 1. Make your changes
# 2. Commit them
git add .
git commit -m "Fix user login bug"
git push

# 3. Create patch release (v0.1.0 → v0.1.1)
.\release.ps1 -Patch
```

### Create Minor Release (New Features):

```powershell
# 1. Add new feature
# 2. Commit
git add .
git commit -m "Add quiz selector feature"
git push

# 3. Create minor release (v0.1.1 → v0.2.0)
.\release.ps1 -Minor
```

### Create Major Release (Breaking Changes):

```powershell
# 1. Make breaking changes
# 2. Commit
git add .
git commit -m "Redesign entire UI"
git push

# 3. Create major release (v0.2.0 → v1.0.0)
.\release.ps1 -Major
```

### Beta/RC Releases:

```powershell
# Create beta release
.\release.ps1 -Minor -Name beta
# Creates: v0.3.0-beta

# Create release candidate
.\release.ps1 -Major -Name rc1
# Creates: v1.0.0-rc1
```

### Set Specific Version:

```powershell
.\release.ps1 -SetTag v1.0.0
```

---

## 🚀 Complete Release Workflow

### Recommended Process:

#### 1. Pre-Release Checks:

```powershell
.\scripts\pre-release.ps1
```

This will:

- ✅ Check for uncommitted changes
- ✅ Run linter
- ✅ Build frontend
- ✅ Type-check backend

#### 2. Create Release Tag:

```powershell
.\release.ps1 -Minor  # or -Patch, -Major
```

#### 3. Deploy to Production:

```powershell
.\deploy-all.ps1
```

This will:

- ✅ Deploy backend to Cloudflare Workers
- ✅ Build and deploy frontend to Cloudflare Pages
- ✅ Show live URLs

#### 4. Update Changelog:

Edit `CHANGELOG.md` and add your changes:

```markdown
## [0.2.0] - 2025-10-08

### Added

- Quiz selector feature
- New user profile stats

### Fixed

- Login bug on mobile devices
```

---

## 📋 npm Scripts

You can also use these shortcuts:

```powershell
# Check current version
npm run release:current

# Create patch release
npm run release:patch

# Create minor release
npm run release:minor

# Create major release
npm run release:major

# Deploy everything
npm run deploy:all
```

---

## 🤖 Automated Deployment (GitHub Actions)

If you push to GitHub, deployment is automatic!

### Setup GitHub Actions:

1. **Create GitHub repo** (if not already):

   ```powershell
   git init
   git add .
   git commit -m "Initial commit"
   git remote add origin https://github.com/YOUR-USERNAME/quizlink.git
   git push -u origin main
   ```

2. **Add GitHub Secrets**:

   - Go to: Settings → Secrets and variables → Actions
   - Add these secrets:
     - `CLOUDFLARE_API_TOKEN` - Get from Cloudflare dashboard
     - `CLOUDFLARE_ACCOUNT_ID` - `e6d408ebc85e159e6e22ee963641d342`
     - `VITE_API_URL` - `https://quizlink-api.humzab1711.workers.dev`
     - `VITE_WS_URL` - `wss://quizlink-api.humzab1711.workers.dev`

3. **Push code**:

   ```powershell
   git push
   ```

4. **Watch it deploy!**
   - Go to: Actions tab on GitHub
   - See deployment progress

### What Gets Automated:

- **On push to main** → Deploy backend + frontend
- **On tag creation** → Create GitHub release + deploy
- **On PR** → Run tests and linting

---

## 📝 Version Files

### VERSION File:

```
0.1.0
```

- Current version number
- Updated by scripts
- Single source of truth

### package.json:

```json
{
  "version": "0.1.0"
}
```

- Frontend version
- Auto-updated by script

### workers/package.json:

```json
{
  "version": "0.1.0"
}
```

- Backend version
- Stays in sync

---

## 🎯 Release Examples

### Scenario 1: Bug Fix Release

```powershell
# You: Fixed authentication bug
git add .
git commit -m "Fix: User authentication timeout issue"
git push

# Check current version
.\release.ps1 -Current
# Output: v0.1.0

# Create patch release
.\release.ps1 -Patch
# Creates: v0.1.1

# Deploy
.\deploy-all.ps1
```

### Scenario 2: New Feature Release

```powershell
# You: Added quiz selector
git add .
git commit -m "Feature: Add quiz selector to join screen"
git push

# Create minor release
.\release.ps1 -Minor
# Creates: v0.2.0

# Deploy
.\deploy-all.ps1
```

### Scenario 3: Beta Testing

```powershell
# You: Experimental timer mode
git add .
git commit -m "Experimental: Timer mode for questions"
git push

# Create beta release
.\release.ps1 -Minor -Name beta
# Creates: v0.3.0-beta

# Deploy to test
.\deploy-all.ps1
```

---

## 🔍 What the Scripts Do

### release.ps1 / release.sh

1. **Sync tags** from remote
2. **Get latest tag** (e.g., v0.1.0)
3. **Calculate new version** based on flag
4. **Delete old tag** if exists (cleanup)
5. **Create new tag** locally
6. **Push tag** to remote
7. **Show GitHub release URL**

### deploy-all.ps1 / deploy-all.sh

1. **Install** worker dependencies
2. **Deploy** backend to Cloudflare Workers
3. **Install** frontend dependencies
4. **Build** frontend (production mode)
5. **Deploy** to Cloudflare Pages
6. **Show** live URLs

### pre-release.ps1 / pre-release.sh

1. **Check** branch (warn if not main)
2. **Check** for uncommitted changes
3. **Run** linter
4. **Build** frontend
5. **Type-check** backend
6. **Confirm** ready for release

---

## 📊 GitHub Integration

### Releases Page:

After tagging, GitHub creates a release at:

```
https://github.com/YOUR-USERNAME/quizlink/releases
```

### Features:

- 📝 Auto-generated changelog
- 🔗 Links to deployment
- 📎 Download source code
- 🏷️ Tag browsing

---

## 🛠️ Customization

### Change Version Number Format:

Edit `release.ps1` or `release.sh` to modify versioning logic.

### Add Pre-Release Checks:

Edit `scripts/pre-release.ps1`:

```powershell
# Add custom checks
Write-Host "Running custom checks..." -ForegroundColor Cyan
# Your checks here
```

### Modify Deployment:

Edit `deploy-all.ps1` to add steps:

```powershell
# Step 3: Run database migrations
Write-Host "📦 Step 3: Running migrations..." -ForegroundColor Yellow
# Migration commands
```

---

## 🐛 Troubleshooting

### "Error: Current commit is already tagged"

```powershell
# Force new tag on same commit
.\release.ps1 -Patch -Force
```

### "Tag already exists"

Script auto-deletes and recreates. If issues:

```powershell
# Manually delete
git tag -d v0.1.0
git push --delete origin v0.1.0

# Create again
.\release.ps1 -Patch
```

### "No existing tags found"

First release! Start from v0.1.0:

```powershell
.\release.ps1 -SetTag v0.1.0
```

### Script won't run

Make sure you're in PowerShell (not CMD):

```powershell
# Check PowerShell version
$PSVersionTable

# Run script
.\release.ps1 -Current
```

---

## 🎯 Quick Reference

| Task          | Command                           |
| ------------- | --------------------------------- |
| Check version | `.\release.ps1 -Current`          |
| Patch release | `.\release.ps1 -Patch`            |
| Minor release | `.\release.ps1 -Minor`            |
| Major release | `.\release.ps1 -Major`            |
| Beta release  | `.\release.ps1 -Minor -Name beta` |
| Set version   | `.\release.ps1 -SetTag v1.0.0`    |
| Full deploy   | `.\deploy-all.ps1`                |
| Pre-check     | `.\scripts\pre-release.ps1`       |

---

## 📚 Files Created

```
quizlink/
├── release.sh              # Bash release script
├── release.ps1             # PowerShell release script ← USE THIS!
├── deploy-all.sh           # Bash deployment
├── deploy-all.ps1          # PowerShell deployment ← USE THIS!
├── VERSION                 # Current version number
├── CHANGELOG.md            # Version history
├── RELEASE_GUIDE.md        # This file
├── scripts/
│   ├── pre-release.sh      # Pre-release checks (bash)
│   ├── pre-release.ps1     # Pre-release checks (PS)
│   └── update-version.js   # Version sync utility
├── .github/
│   ├── workflows/
│   │   ├── deploy.yml      # Auto-deployment
│   │   ├── test.yml        # CI testing
│   │   └── release.yml     # Release automation
│   └── ISSUE_TEMPLATE/
│       ├── bug_report.md   # Bug template
│       └── feature_request.md # Feature template
├── .vscode/
│   ├── settings.json       # VS Code config
│   └── extensions.json     # Recommended extensions
└── .gitattributes          # Git line ending rules
```

---

## 🎉 Your Release System is Ready!

### Try it now:

```powershell
# See current status
.\release.ps1 -Current

# If you have changes, commit them:
git add .
git commit -m "Add release system"
git push

# Create your first official release!
.\release.ps1 -SetTag v0.1.0

# Deploy it!
.\deploy-all.ps1
```

---

## 🌟 Benefits

✅ **Automated versioning** - No manual version bumps  
✅ **Consistent releases** - Same process every time  
✅ **Git integration** - Tags tied to commits  
✅ **Deployment automation** - One command deploys all  
✅ **GitHub releases** - Auto-generated release notes  
✅ **Pre-release validation** - Catch errors before releasing  
✅ **Cross-platform** - Works on Windows, Mac, Linux

---

**Everything is set up and ready to use!** 🚀

Start managing releases with professional version control!
