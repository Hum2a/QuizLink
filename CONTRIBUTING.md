# Contributing to QuizLink

First off, thank you for considering contributing to QuizLink! 🎉

## 📋 Table of Contents

- [Code of Conduct](#code-of-conduct)
- [How Can I Contribute?](#how-can-i-contribute)
- [Development Setup](#development-setup)
- [Pull Request Process](#pull-request-process)
- [Coding Standards](#coding-standards)
- [Commit Messages](#commit-messages)

---

## 📜 Code of Conduct

This project and everyone participating in it is governed by our [Code of Conduct](CODE_OF_CONDUCT.md). By participating, you are expected to uphold this code.

---

## 🤔 How Can I Contribute?

### Reporting Bugs

Before creating bug reports, please check existing issues. When creating a bug report, include:

- **Clear title** - Descriptive and specific
- **Steps to reproduce** - Detailed steps
- **Expected behavior** - What should happen
- **Actual behavior** - What actually happens
- **Screenshots** - If applicable
- **Environment** - OS, browser, device

Use our [bug report template](.github/ISSUE_TEMPLATE/bug_report.md).

### Suggesting Features

Feature requests are welcome! Include:

- **Clear description** - What you want to see
- **Use case** - Why it's useful
- **Examples** - Similar features elsewhere
- **Mockups** - UI designs if applicable

Use our [feature request template](.github/ISSUE_TEMPLATE/feature_request.md).

### Code Contributions

1. **Fork** the repository
2. **Create** a feature branch
3. **Make** your changes
4. **Test** thoroughly
5. **Submit** a pull request

---

## 💻 Development Setup

### Prerequisites

- Node.js 18+
- Git
- Cloudflare account
- Neon database account

### Local Setup

```bash
# Clone your fork
git clone https://github.com/YOUR-USERNAME/quizlink.git
cd quizlink

# Install dependencies
npm install
cd workers && npm install && cd ..

# Set up environment
npm run setup:env

# Start development
npm run dev          # Terminal 1
npm run dev:worker   # Terminal 2
```

### Database Setup

See [docs/DEPLOYMENT_GUIDE.md](docs/DEPLOYMENT_GUIDE.md) for database configuration.

---

## 🔄 Pull Request Process

### Before Submitting

1. **Update documentation** if needed
2. **Run linter**: `npm run lint`
3. **Test build**: `npm run build`
4. **Check types**: `cd workers && npx tsc --noEmit`
5. **Test locally** on multiple devices
6. **Update CHANGELOG.md** with your changes

### PR Guidelines

- **One feature per PR** - Keep PRs focused
- **Clear title** - Describe what it does
- **Description** - Explain why and how
- **Reference issues** - Link related issues
- **Screenshots** - For UI changes
- **Tests** - Add if applicable

### PR Template

Use our [PR template](.github/PULL_REQUEST_TEMPLATE.md) - it's auto-populated!

### Review Process

1. **Automated checks** run (linting, build)
2. **Maintainer reviews** code
3. **Changes requested** if needed
4. **Approval** and merge
5. **Auto-deployment** to production (if on main)

---

## 📏 Coding Standards

### TypeScript

- **Use TypeScript** for all new code
- **Define interfaces** for data structures
- **Avoid `any`** - Use proper types
- **Export types** from separate files

```typescript
// ✅ Good
interface User {
  id: string;
  name: string;
}

// ❌ Bad
const user: any = {...};
```

### React

- **Functional components** with hooks
- **TypeScript** for props
- **Descriptive names** for components
- **Small, focused** components

```typescript
// ✅ Good
interface ButtonProps {
  onClick: () => void;
  label: string;
}

function Button({ onClick, label }: ButtonProps) {
  return <button onClick={onClick}>{label}</button>;
}
```

### CSS

- **Use existing styles** where possible
- **Follow naming** conventions
- **Mobile-first** approach
- **Gradients** for brand consistency

### Backend

- **Async/await** for promises
- **Error handling** in try-catch
- **Input validation** on all endpoints
- **Type safety** throughout

---

## 📝 Commit Messages

### Format

```
<type>(<scope>): <subject>

<body>

<footer>
```

### Types

- `feat` - New feature
- `fix` - Bug fix
- `docs` - Documentation
- `style` - Formatting (no code change)
- `refactor` - Code restructuring
- `perf` - Performance improvement
- `test` - Tests
- `chore` - Build/config changes

### Examples

```bash
# Feature
git commit -m "feat(quiz): add quiz selector to join screen"

# Bug fix
git commit -m "fix(auth): resolve token expiration issue"

# Documentation
git commit -m "docs: update deployment guide with Neon setup"

# With body
git commit -m "feat(profile): add user achievements

- Add achievement tracking system
- Create badge display component
- Update database schema

Closes #123"
```

---

## 🧪 Testing Guidelines

### Manual Testing

Before submitting:

1. **Desktop testing** - Chrome, Firefox, Safari
2. **Mobile testing** - iOS, Android
3. **User flows** - Complete workflows
4. **Edge cases** - Error scenarios

### What to Test

- ✅ User registration and login
- ✅ Quiz gameplay (as player and host)
- ✅ Admin dashboard operations
- ✅ Mobile responsiveness
- ✅ WebSocket connections
- ✅ Error handling

---

## 🎨 Design Guidelines

### Colors

Primary gradient:

```css
background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
```

### Icons

Use React Icons:

```typescript
import { FaGamepad, FaTrophy } from "react-icons/fa";
```

### Typography

- **Headings**: System fonts
- **Body**: 1rem, line-height 1.5
- **Mobile**: Responsive font sizes

---

## 🔍 Code Review Checklist

### For Reviewers

- [ ] Code follows style guide
- [ ] Changes are documented
- [ ] No console.log() left in code
- [ ] Error handling present
- [ ] TypeScript types defined
- [ ] Mobile responsive
- [ ] No security issues
- [ ] Performance considered

### For Contributors

Before requesting review:

- [ ] Self-reviewed code
- [ ] Tested on multiple devices
- [ ] Linter passes
- [ ] Build succeeds
- [ ] Documentation updated
- [ ] Screenshots added (if UI)

---

## 🌳 Branching Strategy

### Branch Names

```
feature/quiz-selector
bugfix/login-timeout
hotfix/critical-auth-bug
docs/api-documentation
```

### Workflow

```
main (production)
  ├── develop (integration)
  │   ├── feature/new-feature
  │   ├── bugfix/some-bug
  │   └── feature/another-feature
  └── hotfix/critical-fix
```

---

## 🚀 Release Process

### For Maintainers

```bash
# 1. Run pre-release checks
./scripts/pre-release.ps1

# 2. Create release tag
./release.ps1 -Minor

# 3. Deploy to production
./scripts/deploy-all.ps1

# 4. Update CHANGELOG.md
```

See [docs/RELEASE_GUIDE.md](docs/RELEASE_GUIDE.md) for full details.

---

## 💡 Feature Development Workflow

### Example: Adding Timer Mode

1. **Create issue** - Describe feature
2. **Fork & branch** - `feature/timer-mode`
3. **Implement**:
   - Update backend (game-room.ts)
   - Update frontend (PlayerView.tsx)
   - Add UI controls
   - Update types
4. **Test** thoroughly
5. **Document** in docs
6. **Submit PR** with screenshots
7. **Address** review feedback
8. **Merge** and celebrate! 🎉

---

## 📞 Getting Help

Stuck? We're here to help!

- 💬 **Discussions**: Ask questions
- 📖 **Docs**: Check documentation
- 🐛 **Issues**: Search existing issues
- 📧 **Email**: Contact maintainers

---

## 🎁 Good First Issues

New to the project? Look for issues labeled:

- `good first issue` - Easy wins
- `help wanted` - Need contributors
- `documentation` - Docs improvements

---

## 🏅 Recognition

Contributors are recognized in:

- **README** - Contributors section
- **Releases** - Mentioned in notes
- **CHANGELOG** - Credit given

---

## 📜 License

By contributing, you agree that your contributions will be licensed under the MIT License.

---

## 🙌 Thank You!

Every contribution helps make QuizLink better for everyone!

**Happy coding!** 🚀
