# 🏛️ QuizLink Architecture

## Overview

QuizLink is built on a modern, serverless architecture leveraging Cloudflare's edge computing platform and Neon's serverless PostgreSQL database. This document provides a comprehensive technical overview.

---

## 🎯 Architecture Principles

- **Serverless** - Zero server management
- **Edge-first** - Global distribution, low latency
- **Real-time** - WebSocket for live updates
- **Type-safe** - TypeScript throughout
- **Scalable** - Auto-scaling without configuration
- **Cost-effective** - Pay only for usage

---

## 📊 System Architecture

```
┌────────────────────────────────────────────────────────────┐
│                     User Devices                           │
│        (Desktop, Mobile, Tablet - Any Browser)             │
└─────────────────────┬──────────────────────────────────────┘
                      │
                      │ HTTPS/WSS
                      ▼
┌────────────────────────────────────────────────────────────┐
│              Cloudflare Global Network                     │
│                    (200+ Cities)                           │
│                                                            │
│  ┌─────────────────────────────────────────────────────┐  │
│  │           Cloudflare Pages                          │  │
│  │  ┌──────────────────────────────────────────────┐  │  │
│  │  │  React 19 SPA                                │  │  │
│  │  │  - User Registration/Login                   │  │  │
│  │  │  - Quiz Management UI                        │  │  │
│  │  │  - Real-time Game Interface                  │  │  │
│  │  │  - Admin Dashboard                           │  │  │
│  │  │  - Profile & Analytics                       │  │  │
│  │  └──────────────────────────────────────────────┘  │  │
│  └─────────────────────────────────────────────────────┘  │
│                          │                                 │
│                          │ API Calls (REST)                │
│                          │ WebSocket Connections           │
│                          ▼                                 │
│  ┌─────────────────────────────────────────────────────┐  │
│  │         Cloudflare Workers                          │  │
│  │  ┌──────────────────────────────────────────────┐  │  │
│  │  │  Main Worker (index.ts)                      │  │  │
│  │  │  ┌────────────────────────────────────────┐  │  │  │
│  │  │  │ API Endpoints:                         │  │  │  │
│  │  │  │  - POST /api/auth/register            │  │  │  │
│  │  │  │  - POST /api/auth/login               │  │  │  │
│  │  │  │  - GET  /api/user/profile             │  │  │  │
│  │  │  │  - GET  /api/quizzes                  │  │  │  │
│  │  │  │  - POST /api/quizzes                  │  │  │  │
│  │  │  │  - GET  /api/leaderboard              │  │  │  │
│  │  │  │  - POST /api/admin/login              │  │  │  │
│  │  │  │  - GET  /ws/game/{roomCode}           │  │  │  │
│  │  │  └────────────────────────────────────────┘  │  │  │
│  │  └──────────────────────────────────────────────┘  │  │
│  │                                                     │  │
│  │  ┌──────────────────────────────────────────────┐  │  │
│  │  │  Durable Objects (game-room.ts)             │  │  │
│  │  │  ┌────────────────────────────────────────┐  │  │  │
│  │  │  │ GameRoom Instance (per room)           │  │  │  │
│  │  │  │  - WebSocket connections               │  │  │  │
│  │  │  │  - Real-time game state                │  │  │  │
│  │  │  │  - Player management                   │  │  │  │
│  │  │  │  - Question flow control               │  │  │  │
│  │  │  │  - Scoring & leaderboard               │  │  │  │
│  │  │  └────────────────────────────────────────┘  │  │  │
│  │  │  Each room = separate instance             │  │  │  │
│  │  └──────────────────────────────────────────────┘  │  │
│  └─────────────────────────────────────────────────────┘  │
│                          │                                 │
│                          │ SQL Queries (via Hyperdrive)    │
└──────────────────────────┼─────────────────────────────────┘
                           │
                           ▼
       ┌────────────────────────────────────────┐
       │      Cloudflare Hyperdrive             │
       │   (Connection Pooling & Caching)       │
       └────────────────┬───────────────────────┘
                        │
                        ▼
       ┌────────────────────────────────────────┐
       │       Neon PostgreSQL                  │
       │    (Serverless Database)               │
       │  ┌──────────────────────────────────┐  │
       │  │  Tables:                         │  │
       │  │  - users                         │  │
       │  │  - admins                        │  │
       │  │  - quiz_templates                │  │
       │  │  - questions                     │  │
       │  │  - quiz_questions                │  │
       │  │  - game_sessions                 │  │
       │  │  - player_scores                 │  │
       │  │  - categories                    │  │
       │  └──────────────────────────────────┘  │
       └────────────────────────────────────────┘
```

---

## 🔧 Component Details

### Frontend (React + TypeScript)

**Tech Stack:**

- React 19.1 with functional components
- TypeScript 5.9 for type safety
- Vite 7.1 for build/dev
- React Router 6.22 for routing
- React Icons 5.5 for UI

**Key Features:**

- Hot module reloading in development
- Code splitting for optimal loading
- Service worker for offline capability
- WebSocket client for real-time updates

**Project Structure:**

