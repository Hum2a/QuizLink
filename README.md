# 🎮 QuizLink

<div align="center">

**A real-time multiplayer quiz platform with user accounts, admin dashboard, and global deployment**

[![Live Demo](https://img.shields.io/badge/demo-live-success?style=for-the-badge)](https://quizlink.pages.dev)
[![License](https://img.shields.io/badge/license-MIT-blue?style=for-the-badge)](LICENSE)
[![Cloudflare](https://img.shields.io/badge/Cloudflare-Workers-orange?style=for-the-badge&logo=cloudflare)](https://workers.cloudflare.com)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9-blue?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react)](https://reactjs.org/)

[Live Demo](https://quizlink.pages.dev) • [Documentation](docs/START_HERE.md) • [Report Bug](https://github.com/YOUR-USERNAME/quizlink/issues) • [Request Feature](https://github.com/YOUR-USERNAME/quizlink/issues)

</div>

---

## ✨ Features

### 🎮 For Players

- **User Accounts** - Personal profiles with stats and game history
- **Real-Time Multiplayer** - Play with unlimited players globally
- **Live Leaderboards** - See rankings update in real-time
- **Personal Dashboard** - Track your progress and achievements
- **Mobile Optimized** - Perfect experience on any device
- **Persistent Stats** - All your scores saved forever

### 👑 For Quiz Hosts

- **Game Control Panel** - Manage quiz flow in real-time
- **Player Management** - See who answered, track progress
- **Custom Room Codes** - Easy joining for participants
- **Live Updates** - Reveal answers, advance questions

### ⚙️ For Admins

- **Visual Quiz Builder** - Create quizzes with drag-and-drop interface
- **Question Bank** - Manage reusable questions
- **Analytics Dashboard** - View quiz performance and top scores
- **Category Organization** - Organize by topic
- **Search & Filter** - Find quizzes easily

---

## 🏗️ Tech Stack

<div align="center">

### Frontend

![React](https://img.shields.io/badge/React-19.1-61DAFB?logo=react&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-5.9-3178C6?logo=typescript&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-7.1-646CFF?logo=vite&logoColor=white)
![React Router](https://img.shields.io/badge/React_Router-6.22-CA4245?logo=react-router&logoColor=white)
![React Icons](https://img.shields.io/badge/React_Icons-5.5-E91E63?logo=react&logoColor=white)

### Backend

![Cloudflare Workers](https://img.shields.io/badge/Cloudflare_Workers-orange?logo=cloudflare&logoColor=white)
![Durable Objects](https://img.shields.io/badge/Durable_Objects-WebSocket-orange)
![Neon](https://img.shields.io/badge/Neon-PostgreSQL-00E699?logo=postgresql&logoColor=white)

### Deployment

![Cloudflare Pages](https://img.shields.io/badge/Cloudflare_Pages-orange?logo=cloudflare&logoColor=white)
![GitHub Actions](https://img.shields.io/badge/GitHub_Actions-CI/CD-2088FF?logo=github-actions&logoColor=white)

</div>

---

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- Cloudflare account (free tier)
- Neon database account (free tier)

### Installation

```bash
# Clone the repository
git clone https://github.com/YOUR-USERNAME/quizlink.git
cd quizlink

# Install dependencies
npm install
cd workers && npm install && cd ..

# Set up environment
npm run setup:env

# Start development servers
npm run dev          # Frontend (Terminal 1)
npm run dev:worker   # Backend (Terminal 2)
```

Visit `http://localhost:5173` 🎉

### Deployment

```bash
# Deploy everything to production
./deploy-all.ps1  # Windows
./deploy-all.sh   # Linux/Mac
```

**📚 Full setup guide:** [docs/START_HERE.md](docs/START_HERE.md)

---

## 📸 Screenshots

<div align="center">

### User Registration

![Registration](https://via.placeholder.com/800x400/667eea/ffffff?text=User+Registration+Screen)

### Quiz Game

![Quiz Game](https://via.placeholder.com/800x400/764ba2/ffffff?text=Real-Time+Quiz+Gameplay)

### Admin Dashboard

![Admin Dashboard](https://via.placeholder.com/800x400/f093fb/ffffff?text=Admin+Quiz+Management)

### User Profile

![User Profile](https://via.placeholder.com/800x400/4facfe/ffffff?text=Personal+Stats+Dashboard)

</div>

---

## 🎯 Use Cases

- 🎂 **Birthday Parties** - Fun trivia for celebrations
- 🏢 **Team Building** - Corporate ice-breakers
- 🎓 **Education** - Interactive classroom quizzes
- 🎪 **Events** - Live audience engagement
- 👨‍👩‍👧‍👦 **Family Game Night** - Compete with loved ones
- 📱 **Virtual Gatherings** - Remote-friendly entertainment

---

## 🏛️ Architecture

```
┌─────────────────────────────────────────────────────┐
│           Cloudflare Global Edge Network             │
│                                                      │
│  ┌──────────────┐         ┌─────────────────────┐  │
│  │   Pages      │         │    Workers          │  │
│  │  (React App) │◀───────▶│  + Durable Objects  │  │
│  │              │ WSS/API │  (Real-time State)  │  │
│  └──────────────┘         └─────────────────────┘  │
│                                    │                 │
└────────────────────────────────────┼─────────────────┘
                                     │
                           ┌─────────▼──────────┐
                           │   Neon Database    │
                           │   (PostgreSQL)     │
                           │   - User Accounts  │
                           │   - Quiz Data      │
                           │   - Game History   │
                           └────────────────────┘
```

**Detailed architecture:** [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md)

---

## 📁 Project Structure

```
quizlink/
├── src/                    # Frontend application
│   ├── components/         # React components
│   ├── pages/              # Route pages
│   ├── services/           # API clients
│   ├── styles/             # CSS modules
│   └── types.ts            # TypeScript types
├── workers/                # Cloudflare Workers backend
│   └── src/
│       ├── index.ts        # Main worker
│       ├── game-room.ts    # Durable Object
│       ├── auth.ts         # Admin authentication
│       └── user-auth.ts    # User authentication
├── db/                     # Database schemas
│   ├── schema.sql          # Main schema
│   └── seed-admin.sql      # Sample data
├── scripts/                # Utility scripts
│   ├── deploy-all.*        # Deployment scripts
│   ├── pre-release.*       # Release validation
│   └── update-version.js   # Version management
├── docs/                   # Documentation
│   ├── START_HERE.md       # Getting started
│   ├── DEPLOYMENT_GUIDE.md # Deployment instructions
│   └── ...                 # More guides
├── config/                 # Configuration files
│   └── *.template          # Environment templates
└── .github/                # GitHub configuration
    ├── workflows/          # CI/CD pipelines
    └── ISSUE_TEMPLATE/     # Issue templates
```

---

## 💻 Development

### Local Development

```bash
# Terminal 1 - Backend
npm run dev:worker

# Terminal 2 - Frontend
npm run dev
```

### Running Tests

```bash
npm run lint       # Run linter
npm run build      # Test production build
npm test           # Run tests (coming soon)
```

### Pre-Release Checks

```bash
# Validate before releasing
./scripts/pre-release.ps1  # Windows
./scripts/pre-release.sh   # Linux/Mac
```

---

## 📦 Deployment

### One-Command Deployment

```powershell
# Windows
.\scripts\deploy-all.ps1

# Linux/Mac
./scripts/deploy-all.sh
```

### Individual Deployments

```bash
npm run deploy:worker  # Backend only
npm run deploy:pages   # Frontend only
npm run deploy:all     # Both
```

### Environment Variables

See [docs/ENV_SETUP_GUIDE.md](docs/ENV_SETUP_GUIDE.md) for complete configuration guide.

---

## 🔖 Releases

### Create Release

```powershell
# Bug fix release (0.1.0 → 0.1.1)
.\release.ps1 -Patch

# New feature release (0.1.1 → 0.2.0)
.\release.ps1 -Minor

# Breaking change release (0.2.0 → 1.0.0)
.\release.ps1 -Major

# Beta release
.\release.ps1 -Minor -Name beta
```

See [docs/RELEASE_GUIDE.md](docs/RELEASE_GUIDE.md) for details.

---

## 🤝 Contributing

Contributions are welcome! Please read our [Contributing Guide](CONTRIBUTING.md) first.

### Steps to Contribute:

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 🔒 Security

Found a security vulnerability? Please read our [Security Policy](SECURITY.md) and report responsibly.

---

## 📚 Documentation

- **[Getting Started](docs/START_HERE.md)** - Complete setup guide
- **[Deployment](docs/DEPLOYMENT_GUIDE.md)** - Deploy to production
- **[User Accounts](docs/USER_ACCOUNTS_GUIDE.md)** - User system guide
- **[Admin Dashboard](docs/ADMIN_SETUP.md)** - Create and manage quizzes
- **[Authentication](docs/AUTH_GUIDE.md)** - Auth system details
- **[Architecture](docs/ARCHITECTURE.md)** - Technical deep-dive
- **[Release Guide](docs/RELEASE_GUIDE.md)** - Version management

---

## 🌐 Live Demo

**🔗 https://quizlink.pages.dev**

Try it yourself:

1. Create an account
2. Join a quiz room
3. Play and see your stats!

**Admin Dashboard:** https://quizlink.pages.dev/admin

---

## 🎯 Roadmap

- [x] User account system
- [x] Real-time multiplayer
- [x] Admin dashboard
- [x] Quiz management
- [x] Analytics
- [ ] Quiz selector (choose quiz before playing)
- [ ] Image upload for questions
- [ ] Timer mode
- [ ] Team mode
- [ ] Global leaderboard
- [ ] Achievement system
- [ ] OAuth integration
- [ ] Mobile app

See [CHANGELOG.md](CHANGELOG.md) for version history.

---

## 🏆 Key Highlights

### Technical Excellence

- ✅ TypeScript throughout
- ✅ Modern React with hooks
- ✅ Real-time WebSocket communication
- ✅ Serverless architecture
- ✅ Edge computing (Cloudflare)
- ✅ Database-backed persistence
- ✅ JWT authentication
- ✅ CI/CD pipeline
- ✅ Semantic versioning

### Production Ready

- ✅ Global CDN delivery
- ✅ Auto-scaling
- ✅ Zero-downtime deploys
- ✅ Error handling
- ✅ Security best practices
- ✅ Mobile responsive
- ✅ Cross-browser compatible

### Developer Experience

- ✅ Hot module reloading
- ✅ Type safety
- ✅ ESLint configuration
- ✅ Release automation
- ✅ Deployment scripts
- ✅ Comprehensive docs

---

## 📊 Stats

- **Lines of Code:** ~5,000+
- **Components:** 20+
- **API Endpoints:** 15+
- **Database Tables:** 10+
- **Deployment Time:** ~2 minutes
- **Global Latency:** <50ms

---

## 👤 Author

**Your Name**

- Portfolio: [yourwebsite.com](https://yourwebsite.com)
- LinkedIn: [linkedin.com/in/yourname](https://linkedin.com/in/yourname)
- GitHub: [@yourusername](https://github.com/yourusername)

---

## 🙏 Acknowledgments

- [Cloudflare Workers](https://workers.cloudflare.com/) - Edge computing platform
- [Neon](https://neon.tech/) - Serverless PostgreSQL
- [React Icons](https://react-icons.github.io/react-icons/) - Icon library
- [Vite](https://vitejs.dev/) - Build tool

---

## 📞 Support

- 📧 Email: your@email.com
- 💬 Discord: [Join our server](https://discord.gg/yourserver)
- 📖 Docs: [docs/START_HERE.md](docs/START_HERE.md)
- 🐛 Issues: [GitHub Issues](https://github.com/YOUR-USERNAME/quizlink/issues)

---

<div align="center">

**Made with ❤️ for fun and learning**

⭐ Star this repo if you find it useful!

</div>
