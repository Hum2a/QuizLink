# 📁 QuizLink Project Structure

## Overview

This document explains the organization of the QuizLink repository. Everything is organized by purpose for easy navigation and maintenance.

---

## 📂 Root Directory

```
quizlink/
├── .github/              # GitHub configuration
├── .vscode/              # VS Code configuration
├── config/               # Configuration templates
├── db/                   # Database schemas
├── docs/                 # Documentation
├── public/               # Static assets
├── scripts/              # Utility scripts
├── src/                  # Frontend source code
├── workers/              # Backend (Cloudflare Workers)
├── .editorconfig         # Editor configuration
├── .gitattributes        # Git file handling
├── .gitignore            # Git ignore patterns
├── .prettierrc           # Prettier configuration
├── .prettierignore       # Prettier ignore patterns
├── CHANGELOG.md          # Version history
├── CODE_OF_CONDUCT.md    # Community guidelines
├── CONTRIBUTING.md       # Contribution guide
├── eslint.config.js      # ESLint configuration
├── index.html            # HTML entry point
├── LICENSE               # MIT License
├── package.json          # Frontend dependencies
├── package-lock.json     # Dependency lock file
├── README.md             # Main documentation
├── release.ps1           # Release script (Windows)
├── release.sh            # Release script (Unix)
├── SECURITY.md           # Security policy
├── tsconfig.*.json       # TypeScript configurations
├── VERSION               # Current version number
└── vite.config.ts        # Vite configuration
```

---

## 📚 Documentation (`docs/`)

All user-facing and technical documentation.

```
docs/
├── START_HERE.md              # 🚀 Quick start guide
├── DEPLOYMENT_GUIDE.md        # 📦 Deployment instructions
├── USER_ACCOUNTS_GUIDE.md     # 👤 User system guide
├── ADMIN_SETUP.md             # 👑 Admin features guide
├── AUTH_GUIDE.md              # 🔐 Authentication details
├── ARCHITECTURE.md            # 🏛️ Technical architecture
├── RELEASE_GUIDE.md           # 📦 Release management
├── PROJECT_STRUCTURE.md       # 📁 This file
├── ENV_SETUP_GUIDE.md         # ⚙️ Environment setup
├── ADMIN_FEATURES.md          # 👑 Admin feature list
├── COMPLETE_SETUP.md          # 📋 Complete setup guide
├── FINAL_SETUP_STEPS.md       # ✅ Final setup steps
├── PRODUCTION_ARCHITECTURE.md # 🏗️ Production details
├── QUICK_START.md             # ⚡ Quick start
├── SETUP_INSTRUCTIONS.md      # 📝 Setup instructions
└── UPDATED_START_GUIDE.md     # 🔄 Updated guide
```

### Documentation Guide

- **For new users:** Start with `START_HERE.md`
- **For deployment:** Read `DEPLOYMENT_GUIDE.md`
- **For contributors:** See `CONTRIBUTING.md` (root)
- **For architecture:** Check `ARCHITECTURE.md`

---

## 🔧 Configuration (`config/`)

Template files for environment configuration.

```
config/
├── env.local.template        # Local development env
├── env.production.template   # Production env
└── .env.template             # Generic template
```

**Usage:**
```bash
npm run setup:env  # Copies templates to root
```

---

## 🗄️ Database (`db/`)

PostgreSQL schema and seed data.

```
db/
├── schema.sql        # Main database schema
└── seed-admin.sql    # Sample admin account
```

**Tables:**
- `users` - User accounts
- `admins` - Admin accounts
- `quiz_templates` - Quiz definitions
- `questions` - Question bank
- `quiz_questions` - Quiz-question mapping
- `game_sessions` - Game history
- `player_scores` - Score records
- `categories` - Quiz categories

---

## 🎨 Frontend (`src/`)

React application source code.

