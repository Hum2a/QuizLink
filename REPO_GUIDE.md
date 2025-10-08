# 🎯 QuizLink Repository Guide

**Welcome to the QuizLink codebase!** This guide helps you navigate the repository efficiently.

---

## ⚡ Quick Links

| Purpose | Link |
|---------|------|
| 🚀 **Get Started** | [docs/START_HERE.md](docs/START_HERE.md) |
| 📦 **Deploy** | [docs/DEPLOYMENT_GUIDE.md](docs/DEPLOYMENT_GUIDE.md) |
| 🏛️ **Architecture** | [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) |
| 🤝 **Contribute** | [CONTRIBUTING.md](CONTRIBUTING.md) |
| 📁 **Project Structure** | [docs/PROJECT_STRUCTURE.md](docs/PROJECT_STRUCTURE.md) |
| 🔒 **Security** | [SECURITY.md](SECURITY.md) |
| 📝 **Releases** | [docs/RELEASE_GUIDE.md](docs/RELEASE_GUIDE.md) |

---

## 🎯 Quick Actions

### I Want To...

#### Start Development
```bash
npm install
cd workers && npm install && cd ..
npm run setup:env
npm run dev  # Terminal 1
npm run dev:worker  # Terminal 2
```

#### Deploy to Production
```bash
.\scripts\deploy-all.ps1  # Windows
./scripts/deploy-all.sh   # Linux/Mac
```

#### Create a Release
```bash
.\release.ps1 -Minor  # Windows
./release.sh --minor  # Linux/Mac
```

#### Run Pre-Release Checks
```bash
.\scripts\pre-release.ps1  # Windows
./scripts/pre-release.sh   # Linux/Mac
```

#### View Documentation
All docs are in [docs/](docs/) directory.

---

## 📂 Where to Find Things

### Frontend Changes
- **Components:** `src/components/`
- **Pages:** `src/pages/`
- **Styles:** `src/styles/`
- **Services:** `src/services/`
- **Types:** `src/types.ts`

### Backend Changes
- **Main Worker:** `workers/src/index.ts`
- **Game Logic:** `workers/src/game-room.ts`
- **Auth:** `workers/src/auth.ts`, `workers/src/user-auth.ts`

### Database
- **Schema:** `db/schema.sql`
- **Seed Data:** `db/seed-admin.sql`

### Documentation
- **All Docs:** `docs/`
- **Contributing:** `CONTRIBUTING.md`
- **Security:** `SECURITY.md`
- **License:** `LICENSE`

### Scripts
- **All Scripts:** `scripts/`
- **Release:** `release.ps1` / `release.sh` (root)
- **Deploy:** `scripts/deploy-all.*`

### Configuration
- **Environment:** `config/*.template`
- **TypeScript:** `tsconfig.*.json`
- **Vite:** `vite.config.ts`
- **ESLint:** `eslint.config.js`
- **Prettier:** `.prettierrc`
- **Editor:** `.editorconfig`

---

## 🛠️ Development Workflow

