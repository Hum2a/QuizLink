# Changelog

All notable changes to QuizLink will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [0.1.0] - 2025-10-08

### Added - Initial Release

#### Core Features

- **Complete user account system** - Registration, login, profiles
- **JWT-based authentication** - Secure tokens for users and admins
- **User dashboard** - Personal stats, game history, achievements tracking
- **React Icons integration** - Professional UI throughout
- **Admin dashboard** - Complete quiz management interface
- **Quiz builder** - Visual editor with drag-and-drop
- **Question bank** - Reusable question library
- **Analytics dashboard** - Per-quiz performance metrics
- **Global leaderboards** - Top scores across all games
- **Real-time multiplayer** - WebSocket-based gameplay
- **Category system** - Organize quizzes by topic

#### Technical Features
- **Cloudflare Workers** - Serverless backend
- **Durable Objects** - Stateful WebSocket rooms
- **Neon PostgreSQL** - Serverless database
- **Hyperdrive** - Connection pooling
- **TypeScript** - End-to-end type safety
- **Vite** - Fast dev and build
- **React Router** - Client-side routing

#### Repository
- **Professional documentation** - 15+ comprehensive guides
- **Release automation** - Semantic versioning scripts
- **CI/CD pipeline** - GitHub Actions workflows
- **Code quality** - ESLint, Prettier, EditorConfig
- **Security policy** - Vulnerability reporting process
- **Contributing guide** - Detailed contribution workflow
- **Issue templates** - Bug reports and feature requests
- **Pull request template** - Standardized PR format
- **Dependabot** - Automated dependency updates
- **CodeQL** - Security scanning

#### Project Organization
- **docs/** - All documentation in one place
- **scripts/** - Utility and deployment scripts
- **config/** - Configuration templates
- **.github/** - GitHub workflows and templates
- **.vscode/** - Editor configuration
- **Professional README** - Badges, screenshots, comprehensive guide

### Security
- SHA-256 password hashing (upgrade to bcrypt planned)
- JWT token authentication with expiration
- Protected routes with middleware
- Secure API endpoints with token verification
- Input validation on all endpoints
- SQL injection prevention (parameterized queries)
- CORS configuration
- Environment variable management

---

## [Unreleased]

### Planned Features (Next Releases)

#### v0.2.0 - Quiz Enhancements
- [ ] Quiz selector in join screen
- [ ] Image upload for questions
- [ ] Timer mode for questions
- [ ] Question shuffle option
- [ ] Bonus points for speed

#### v0.3.0 - Social Features
- [ ] Team mode (2v2, 3v3)
- [ ] Friend system
- [ ] Global leaderboard across all quizzes
- [ ] Achievement badges
- [ ] Player profiles (public)

#### v0.4.0 - Authentication Upgrades
- [ ] OAuth integration (Google, GitHub)
- [ ] Email verification
- [ ] Password reset via email
- [ ] Two-factor authentication (2FA)

#### v0.5.0 - Advanced Features
- [ ] Quiz templates marketplace
- [ ] Export/Import quiz JSON
- [ ] Quiz cloning
- [ ] Question difficulty levels
- [ ] Custom scoring rules

#### v1.0.0 - Mobile & Polish
- [ ] Mobile app (React Native)
- [ ] Multi-language support
- [ ] Accessibility improvements (WCAG 2.1)
- [ ] Performance optimizations
- [ ] Comprehensive testing suite

---

## Version History

---

**Note:** Use `./release.sh` (Linux/Mac) or `.\release.ps1` (Windows) to create new releases with automatic versioning.

