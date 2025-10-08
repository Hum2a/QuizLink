# 🔐 Environment Variables Setup Guide

This guide explains how to set up all environment variables for both local development and production deployment.

## 📁 Environment Files Overview

```
quizlink/
├── env.local.template           # Template for local dev
├── env.production.template      # Template for production
├── .env.local                   # ← Create this (gitignored)
├── .env.production             # ← Create this (gitignored)
└── workers/
    └── wrangler.toml           # Worker configuration
```

---

## 🛠️ Local Development Setup

### Step 1: Create `.env.local`

Copy the template:
```bash
# Windows (PowerShell)
Copy-Item env.local.template .env.local

# Mac/Linux
cp env.local.template .env.local
```

### Step 2: Verify `.env.local` Contents

Your `.env.local` should look like:
```env
VITE_API_URL=http://localhost:8787
VITE_WS_URL=ws://localhost:8787
VITE_DEBUG=true
```

**No changes needed!** These are the correct settings for local development.

### Step 3: Test It

```bash
# Terminal 1 - Start worker
cd workers
npm run dev

# Terminal 2 - Start frontend (reads .env.local automatically)
npm run dev
```

Open `http://localhost:5173` - it should connect to the local worker!

---

## 🚀 Production Setup

### Step 1: Deploy Your Worker First

```bash
cd workers
npm install
npm run deploy
```

You'll get output like:
```
Published quizlink-api (0.01 sec)
  https://quizlink-api.your-name.workers.dev
```

**Copy this URL!** You'll need it in the next step.

### Step 2: Create `.env.production`

```bash
# Windows (PowerShell)
Copy-Item env.production.template .env.production

# Mac/Linux
cp env.production.template .env.production
```

### Step 3: Update `.env.production` with Your Worker URL

Open `.env.production` and replace the URLs:

```env
# Replace 'your-subdomain' with your actual worker URL
VITE_API_URL=https://quizlink-api.john-doe.workers.dev
VITE_WS_URL=wss://quizlink-api.john-doe.workers.dev

VITE_DEBUG=false
```

**Important:** 
- API URL uses `https://`
- WebSocket URL uses `wss://` (WebSocket Secure)
- Both should be the same domain, just different protocols

### Step 4: Build and Deploy Frontend

```bash
# Build with production env
npm run build

# Deploy to Cloudflare Pages
npm run deploy:pages
```

Or set these as environment variables in Cloudflare Pages dashboard (recommended for Git integration).

---

## ⚙️ Worker Configuration (wrangler.toml)

### Step 1: Set Up Neon Database

1. Create a Neon account at [neon.tech](https://neon.tech)
2. Create a new project
3. Copy your connection string (looks like):
   ```
   postgresql://user:password@ep-xxx.region.aws.neon.tech/dbname?sslmode=require
   ```

### Step 2: Run Database Schema

Use Neon's SQL Editor to run `db/schema.sql`:

1. Go to your Neon project
2. Click "SQL Editor"
3. Paste contents of `db/schema.sql`
4. Click "Run"

### Step 3: Create Hyperdrive Connection

```bash
cd workers

# Create Hyperdrive (connection pooling for Neon)
wrangler hyperdrive create quizlink-hyperdrive \
  --connection-string="postgresql://user:password@host/dbname?sslmode=require"
```

Output will show:
```
Created new Hyperdrive config
 ID: abc123def456ghi789
 Name: quizlink-hyperdrive
```

**Copy the ID!**

### Step 4: Update wrangler.toml

Open `workers/wrangler.toml` and replace:
```toml
[[hyperdrive]]
binding = "HYPERDRIVE"
id = "abc123def456ghi789"  # ← Your Hyperdrive ID here
```

### Step 5: Set Database Secret

```bash
cd workers

# Set secret (this is NOT in wrangler.toml for security)
wrangler secret put DATABASE_URL
```

When prompted, paste your Neon connection string:
```
postgresql://user:password@ep-xxx.region.aws.neon.tech/dbname?sslmode=require
```

Press Enter to save.

---

## 🔍 Verify Your Setup

### Check Local Development

```bash
# Terminal 1
cd workers && npm run dev

# Terminal 2
npm run dev

# Should connect successfully!
```

### Check Production

```bash
# Test worker health endpoint
curl https://quizlink-api.YOUR-NAME.workers.dev/health

# Should return:
# {"status":"ok","timestamp":1234567890}
```

### Check Frontend Production Build

```bash
npm run build

# Check if build includes correct URLs
cat dist/assets/index-*.js | grep "VITE_API_URL"
```

---

## 📋 Environment Variables Reference

### Frontend Variables (Vite)

| Variable | Local | Production | Description |
|----------|-------|------------|-------------|
| `VITE_API_URL` | `http://localhost:8787` | `https://your-worker.workers.dev` | Backend API endpoint |
| `VITE_WS_URL` | `ws://localhost:8787` | `wss://your-worker.workers.dev` | WebSocket endpoint |
| `VITE_DEBUG` | `true` | `false` | Enable debug logging |

### Worker Variables (Wrangler)

| Variable | Type | How to Set | Description |
|----------|------|------------|-------------|
| `ENVIRONMENT` | Public | `wrangler.toml` | Environment name |
| `DATABASE_URL` | Secret | `wrangler secret put` | Neon connection string |
| `HYPERDRIVE` | Binding | `wrangler.toml` | Hyperdrive ID |

---

## 🔒 Security Notes

### What's Safe to Commit

✅ **Safe**:
- `env.local.template`
- `env.production.template`
- `wrangler.toml` (after removing real Hyperdrive ID)

❌ **Never Commit**:
- `.env.local`
- `.env.production`
- `.env`
- Any file with actual credentials

### .gitignore Already Covers

```gitignore
.env
.env.local
.env.production
*.local
```

### Secrets Management

- **Frontend**: Uses `.env.production` (becomes part of build)
- **Worker**: Uses `wrangler secret` (stored securely in Cloudflare)
- **Database URL**: Should NEVER be in frontend code

---

## 🐛 Troubleshooting

### "Failed to connect to game room"

Check your `.env.local` or `.env.production`:
```bash
# Print current env (development)
npm run dev -- --debug

# Check built files
cat dist/assets/index-*.js | grep "localhost:8787"
```

### Worker Can't Connect to Database

```bash
# Check if DATABASE_URL secret is set
cd workers
wrangler secret list

# Re-set if missing
wrangler secret put DATABASE_URL
```

### Hyperdrive Not Working

```bash
# List your Hyperdrives
wrangler hyperdrive list

# Update wrangler.toml with correct ID
```

### Wrong URLs in Production Build

```bash
# Make sure .env.production exists and is correct
cat .env.production

# Rebuild
rm -rf dist
npm run build
```

---

## 📝 Quick Checklist

### Local Development
- [ ] Created `.env.local` from template
- [ ] Running `npm run dev` in both terminals
- [ ] App connects successfully

### Production
- [ ] Neon database created
- [ ] Ran `db/schema.sql` in Neon
- [ ] Created Hyperdrive connection
- [ ] Updated `wrangler.toml` with Hyperdrive ID
- [ ] Set `DATABASE_URL` secret
- [ ] Deployed worker (`npm run deploy:worker`)
- [ ] Created `.env.production` with worker URL
- [ ] Built frontend (`npm run build`)
- [ ] Deployed to Cloudflare Pages

---

## 🎯 Next Steps

1. Test locally first (always!)
2. Deploy worker
3. Set up production env
4. Deploy frontend
5. Test from different devices

**Need help?** Check `DEPLOYMENT_GUIDE.md` for more details!