```
src/
├── components/          # Reusable UI components
│   ├── JoinScreen.tsx
│   ├── Lobby.tsx
│   ├── PlayerView.tsx
│   ├── AdminView.tsx
│   ├── ResultsView.tsx
│   └── QuestionForm.tsx
├── pages/              # Route pages
│   ├── UserRegister.tsx
│   ├── UserLogin.tsx
│   ├── UserProfile.tsx
│   ├── AdminDashboard.tsx
│   ├── QuizLibrary.tsx
│   ├── QuizEditor.tsx
│   ├── Analytics.tsx
│   ├── AdminLogin.tsx
│   └── AdminRegister.tsx
├── services/           # API clients
│   ├── api.ts         # REST API calls
│   ├── userApi.ts     # User endpoints
│   ├── adminApi.ts    # Admin endpoints
│   └── websocket.ts   # WebSocket client
├── styles/            # CSS modules
├── types.ts           # TypeScript types
├── App.tsx            # Main app component
└── GameFlow.tsx       # Game state manager
```

### Backend (Cloudflare Workers)

**Tech Stack:**

- Cloudflare Workers (V8 isolates)
- Durable Objects for stateful WebSocket
- TypeScript for type safety
- Hono framework (lightweight routing)

**Features:**

- Edge execution (sub-50ms latency)
- Auto-scaling to millions of requests
- WebSocket support via Durable Objects
- Zero cold starts

**Project Structure:**

```
workers/src/
├── index.ts           # Main worker entry
├── game-room.ts       # Durable Object class
├── auth.ts            # Admin authentication
├── user-auth.ts       # User authentication
└── types.ts           # Shared types
```

### Database (Neon PostgreSQL)

**Features:**

- Serverless PostgreSQL
- Auto-scaling compute
- Instant branching
- Connection pooling (Hyperdrive)

**Schema Overview:**

```sql
users
  - id (uuid, primary key)
  - username (unique)
  - email (unique)
  - password_hash
  - created_at

admins
  - id (uuid, primary key)
  - username (unique)
  - password_hash

quiz_templates
  - id (uuid, primary key)
  - title
  - category_id (foreign key)
  - admin_id (foreign key)
  - created_at

questions
  - id (uuid, primary key)
  - question_text
  - options (jsonb)
  - correct_answer
  - category_id

game_sessions
  - id (uuid, primary key)
  - room_code
  - quiz_id
  - host_name
  - started_at
  - completed_at

player_scores
  - id (uuid, primary key)
  - session_id (foreign key)
  - user_id (foreign key)
  - score
  - total_questions
```

---

## 🔄 Data Flow

### User Registration Flow

```
1. User submits form
   └─> POST /api/auth/register
       └─> Validate input
           └─> Check if username/email exists
               └─> Hash password (SHA-256)
                   └─> Insert into users table
                       └─> Generate JWT token
                           └─> Return token + user data

2. Frontend stores token
   └─> localStorage.setItem('token', ...)
       └─> Redirect to user profile
```

### Quiz Game Flow

```
1. User joins room
   └─> GET /ws/game/{roomCode}
       └─> Connect to Durable Object
           └─> WebSocket upgrade
               └─> Add player to game state

2. Admin starts quiz
   └─> Send "start_game" message
       └─> Durable Object broadcasts to all players
           └─> Frontend shows question

3. Player answers
   └─> Send "submit_answer" message
       └─> Durable Object validates
           └─> Update score
               └─> Broadcast result

4. Game ends
   └─> Durable Object calculates rankings
       └─> INSERT INTO game_sessions
           └─> INSERT INTO player_scores
               └─> Broadcast final results
```

### Real-time Communication

```
Player Device                 Durable Object                Database
     │                              │                           │
     ├─ ws.send(join) ────────────>│                           │
     │                              ├─ Add to players map      │
     │                              ├─ Fetch quiz from DB ────>│
     │                              │<───────────── Quiz data ──┤
     │<──── broadcast(player_list)─┤                           │
     │                              │                           │
     ├─ ws.send(answer) ──────────>│                           │
     │                              ├─ Validate answer         │
     │                              ├─ Update score            │
     │<──── broadcast(result) ─────┤                           │
     │                              │                           │
     │                         Game ends                        │
     │                              ├─ Calculate rankings      │
     │                              ├─ Save to DB ────────────>│
     │<──── broadcast(leaderboard)─┤                           │
```

---

## 🛡️ Security Architecture

### Authentication

**User Authentication:**

- JWT tokens (HS256)
- 30-day expiration
- Stored in localStorage
- Sent in Authorization header

**Admin Authentication:**

- Separate JWT tokens
- 7-day expiration
- Different secret key

### Password Security

**Current:**

- SHA-256 hashing
- No salt (TODO: upgrade)

**Planned:**

- bcrypt or argon2
- Unique salt per user

### API Security

- Input validation on all endpoints
- SQL injection prevention (parameterized queries)
- CORS configuration
- Rate limiting (Cloudflare)
- DDoS protection (Cloudflare)

---

## ⚡ Performance

### Edge Computing Benefits

