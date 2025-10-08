# 🎯 Quick Setup Instructions

## Local Development (Test Everything First!)

### Step 1: Install Dependencies

```bash
# Frontend
npm install

# Backend (Workers)
cd workers
npm install
cd ..
```

### Step 2: Start Development Servers

You need **2 terminals**:

**Terminal 1 - Cloudflare Worker (Backend):**
```bash
cd workers
npm run dev
```
Runs on `http://localhost:8787`

**Terminal 2 - Vite (Frontend):**
```bash
npm run dev
```
Runs on `http://localhost:5173`

### Step 3: Test Locally

1. Open `http://localhost:5173` in your browser
2. Open another browser/tab (or phone on same WiFi)
3. Both join with room code "QUIZLINK"
4. Test the quiz!

---

## Deploy to Production

Follow the **DEPLOYMENT_GUIDE.md** for complete step-by-step instructions!

### Quick Deploy Commands

1. **Set up Neon database** (see DEPLOYMENT_GUIDE.md Part 1)

2. **Deploy Worker:**
   ```bash
   npm run deploy:worker
   ```

3. **Deploy Frontend:**
   ```bash
   npm run deploy:pages
   ```

---

## Folder Structure

```
quizlink/
├── src/                    # Frontend React app
│   ├── components/         # React components
│   ├── App.tsx            # Main app
│   ├── config.ts          # API URLs
│   └── websocket-client.ts # WebSocket handler
├── workers/               # Cloudflare Workers backend
│   ├── src/
│   │   ├── index.ts       # Main worker
│   │   ├── game-room.ts   # Durable Object
│   │   ├── database.ts    # Neon DB functions
│   │   └── types.ts       # TypeScript types
│   └── wrangler.toml      # Worker configuration
├── db/                    # Database
│   ├── schema.sql         # Database schema
│   └── seed.sql           # Seed data
└── server/                # Old Socket.io (not used anymore)
```

---

## Key Differences from Local Version

### Old (Local Only):
- Socket.io server on port 3001
- In-memory game state
- Same WiFi required

### New (Production Ready):
- Cloudflare Workers with Durable Objects
- Neon PostgreSQL database
- Works from anywhere with internet!
- Automatic scaling
- Free hosting!

---

## Customizing Questions

Edit `workers/src/game-room.ts`, find `DEFAULT_QUESTIONS` array:

```typescript
const DEFAULT_QUESTIONS: Question[] = [
  {
    question: "Your custom question?",
    options: ["A", "B", "C", "D"],
    correctAnswer: 0,  // Index of correct answer
    displayOrder: 0
  },
  // Add more...
];
```

---

## Environment Variables

Create `.env.local` for development:
```env
VITE_API_URL=http://localhost:8787
VITE_WS_URL=ws://localhost:8787
```

Set in Cloudflare Pages for production:
```env
VITE_API_URL=https://your-worker.workers.dev
VITE_WS_URL=wss://your-worker.workers.dev
```

---

## Troubleshooting

**"Module not found" errors:**
```bash
rm -rf node_modules package-lock.json
npm install
```

**WebSocket won't connect:**
- Check if worker is running (`http://localhost:8787/health`)
- Verify URLs in `src/config.ts`
- Check browser console for errors

**Database errors:**
- Verify Neon connection string
- Run `db/schema.sql` in Neon console
- Check Hyperdrive configuration

---

Need help? Check **DEPLOYMENT_GUIDE.md** for detailed instructions!

