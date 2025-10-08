# 🎉 QuizLink - Production Ready Multiplayer Quiz App

A fun, interactive multiplayer quiz game perfect for parties, events, and gatherings! Deploy to Cloudflare and host unlimited players from anywhere in the world.

## ✨ Features

- 🎮 **Unlimited Players**: No limit! Host as many players as you want
- 🌍 **Works Anywhere**: Deploy to Cloudflare - players join from anywhere with internet
- 👑 **Admin Control Panel**: Full control over quiz flow and game state
- 📱 **Mobile Responsive**: Beautiful UI optimized for phones and tablets
- ⚡ **Real-time Updates**: WebSocket-powered instant synchronization
- 🏆 **Persistent Leaderboard**: Scores saved to Neon database
- 🎨 **Modern UI**: Smooth gradients and professional animations
- 🔒 **Secure**: Built on Cloudflare's edge network
- 💰 **Free to Host**: Uses free tiers of Cloudflare + Neon

## 🏗️ Architecture

- **Frontend**: React + TypeScript + Vite → Deployed on **Cloudflare Pages**
- **Backend**: Cloudflare Workers + Durable Objects → Real-time WebSockets
- **Database**: Neon PostgreSQL → Serverless database for persistence
- **CDN**: Cloudflare global network → Lightning-fast worldwide

## 🚀 Quick Start

### Prerequisites

- **Node.js 18+**
- **Cloudflare Account** (free tier works!)
- **Neon Account** (free tier available)
- **Wrangler CLI**: `npm install -g wrangler`

### Local Development (Test First!)

1. **Install dependencies:**
   ```bash
   # Frontend
   npm install
   
   # Backend
   cd workers
   npm install
   cd ..
   ```

2. **Start development servers (2 terminals):**
   
   **Terminal 1 - Worker:**
   ```bash
   cd workers
   npm run dev
   ```
   
   **Terminal 2 - Frontend:**
   ```bash
   npm run dev
   ```

3. **Test locally:**
   - Open `http://localhost:5173`
   - Join as admin and player
   - Test the quiz!

### Deploy to Production

**📖 See [DEPLOYMENT_GUIDE.md](DEPLOYMENT_GUIDE.md) for complete step-by-step instructions!**

Quick commands after setup:
```bash
# Deploy backend
npm run deploy:worker

# Deploy frontend
npm run deploy:pages
```

## How to Play

### For the Host (Admin):

1. Open the app and click **"Join as Admin"**
2. Enter your name
3. Share the URL with players (they should be on the same network or you can use ngrok for remote access)
4. Wait for players to join in the lobby
5. Click **"Start Quiz"** when ready
6. Control the quiz flow:
   - Wait for all players to answer
   - Click **"Reveal Answers"** to show correct answers
   - Click **"Next Question"** to proceed
   - View **"Show Results"** after the last question

### For Players:

1. Open the app on your phone
2. Click **"Join as Player"**
3. Enter your name
4. Wait in the lobby for the host to start
5. Answer questions as they appear
6. See your score and ranking at the end!

## Customization

### Adding Your Own Questions

Edit `server/server.js` and modify the `questions` array in the `gameState` object:

```javascript
questions: [
  {
    question: "Your question here?",
    options: ["Option A", "Option B", "Option C", "Option D"],
    correctAnswer: 0  // Index of correct answer (0-3)
  },
  // Add more questions...
]
```

### Changing Colors

Edit `src/App.css` to customize the color scheme. The main gradient colors are:
- Primary: `#667eea` to `#764ba2`
- Admin: `#f093fb` to `#f5576c`

## Tech Stack

- **Frontend**: React, TypeScript, Vite
- **Backend**: Node.js, Express, Socket.io
- **Real-time Communication**: Socket.io
- **Styling**: CSS3 with Flexbox/Grid

## Network Setup for Phones

### Local Network (Same WiFi)

1. Find your computer's local IP address:
   - Windows: `ipconfig` (look for IPv4 Address)
   - Mac/Linux: `ifconfig` or `ip addr`

2. Update `src/App.tsx`:
   ```typescript
   const SOCKET_URL = 'http://YOUR_LOCAL_IP:3001';
   ```

3. Players access: `http://YOUR_LOCAL_IP:5173`

### Remote Access (Different Networks)

Use [ngrok](https://ngrok.com/) to expose your local server:

```bash
# Terminal 1: Start backend
cd server && npm start

# Terminal 2: Start frontend
npm run dev

# Terminal 3: Expose backend
ngrok http 3001

# Terminal 4: Expose frontend
ngrok http 5173
```

Update the `SOCKET_URL` in `src/App.tsx` with the ngrok URL.

## Troubleshooting

**Players can't connect:**
- Ensure all devices are on the same WiFi network
- Check firewall settings
- Make sure both backend (port 3001) and frontend (port 5173) are running

**Socket connection errors:**
- Verify the `SOCKET_URL` in `src/App.tsx` matches your server address
- Check browser console for specific error messages

**Questions not appearing:**
- Check server console for errors
- Ensure at least one question exists in the `questions` array

## License

MIT License - Feel free to customize for your party!

## Enjoy Your Party! 🎊

Have fun and happy quizzing! 🎉
