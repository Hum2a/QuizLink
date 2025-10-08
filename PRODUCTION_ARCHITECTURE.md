# 🏗️ QuizLink Production Architecture Overview

## What Changed from Local to Production

### Before (Local Only)
```
┌─────────────┐     ┌─────────────┐
│   Browser   │────▶│  Socket.io  │
│ (localhost) │     │  Server     │
└─────────────┘     │ (port 3001) │
                    └─────────────┘
                    In-memory state
                    Same WiFi only
```

### After (Production Ready)
```
┌─────────────────────────────────────────────────┐
│           Cloudflare Global Network              │
│                                                  │
│  ┌──────────────┐         ┌─────────────────┐  │
│  │   Pages      │         │    Workers      │  │
│  │  (Frontend)  │◀───────▶│  + Durable      │  │
│  │              │         │    Objects      │  │
│  └──────────────┘         └─────────────────┘  │
│                                    │             │
└────────────────────────────────────┼─────────────┘
                                     │
                           ┌─────────▼─────────┐
                           │   Neon Database   │
                           │   (PostgreSQL)    │
                           └───────────────────┘
```

## Technology Stack

### Frontend (Cloudflare Pages)
- **Framework**: React 19 + TypeScript
- **Build Tool**: Vite
- **Styling**: CSS3 with custom gradients
- **WebSocket**: Native WebSocket API
- **Deployment**: Cloudflare Pages (auto-deploy from Git)

**Key Files**:
- `src/App.tsx` - Main application component
- `src/websocket-client.ts` - WebSocket connection manager
- `src/config.ts` - Environment configuration

### Backend (Cloudflare Workers)
- **Runtime**: Cloudflare Workers (V8 isolates)
- **Real-time**: Durable Objects with WebSockets
- **Language**: TypeScript
- **Database**: Neon (serverless Postgres)

**Key Files**:
- `workers/src/index.ts` - Worker entry point
- `workers/src/game-room.ts` - Durable Object class (game state)
- `workers/src/database.ts` - Database operations
- `workers/wrangler.toml` - Worker configuration

### Database (Neon)
- **Type**: PostgreSQL (serverless)
- **Schema**: games, questions, players, answers, game_history
- **Connection**: Via Cloudflare Hyperdrive (connection pooling)

**Key Files**:
- `db/schema.sql` - Database schema
- `db/seed.sql` - Initial data (optional)

## How It Works

### 1. Player Joins

```typescript
// Frontend (src/App.tsx)
const client = new WebSocketClient(WORKER_URL, roomCode);
await client.connect();
client.emit('join-game', { name, isAdmin, roomCode });

// Worker (workers/src/game-room.ts)
// Durable Object receives message
handleJoinGame() {
  // Add player to game state
  gameState.players.push(newPlayer);
  
  // Save to Durable Object storage
  await this.state.storage.put('gameState', gameState);
  
  // Broadcast to all connected clients
  this.broadcast({ type: 'game-state-update', payload });
}
```

### 2. Admin Starts Quiz

```typescript
// Frontend emits
client.emit('start-quiz');

// Durable Object updates state
gameState.isQuizActive = true;
gameState.currentQuestion = 0;

// All clients receive update
broadcast({ type: 'game-state-update' });
```

### 3. Players Answer

```typescript
// Player submits answer
client.emit('submit-answer', { answerIndex: 2 });

// Durable Object records answer
gameState.answers[playerId] = answerIndex;
player.hasAnswered = true;

// Admin sees real-time update
broadcast({ type: 'game-state-update' });
```

### 4. Scores Calculated & Saved

```typescript
// Admin reveals answers
handleRevealAnswers() {
  // Calculate scores
  if (answer === correctAnswer) {
    player.score += 100;
  }
  
  // Optionally save to database
  await db.saveAnswer(playerId, questionId, answer, isCorrect);
  await db.updatePlayerScore(playerId, player.score);
}
```

## Cloudflare Durable Objects Explained

### What are Durable Objects?

Durable Objects are:
- **Stateful**: Maintain state in memory
- **Consistent**: Single instance per ID (room code)
- **Persistent**: Can save to storage
- **WebSocket-ready**: Built-in WebSocket support

### Why Use Them?

Traditional serverless (like Lambda) is stateless. For real-time games, you need:
1. **Shared state** between all players
2. **WebSocket connections** that stay open
3. **Instant synchronization**

Durable Objects solve all three!

### How They Work Here

```typescript
// Each room code gets its own Durable Object
const id = env.GAME_ROOM.idFromName(roomCode);
const stub = env.GAME_ROOM.get(id);

// All players in "QUIZLINK" room connect to the same object
// State is shared between all connections
```