```
src/
├── components/              # Reusable components
│   ├── JoinScreen.tsx      # Join room screen
│   ├── Lobby.tsx           # Waiting lobby
│   ├── PlayerView.tsx      # Player game view
│   ├── AdminView.tsx       # Admin game control
│   ├── ResultsView.tsx     # Score display
│   └── QuestionForm.tsx    # Question editor
├── pages/                  # Route pages
│   ├── UserRegister.tsx    # User signup
│   ├── UserLogin.tsx       # User login
│   ├── UserProfile.tsx     # User dashboard
│   ├── AdminDashboard.tsx  # Admin home
│   ├── QuizLibrary.tsx     # Quiz list
│   ├── QuizEditor.tsx      # Quiz builder
│   ├── Analytics.tsx       # Quiz analytics
│   ├── AdminLogin.tsx      # Admin login
│   └── AdminRegister.tsx   # Admin signup
├── services/               # API clients
│   ├── api.ts             # REST API
│   ├── userApi.ts         # User endpoints
│   ├── adminApi.ts        # Admin endpoints
│   └── websocket.ts       # WebSocket client
├── styles/                # CSS files
│   ├── App.css           # Global styles
│   └── admin.css         # Admin styles
├── types.ts               # TypeScript types
├── App.tsx                # Main app
├── GameFlow.tsx           # Game logic
└── main.tsx               # Entry point
```

### Key Components

**JoinScreen** - First screen, join/create room  
**Lobby** - Wait for players, show room code  
**PlayerView** - Answer questions, see score  
**AdminView** - Control game, manage players  
**ResultsView** - Final leaderboard  
**QuestionForm** - Admin question editor

### Pages

**User Flow:** Register → Login → Profile → Join Game  
**Admin Flow:** Login → Dashboard → Library → Editor → Analytics

---

## ⚙️ Backend (`workers/`)

Cloudflare Workers serverless backend.

```
workers/
├── src/
│   ├── index.ts         # Main worker
│   ├── game-room.ts     # Durable Object
│   ├── auth.ts          # Admin auth
│   ├── user-auth.ts     # User auth
│   └── types.ts         # Shared types
├── package.json         # Backend dependencies
├── tsconfig.json        # TypeScript config
└── wrangler.toml        # Cloudflare config
```

### API Endpoints

**User Auth:**
- `POST /api/auth/register` - Sign up
- `POST /api/auth/login` - Sign in

**User Data:**
- `GET /api/user/profile` - Get profile
- `GET /api/user/stats` - Get stats

**Admin Auth:**
- `POST /api/admin/login` - Admin login

**Quiz Management:**
- `GET /api/quizzes` - List quizzes
- `POST /api/quizzes` - Create quiz
- `GET /api/quiz/:id` - Get quiz
- `PUT /api/quiz/:id` - Update quiz
- `DELETE /api/quiz/:id` - Delete quiz

**Game:**
- `GET /ws/game/:roomCode` - Join game (WebSocket)

---

## 🛠️ Scripts (`scripts/`)

Utility and deployment scripts.

```
scripts/
├── deploy-all.ps1       # Full deployment (Windows)
├── deploy-all.sh        # Full deployment (Unix)
├── pre-release.ps1      # Pre-release checks (Windows)
├── pre-release.sh       # Pre-release checks (Unix)
├── update-version.js    # Version sync utility
├── start-client.bat     # Start frontend (Windows)
└── start-server.bat     # Start backend (Windows)
```

### Usage

```bash
# Windows
.\scripts\deploy-all.ps1
.\scripts\pre-release.ps1

# Linux/Mac
./scripts/deploy-all.sh
./scripts/pre-release.sh

# Version management
node scripts/update-version.js 1.2.3
```

---

## 🤖 GitHub (`/.github/`)

GitHub-specific configuration.

```
.github/
├── workflows/
│   ├── deploy.yml       # Auto-deployment
│   ├── test.yml         # CI testing
│   └── release.yml      # Release automation
├── ISSUE_TEMPLATE/
│   ├── bug_report.md    # Bug template
│   └── feature_request.md # Feature template
├── PULL_REQUEST_TEMPLATE.md # PR template
├── dependabot.yml       # Dependency updates
└── FUNDING.yml          # Sponsorship config
```

### GitHub Actions

**deploy.yml** - Deploys on push to main  
**test.yml** - Runs tests on PRs  
**release.yml** - Creates releases on tags