### 1. Pick an Issue
Browse [GitHub Issues](https://github.com/YOUR-USERNAME/quizlink/issues)

### 2. Fork & Clone
```bash
git clone https://github.com/YOUR-USERNAME/quizlink.git
cd quizlink
```

### 3. Create Branch
```bash
git checkout -b feature/amazing-feature
```

### 4. Make Changes
Edit files, test locally

### 5. Commit
```bash
git add .
git commit -m "feat: add amazing feature"
```

### 6. Push
```bash
git push origin feature/amazing-feature
```

### 7. Create PR
Open pull request on GitHub

---

## 🎨 Code Standards

### TypeScript
- Use types, avoid `any`
- Define interfaces
- Export types separately

### React
- Functional components
- TypeScript props
- Small, focused components

### CSS
- Use existing styles
- Mobile-first
- Follow naming conventions

### Commits
```
feat: new feature
fix: bug fix
docs: documentation
style: formatting
refactor: code restructure
perf: performance
test: tests
chore: maintenance
```

---

## 📚 Documentation Structure

```
docs/
├── START_HERE.md              # ⭐ Start here!
├── DEPLOYMENT_GUIDE.md        # Deploy to production
├── USER_ACCOUNTS_GUIDE.md     # User system
├── ADMIN_SETUP.md             # Admin features
├── AUTH_GUIDE.md              # Authentication
├── ARCHITECTURE.md            # Technical details
├── RELEASE_GUIDE.md           # Releases
└── PROJECT_STRUCTURE.md       # File organization
```

**Quick tip:** Start with `START_HERE.md` then explore based on your needs.

---

## 🤖 GitHub Actions

### Workflows

**deploy.yml** - Auto-deployment on push to main  
**test.yml** - CI testing on PRs  
**release.yml** - Create releases on tags  
**codeql.yml** - Security scanning

### Secrets Required

Add these in GitHub Settings → Secrets:
- `CLOUDFLARE_API_TOKEN`
- `CLOUDFLARE_ACCOUNT_ID`
- `VITE_API_URL`
- `VITE_WS_URL`

---

## 🔍 Common Tasks

### Add a New Page

1. Create `src/pages/NewPage.tsx`
2. Add route in `src/App.tsx`
3. Update navigation
4. Test on mobile

### Add API Endpoint

1. Edit `workers/src/index.ts`
2. Add handler function
3. Update `src/services/api.ts`
4. Test with Postman

### Modify Database

1. Edit `db/schema.sql`
2. Run migration in Neon
3. Update worker queries
4. Update types

### Add Documentation

1. Create `docs/NEW_DOC.md`
2. Link from `README.md`
3. Update `docs/PROJECT_STRUCTURE.md`

---

## 🐛 Debugging

### Frontend Issues
```bash
# Check browser console
# Open DevTools → Console

# Check network requests
# Open DevTools → Network
```

### Backend Issues
```bash
# View worker logs
cd workers
wrangler tail

# Check deployment
wrangler deployments list
```

### Database Issues
```bash
# Connect to Neon
# Use Neon SQL Editor in dashboard
# or psql with connection string
```

---

## 🧪 Testing

### Manual Testing Checklist

- [ ] Desktop (Chrome, Firefox, Safari)
- [ ] Mobile (iOS, Android)
- [ ] User registration & login
- [ ] Quiz gameplay
- [ ] Admin dashboard
- [ ] WebSocket connections

### Running Linter

```bash
npm run lint
```

### Build Test

```bash
npm run build
cd workers && npm run deploy:dry
```

---

## 📦 Release Process

### Standard Release

```bash
# 1. Run checks
.\scripts\pre-release.ps1

# 2. Create tag
.\release.ps1 -Minor

# 3. Deploy
.\scripts\deploy-all.ps1

# 4. Update CHANGELOG.md
```

See [docs/RELEASE_GUIDE.md](docs/RELEASE_GUIDE.md) for details.

---

## 🎯 Project Goals

### Technical
- ✅ TypeScript throughout
- ✅ Serverless architecture
- ✅ Real-time multiplayer
- ✅ Mobile-responsive
- ✅ Production-ready

### Features
- ✅ User accounts
- ✅ Admin dashboard
- ✅ Quiz management
- ✅ Analytics
- 🚧 Image uploads (planned)
- 🚧 Timer mode (planned)
- 🚧 Team mode (planned)

---

## 🏆 Portfolio Highlights

**Show this repository in your portfolio!**

### Key Features to Highlight

1. **Real-time WebSocket** - Durable Objects
2. **Serverless Architecture** - Cloudflare Workers
3. **Database Integration** - Neon PostgreSQL
4. **User Authentication** - JWT tokens
5. **Admin Dashboard** - Complete CRUD
6. **Global Deployment** - Edge computing
7. **TypeScript** - Type-safe codebase
8. **CI/CD Pipeline** - GitHub Actions
9. **Professional Docs** - Comprehensive guides
10. **Release System** - Semantic versioning

### Technical Skills Demonstrated

- React 19 with hooks
- TypeScript
- WebSocket communication
- RESTful API design
- Database design (PostgreSQL)
- Authentication & authorization
- Real-time state management
- Cloudflare Workers/Durable Objects
- CI/CD automation
- Git workflow
- Technical documentation

---

## 📊 Repository Stats

- **Language:** TypeScript
- **Frontend:** React 19
- **Backend:** Cloudflare Workers
- **Database:** PostgreSQL (Neon)
- **Lines of Code:** ~5,000+
- **Components:** 20+
- **API Endpoints:** 15+
- **Documentation:** 15+ files

---

## 🌟 Star This Repo!

If you find this useful, please ⭐ star the repository!

---

## 📞 Get Help

- 📖 **Documentation:** Check [docs/](docs/)
- 🐛 **Issues:** [GitHub Issues](https://github.com/YOUR-USERNAME/quizlink/issues)
- 💬 **Discussions:** [GitHub Discussions](https://github.com/YOUR-USERNAME/quizlink/discussions)
- 📧 **Email:** your@email.com

---

## 🎉 Welcome!

Thank you for checking out QuizLink! Whether you're here to use it, learn from it, or contribute to it, we're glad you're here.

**Happy coding!** 🚀