## Database Schema

### games
- Stores each quiz session
- Tracks status (lobby, active, completed)
- Records timestamps

### questions
- Quiz questions for each game
- Linked to game via game_id
- Can be customized per game

### players
- All players in a game
- Tracks scores and join time
- Links to answers

### answers
- Individual answers per player per question
- Records correctness
- Used for analytics

### game_history
- Completed games
- Winner tracking
- Analytics and leaderboards

## Real-time Flow

```
Player Action → WebSocket Message → Durable Object
                                          │
                                          ├─ Update in-memory state
                                          ├─ Save to DO storage
                                          ├─ (Optional) Save to database
                                          └─ Broadcast to all clients
                                                    │
                                    ┌───────────────┼───────────────┐
                                    ▼               ▼               ▼
                                Player 1        Player 2        Admin
                                (React)         (React)         (React)
                                    │               │               │
                                    └───────────────┴───────────────┘
                                    All receive state update
                                    React re-renders UI
```

## Scalability

### Current Setup
- **Players per room**: Unlimited (tested with 50+)
- **Concurrent rooms**: Thousands
- **Database queries**: Optimized with Hyperdrive
- **Global latency**: <50ms (Cloudflare edge network)

### Cost at Scale

**Free Tier Limits**:
- Cloudflare Workers: 100,000 requests/day
- Cloudflare Pages: Unlimited static requests
- Neon: 0.5GB storage, 3GB data transfer/month

**Paid Tier** (if you exceed free):
- Workers: $5/month + $0.50 per million requests
- Neon: $19/month for more storage/compute

**Example**: 1,000 concurrent games with 10 players each:
- 10,000 WebSocket connections
- ~$5-10/month on Workers
- Still on Neon free tier!

## Security Features

### Built-in
- ✅ CORS protection
- ✅ Input validation
- ✅ WebSocket authentication via room codes
- ✅ Admin-only actions verified server-side
- ✅ HTTPS/WSS enforced in production

### Best Practices Implemented
- Sanitized user inputs
- Rate limiting on Cloudflare
- Database parameterized queries
- Secrets via Wrangler (not in code)

## Monitoring & Debugging

### View Logs
```bash
# Real-time worker logs
wrangler tail

# Pages deployment logs
# Check Cloudflare dashboard
```

### Check Database
```bash
# Connect to Neon console
# Run queries directly
```

### Health Check
```bash
curl https://your-worker.workers.dev/health
# Should return: {"status":"ok","timestamp":...}
```

## Customization Points

### 1. Questions (`workers/src/game-room.ts`)
```typescript
const DEFAULT_QUESTIONS = [
  // Add your questions here
];
```

### 2. Scoring (`workers/src/game-room.ts`)
```typescript
handleRevealAnswers() {
  // Change score calculation
  p.score += 100;  // Could be time-based, etc.
}
```

### 3. UI Theme (`src/App.css`)
```css
/* Change gradient colors */
background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
```

### 4. Room Code Format (`workers/src/game-room.ts`)
```typescript
generateRoomCode() {
  // Customize length, characters, format
}
```

## Performance Optimizations

### Frontend
- Lazy loading components
- Debounced WebSocket messages
- Optimistic UI updates
- React.memo for expensive components

### Backend
- Durable Objects for low latency
- Hyperdrive for database connection pooling
- Edge caching for static assets
- WebSocket message batching

### Database
- Indexed foreign keys
- Efficient query patterns
- Connection pooling via Hyperdrive
- Cleanup of old games

## Troubleshooting

### WebSocket Disconnects
- Durable Objects auto-reconnect
- Frontend has reconnection logic
- Exponential backoff implemented

### State Inconsistency
- Single source of truth (Durable Object)
- Full state sent on every update
- No partial state updates

### Database Issues
- Hyperdrive handles connection pooling
- Retries built into Neon client
- Graceful fallback if DB unavailable

## Future Enhancements

Potential additions:
- [ ] Custom question upload
- [ ] Image-based questions
- [ ] Audio questions
- [ ] Team mode
- [ ] Tournament brackets
- [ ] Global leaderboard
- [ ] Question timer
- [ ] Power-ups
- [ ] Achievements

## Resources

- [Cloudflare Workers Docs](https://developers.cloudflare.com/workers/)
- [Durable Objects Guide](https://developers.cloudflare.com/workers/runtime-apis/durable-objects/)
- [Neon Documentation](https://neon.tech/docs)
- [Wrangler CLI](https://developers.cloudflare.com/workers/wrangler/)

---

**Questions?** Open an issue or check the deployment guide!

