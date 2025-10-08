# Changelog

All notable changes to QuizLink will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
- Complete user account system with registration and login
- JWT-based authentication for users and admins
- User profile dashboard with stats and game history
- React Icons integration for professional UI
- User stats tracking (total games, scores, rankings)
- Personal game history for each user
- Avatar colors for user profiles
- Quiz templates with categories
- Question bank for reusable questions
- Admin dashboard for quiz management
- Quiz editor with visual interface
- Question editor with drag-and-drop reordering
- Analytics dashboard per quiz
- Global leaderboards
- Real-time multiplayer with WebSockets
- Cloudflare deployment (Workers + Pages)
- Neon PostgreSQL database integration
- Durable Objects for real-time game state

### Changed
- Replaced all emojis with React Icons for professional look
- Updated user flow to require registration first
- Enhanced admin dashboard with better UX
- Improved mobile responsiveness

### Security
- SHA-256 password hashing
- JWT token authentication (30-day expiration for users, 7-day for admins)
- Protected admin routes
- Secure API endpoints with token verification

## Future Releases

### Planned Features
- [ ] Quiz selector in game (choose quiz before playing)
- [ ] Image upload for questions
- [ ] Timer mode for questions
- [ ] Team mode
- [ ] Global leaderboard across all quizzes
- [ ] Achievement system
- [ ] Friend system
- [ ] OAuth integration (Google, GitHub)
- [ ] Email verification
- [ ] Password reset via email
- [ ] Quiz templates marketplace
- [ ] Export/Import quiz JSON
- [ ] Multi-language support

---

## Version History

<!-- Versions will be added here by release script -->

---

**Note:** Use `./release.sh` (Linux/Mac) or `.\release.ps1` (Windows) to create new releases with automatic versioning.