---

## 🎯 VS Code (`/.vscode/`)

Editor configuration for VS Code.

```
.vscode/
├── settings.json       # Editor settings
└── extensions.json     # Recommended extensions
```

**Recommended Extensions:**
- ESLint
- Prettier
- TypeScript
- Tailwind CSS (if added)
- Cloudflare Wrangler

---

## 🗂️ File Organization Principles

### By Type

- **Source Code** → `src/` (frontend) or `workers/src/` (backend)
- **Documentation** → `docs/`
- **Configuration** → `config/` or root (if widely used)
- **Scripts** → `scripts/`
- **Tests** → `tests/` (when added)
- **Assets** → `public/`

### By Feature

Within `src/`, organize by feature:

```
src/
├── components/    # Shared UI
├── pages/         # Routes
├── services/      # External APIs
├── hooks/         # Custom hooks
├── utils/         # Utilities
└── types.ts       # Types
```

### Naming Conventions

**Files:**
- Components: PascalCase (e.g., `UserProfile.tsx`)
- Utils: camelCase (e.g., `formatDate.ts`)
- Configs: kebab-case (e.g., `vite.config.ts`)

**Directories:**
- Lowercase (e.g., `components/`, `services/`)
- Descriptive (e.g., `admin-dashboard/`)

---

## 📦 Build Outputs

```
dist/              # Frontend build (gitignored)
.wrangler/         # Worker build (gitignored)
node_modules/      # Dependencies (gitignored)
```

**Never commit:**
- `dist/`
- `.wrangler/`
- `node_modules/`
- `.env*`
- Build artifacts

---

## 🔍 Finding Files

### By Purpose

**Want to...** → **Go to...**

- Modify UI → `src/components/` or `src/pages/`
- Change API → `workers/src/index.ts`
- Update docs → `docs/`
- Add script → `scripts/`
- Configure build → `vite.config.ts` or `tsconfig.json`
- Set up deployment → `.github/workflows/`
- Manage database → `db/schema.sql`

### By Feature

**Feature** → **Files**

**User Auth:**
- `src/pages/UserRegister.tsx`
- `src/pages/UserLogin.tsx`
- `src/services/userApi.ts`
- `workers/src/user-auth.ts`

**Quiz Game:**
- `src/components/PlayerView.tsx`
- `src/components/AdminView.tsx`
- `src/GameFlow.tsx`
- `workers/src/game-room.ts`

**Admin Dashboard:**
- `src/pages/AdminDashboard.tsx`
- `src/pages/QuizLibrary.tsx`
- `src/pages/QuizEditor.tsx`
- `src/services/adminApi.ts`

---

## 🧹 Cleaning Up

### Remove Unused Files

```bash
# Clean build outputs
rm -rf dist/ .wrangler/

# Clean dependencies
rm -rf node_modules/
npm install

# Clean logs
rm -rf *.log
```

### Find Large Files

```bash
# Windows
Get-ChildItem -Recurse | Sort-Object Length -Descending | Select-Object -First 10

# Linux/Mac
find . -type f -exec du -h {} + | sort -rh | head -n 10
```

---

## 📊 Repository Stats

- **Total Files:** ~150+
- **Source Files:** ~40 (TypeScript/React)
- **Documentation:** ~15 files
- **Configuration:** ~20 files
- **Scripts:** ~10 files

---

## 🎯 Best Practices

### When Adding Files

1. **Choose right directory** - Follow structure
2. **Use naming conventions** - Be consistent
3. **Update documentation** - Document new features
4. **Add to .gitignore** - If build output

### When Moving Files

1. **Update imports** - Fix all references
2. **Test thoroughly** - Ensure nothing breaks
3. **Update scripts** - Check script paths
4. **Update docs** - Reflect new structure

---

## 🔗 Related Documentation

- [Contributing Guide](../CONTRIBUTING.md)
- [Architecture](ARCHITECTURE.md)
- [Deployment Guide](DEPLOYMENT_GUIDE.md)

---

**Questions?** Check other docs or open an issue!

