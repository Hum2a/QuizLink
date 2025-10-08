# 📦 QuizLink Release Guide

## Release Management System

QuizLink uses **semantic versioning** for releases with automated tag management.

---

## 🎯 Quick Release

### On Windows (PowerShell):

```powershell
# Patch release (bug fixes) - v0.0.X
.\release.ps1 -Patch

# Minor release (new features) - v0.X.0
.\release.ps1 -Minor

# Major release (breaking changes) - vX.0.0
.\release.ps1 -Major

# With custom name (e.g., beta, rc1)
.\release.ps1 -Minor -Name beta

# Set specific version
.\release.ps1 -SetTag v1.2.3

# Check current version
.\release.ps1 -Current
```

### On Linux/Mac (Bash):

```bash
# Make executable (first time only)
chmod +x release.sh

# Patch release
./release.sh --patch

# Minor release
./release.sh --minor

# Major release
./release.sh --major

# With custom name
./release.sh --minor --name beta

# Set specific version
./release.sh --set-tag v1.2.3

# Check current version
./release.sh --current
```

---

## 📋 Semantic Versioning

QuizLink follows [SemVer](https://semver.org/):

### Version Format: `vMAJOR.MINOR.PATCH[-NAME]`

**MAJOR** (vX.0.0) - Breaking changes
- Changed API structure
- Removed features
- Incompatible updates
- Example: `v2.0.0`

**MINOR** (v0.X.0) - New features (backwards compatible)
- Added new admin features
- New quiz types
- Enhanced user profiles
- Example: `v0.5.0`

**PATCH** (v0.0.X) - Bug fixes
- Fixed authentication bug
- UI improvements
- Performance optimizations
- Example: `v0.0.3`

**NAME** (optional suffix)
- `v1.0.0-beta` - Beta release
- `v1.0.0-rc1` - Release candidate
- `v1.0.0-alpha` - Alpha version

---

## 🚀 Release Workflow

### Standard Release Process:

1. **Make changes** to code
2. **Commit changes**:
   ```powershell
   git add .
   git commit -m "Add new feature"
   git push
   ```

3. **Create release tag**:
   ```powershell
   .\release.ps1 -Minor  # or -Patch, -Major
   ```

4. **Deploy** (if not using GitHub Actions):
   ```powershell
   # Deploy backend
   cd workers
   npm run deploy
   
   # Deploy frontend
   cd ..
   npm run deploy:pages
   ```

5. **Update CHANGELOG.md**:
   - Document changes under new version

---

## 🤖 Automated Deployment (GitHub Actions)

If your repo is on GitHub, deployment happens automatically!

### Setup (One-time):

1. **Go to GitHub repo settings**
2. **Add secrets**:
   - `CLOUDFLARE_API_TOKEN` - Your Cloudflare API token
   - `CLOUDFLARE_ACCOUNT_ID` - `e6d408ebc85e159e6e22ee963641d342`
   - `VITE_API_URL` - `https://quizlink-api.humzab1711.workers.dev`
   - `VITE_WS_URL` - `wss://quizlink-api.humzab1711.workers.dev`

3. **Push code** or **create tag**
4. **GitHub Actions** auto-deploys!

### Triggers:

- **Push to main/master** → Auto-deploy to production
- **Create tag (v*)** → Create GitHub release + deploy
- **Pull request** → Run tests and linting

---

## 📝 Release Checklist

Before creating a release:

- [ ] All changes committed
- [ ] Code tested locally
- [ ] No linting errors (`npm run lint`)
- [ ] Build succeeds (`npm run build`)
- [ ] Database migrations documented (if any)
- [ ] CHANGELOG.md updated
- [ ] Documentation updated

---

## 🏷️ Tag Examples

### Current Version:

```powershell
.\release.ps1 -Current
```

Output:
```
Latest release tag: v0.1.0
Status: Current commit is tagged
```

### Create Patch Release:

```powershell
# Fix a bug, commit it
git add .
git commit -m "Fix user login bug"
git push

# Create tag
.\release.ps1 -Patch
```

Creates: `v0.1.1`

### Create Minor Release:

```powershell
# Add new feature, commit it
git add .
git commit -m "Add quiz selector feature"
git push

# Create tag
.\release.ps1 -Minor
```

Creates: `v0.2.0`

### Create Beta Release:

```powershell
# Add experimental feature
git add .
git commit -m "Add experimental timer mode"
git push

# Create beta tag
.\release.ps1 -Minor -Name beta
```

Creates: `v0.3.0-beta`

### Override Version:

```powershell
# Set to specific version
.\release.ps1 -SetTag v1.0.0
```

Creates: `v1.0.0`

---

## 🔄 Version History

View all releases:

```powershell
# List all tags
git tag -l

# View tag details
git show v0.1.0

# View releases on GitHub
# https://github.com/YOUR-USERNAME/quizlink/releases
```

---

## 📊 Deployment Strategy

### Development:
```
feature-branch → PR → Merge to main → Auto-deploy
```

### Production:
```
main branch → Create tag → GitHub Release → Auto-deploy
```

### Hotfix:
```
hotfix-branch → Merge to main → Patch tag → Deploy
```

---

## 🎯 Current Deployment URLs

After each release:

- **Frontend:** https://quizlink.pages.dev
- **Backend:** https://quizlink-api.humzab1711.workers.dev
- **Admin:** https://quizlink.pages.dev/admin
- **Docs:** See README.md and START_HERE.md

---

## 🐛 Rollback

If you need to rollback to a previous version:

```powershell
# List tags
git tag -l

# Checkout previous version
git checkout v0.1.0

# Deploy old version
npm run deploy:pages
cd workers && npm run deploy
```

---

## 📦 Manual Deployment

If not using GitHub Actions:

### Quick Deploy:

```powershell
# Update version
.\release.ps1 -Minor

# Deploy everything
cd workers
npm install
npm run deploy
cd ..
npm install
npm run deploy:pages
```

### Automated Script:

```powershell
# Coming soon: deploy-all.ps1
```

---

## 🔧 Troubleshooting

### "Error: Current commit is already tagged"

Use `-Force`:
```powershell
.\release.ps1 -Patch -Force
```

### "Tag already exists"

Script auto-deletes old tags with same name. If issues persist:
```powershell
# Delete tag manually
git tag -d v0.1.0
git push --delete origin v0.1.0

# Create new tag
.\release.ps1 -Patch
```

### "No existing tags found"

First release! Script starts from v0.0.0:
```powershell
.\release.ps1 -SetTag v0.1.0
```

---

## 📚 Related Files

- `release.sh` - Bash release script (Linux/Mac)
- `release.ps1` - PowerShell release script (Windows)
- `CHANGELOG.md` - Version history
- `VERSION` - Current version file
- `.github/workflows/deploy.yml` - Auto-deployment
- `.github/workflows/test.yml` - CI tests

---

## 🎉 Best Practices

1. **Commit before releasing** - Always commit changes first
2. **Update CHANGELOG.md** - Document changes
3. **Test before tagging** - Ensure build works
4. **Use semantic versioning** - Follow SemVer rules
5. **Tag after merge** - Tag on main/master branch
6. **Deploy after tagging** - Keep deployments in sync

---

**Happy releasing!** 🚀

For questions, see README.md or contact the maintainer.