**Cloudflare Workers:**

- Runs in 200+ data centers
- Sub-50ms latency worldwide
- Zero cold starts
- Auto-scaling

**Durable Objects:**

- Stateful WebSocket connections
- Single-threaded per room (simplicity)
- Automatic migration
- Global routing

### Database Optimization

**Hyperdrive:**

- Connection pooling
- Query caching
- Reduced latency to Neon

**Neon:**

- Auto-scaling compute
- Instant branching
- Point-in-time recovery

### Frontend Optimization

- Code splitting
- Lazy loading
- Asset optimization (Vite)
- CDN delivery (Cloudflare Pages)

---

## 📈 Scalability

### Horizontal Scaling

**Workers:**

- Auto-scale to millions of requests
- No configuration needed
- Pay per request

**Durable Objects:**

- One instance per room
- Automatic creation/destruction
- Global distribution

### Database Scaling

**Neon:**

- Serverless compute
- Auto-scaling
- Connection pooling

### Cost Scaling

**Free Tier:**

- 100,000 requests/day (Workers)
- Unlimited bandwidth (Pages)
- 10GB storage (Neon)

**Estimated Costs (1M requests/month):**

- Workers: ~$5
- Durable Objects: ~$10
- Neon: ~$0-20 (based on usage)
- Total: ~$15-35/month

---

## 🔌 API Reference

### User Endpoints

```typescript
POST /api/auth/register
Body: { username, email, password }
Response: { token, user }

POST /api/auth/login
Body: { username, password }
Response: { token, user }

GET /api/user/profile
Headers: { Authorization: "Bearer <token>" }
Response: { user, stats }

GET /api/user/stats
Headers: { Authorization: "Bearer <token>" }
Response: { totalGames, totalScore, ... }
```

### Admin Endpoints

```typescript
POST /api/admin/login
Body: { username, password }
Response: { token, admin }

GET /api/quizzes
Headers: { Authorization: "Bearer <admin_token>" }
Response: [{ id, title, ... }]

POST /api/quizzes
Headers: { Authorization: "Bearer <admin_token>" }
Body: { title, category_id, questions }
Response: { quiz }

GET /api/quiz/:id/analytics
Response: { topScores, avgScore, ... }
```

### WebSocket Protocol

```typescript
// Client -> Server
{
  type: "join",
  playerName: string,
  userId?: string
}

{
  type: "submit_answer",
  answer: string
}

// Server -> Client
{
  type: "game_state",
  state: "lobby" | "question" | "results" | "finished",
  players: Player[],
  currentQuestion?: Question
}

{
  type: "question",
  question: Question,
  questionNumber: number,
  totalQuestions: number
}

{
  type: "answer_result",
  correct: boolean,
  score: number
}
```

---

## 🧪 Testing Strategy

### Local Development

```bash
# Terminal 1 - Backend
cd workers
npm run dev

# Terminal 2 - Frontend
npm run dev

# Terminal 3 - Database tunnel
neon sql-cli
```

### Staging Environment

- Use Cloudflare Workers preview mode
- Separate Neon branch for testing
- Test with realistic data

### Production Testing

- Smoke tests after deployment
- Monitoring with Cloudflare Analytics
- Error tracking

---

## 📊 Monitoring

### Cloudflare Analytics

- Request count
- Error rate
- Response time
- Geographic distribution

### Neon Dashboard

- Connection count
- Query performance
- Storage usage
- Compute time

### Custom Logging

```typescript
// Worker logs
console.log('User registered:', userId);

// View logs
wrangler tail
```

---

## 🚀 Deployment Pipeline

### CI/CD Flow

```
Code Push → GitHub
    ↓
GitHub Actions Triggered
    ↓
Lint & Build
    ↓
Deploy Workers → Cloudflare
    ↓
Build Frontend → Vite
    ↓
Deploy Pages → Cloudflare
    ↓
Health Check
    ↓
✅ Live
```

### Deployment Commands

```bash
# Manual deployment
./scripts/deploy-all.ps1

# Tag-based release
./release.ps1 -Minor

# Individual deployments
npm run deploy:worker
npm run deploy:pages
```

---

## 🔮 Future Enhancements

### Planned Features

- [ ] Redis for session caching
- [ ] S3 for image uploads
- [ ] Email service (Resend/SendGrid)
- [ ] Push notifications
- [ ] Analytics dashboard
- [ ] A/B testing framework

### Architecture Evolution

- [ ] Microservices split (if needed)
- [ ] Message queue (Cloudflare Queues)
- [ ] GraphQL API layer
- [ ] Mobile app (React Native)

---

## 📚 Related Documentation

- [Deployment Guide](DEPLOYMENT_GUIDE.md)
- [User Accounts Guide](USER_ACCOUNTS_GUIDE.md)
- [Admin Setup](ADMIN_SETUP.md)
- [Auth Guide](AUTH_GUIDE.md)

---

## 🤝 Contributing to Architecture

See [CONTRIBUTING.md](../CONTRIBUTING.md) for guidelines on proposing architectural changes.

---

**Questions?** Open an issue or reach out to maintainers!
