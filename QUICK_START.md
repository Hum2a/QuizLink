# 🚀 QuizLink - Quick Start Guide

## First Time Setup (Do this once)

1. **Install dependencies:**

   Open PowerShell in this folder and run:
   ```powershell
   # Install frontend dependencies
   npm install

   # Install backend dependencies
   cd server
   npm install
   cd ..
   ```

## Running the Quiz

You need **TWO terminals** running at the same time:

### Option 1: Using Scripts (Windows)

1. Double-click `start-server.bat` (keep this window open)
2. Double-click `start-client.bat` (keep this window open)

### Option 2: Manual (Any OS)

**Terminal 1 - Start Backend Server:**
```bash
cd server
npm start
```
Keep this running! You should see: `Server running on port 3001`

**Terminal 2 - Start Frontend:**
```bash
npm run dev
```
Keep this running! You should see the local URL (usually `http://localhost:5173`)

## How to Use

1. **Admin (You):** 
   - Open `http://localhost:5173` on your computer
   - Click "Join as Admin"
   - Enter your name

2. **Players (Friends):**
   - Make sure they're on the same WiFi
   - Find your computer's IP address:
     - Open PowerShell and type: `ipconfig`
     - Look for "IPv4 Address" (e.g., 192.168.1.5)
   - Friends open: `http://YOUR_IP:5173` on their phones
   - They click "Join as Player"

3. **Start Playing:**
   - Wait for everyone to join in the lobby
   - Click "Start Quiz" as admin
   - Control the quiz flow from your admin panel!

## Troubleshooting

**"Can't connect" error:**
- Make sure both terminals are running
- Check if your firewall is blocking ports 3001 and 5173
- Ensure all devices are on the same WiFi network

**Players can't join from phones:**
- Double-check the IP address
- Try `http://YOUR_IP:5173` in their phone browser
- Make sure WiFi is connected (not mobile data)

**Questions not showing:**
- Refresh the page
- Check the server terminal for errors

## Customizing Questions

Edit `server/server.js` - find the `questions` array around line 16 and add your own questions!

## Need Help?

Check the main `README.md` for detailed documentation.

---

**Have fun at your party! 🎉🎊**

