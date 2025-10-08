# 🚀 Deployment Guide - QuizLink to Production

This guide will walk you through deploying your QuizLink app to Cloudflare with Neon database.

## Prerequisites

- **Cloudflare Account** (free tier works!)
- **Neon Account** (serverless Postgres, free tier available)
- **Node.js 18+** installed locally
- **Wrangler CLI** (`npm install -g wrangler`)

---

## Part 1: Set Up Neon Database

### 1. Create a Neon Account

1. Go to [https://neon.tech](https://neon.tech)
2. Sign up for a free account
3. Click "Create a project"

### 2. Create Your Database

1. **Project Name**: `quizlink-db`
2. **Region**: Choose closest to your users
3. Click "Create Project"

### 3. Get Your Database Connection String

1. In your Neon dashboard, click "Connection Details"
2. Copy the **connection string** (looks like):
   ```
   postgresql://user:password@ep-xxx.region.aws.neon.tech/dbname?sslmode=require
   ```
3. Save this - you'll need it!

### 4. Run Database Migrations

1. Install Neon CLI:
   ```bash
   npm install -g @neondatabase/serverless
   ```

2. Set your connection string:
   ```bash
   export DATABASE_URL="your-connection-string-here"
   ```

3. Run the schema migration:
   ```bash
   # On Windows PowerShell:
   $env:DATABASE_URL="your-connection-string-here"
   
   # Then run:
   psql $DATABASE_URL -f db/schema.sql
   ```

   Or use a database client like **TablePlus** or **pgAdmin** to run `db/schema.sql`.

---

## Part 2: Deploy Cloudflare Workers (Backend)

### 1. Install Wrangler

```bash
npm install -g wrangler
```

### 2. Login to Cloudflare

```bash
wrangler login
```

This will open your browser to authenticate.

### 3. Set Up Hyperdrive (for Database Connection Pooling)

Hyperdrive makes Neon connections faster on Cloudflare Workers.

```bash
# Navigate to workers directory
cd workers

# Create Hyperdrive connection
# Mac/Linux:
wrangler hyperdrive create quizlink-hyperdrive \
  --connection-string="your-neon-connection-string"

# Windows PowerShell (single line):
wrangler hyperdrive create quizlink-hyperdrive --connection-string="your-neon-connection-string"
```

**Note:** Use only `sslmode=require` in the connection string (remove `&channel_binding=require` if present).

Copy the **Hyperdrive ID** from the output.

### 4. Configure Workers

1. Open `workers/wrangler.toml`
2. Replace `YOUR_HYPERDRIVE_ID` with the ID you just got:
   ```toml
   [[hyperdrive]]
   binding = "HYPERDRIVE"
   id = "abc123xyz"  # Your Hyperdrive ID here
   ```

### 5. Set Secrets

```bash
cd workers

# Set database URL as secret
wrangler secret put DATABASE_URL
# Paste your Neon connection string when prompted
```

### 6. Deploy Workers

```bash
cd workers
npm install
npm run deploy
```

You'll get a URL like:
```
https://quizlink-api.your-subdomain.workers.dev
```

**Save this URL!** You'll need it for the frontend.

---

## Part 3: Deploy Frontend to Cloudflare Pages

### 1. Build Frontend Locally (Test)

```bash
# In project root
npm install
npm run build
```

Make sure it builds successfully!

### 2. Update Frontend Configuration

1. Create `.env.production`:
   ```env
   VITE_API_URL=https://quizlink-api.your-subdomain.workers.dev
   VITE_WS_URL=wss://quizlink-api.your-subdomain.workers.dev
   ```

2. Replace with your actual Worker URL from Step 2.6

### 3. Deploy to Cloudflare Pages

#### Option A: Using Wrangler

```bash
npm run build
npx wrangler pages deploy dist --project-name=quizlink
```

#### Option B: Using Cloudflare Dashboard (Recommended for Git Integration)

1. Go to [https://dash.cloudflare.com](https://dash.cloudflare.com)
2. Click "Pages" in the sidebar
3. Click "Create a project"
4. Connect your Git repository (GitHub/GitLab)
5. Configure build settings:
   - **Build command**: `npm run build`
   - **Build output directory**: `dist`
   - **Environment variables**:
     - `VITE_API_URL`: Your Worker URL (https)
     - `VITE_WS_URL`: Your Worker URL (wss)

6. Click "Save and Deploy"

### 4. Get Your Live URL

After deployment, you'll get a URL like:
```
https://quizlink.pages.dev
```

🎉 **Your app is now live!**

---

## Part 4: Testing Your Deployment

### 1. Test the Backend

```bash
curl https://quizlink-api.your-subdomain.workers.dev/health
```

Should return: `{"status":"ok","timestamp":...}`

### 2. Open Your App

Visit your Cloudflare Pages URL:
```
https://quizlink.pages.dev
```

### 3. Test Multiplayer

1. Open on your computer as admin
2. Open on your phone as player
3. Join the same room code
4. Start the quiz!

---

## Part 5: Custom Domain (Optional)

### Add Your Own Domain

1. In Cloudflare Pages dashboard, click your project
2. Go to "Custom domains"
3. Click "Set up a custom domain"
4. Enter your domain (e.g., `quiz.yourdomain.com`)
5. Follow the instructions to update DNS

---

## Environment Variables Reference

### Frontend (.env.production)

```env
VITE_API_URL=https://quizlink-api.your-subdomain.workers.dev
VITE_WS_URL=wss://quizlink-api.your-subdomain.workers.dev
```

### Workers Secrets

```bash
# Set via Wrangler
wrangler secret put DATABASE_URL
# Enter: postgresql://user:pass@host/db?sslmode=require
```

---

## Updating Your App

### Update Frontend

If using Git integration:
1. Push to your repository
2. Cloudflare Pages auto-deploys

Manual:
```bash
npm run build
npx wrangler pages deploy dist --project-name=quizlink
```

### Update Backend

```bash
cd workers
npm run deploy
```

### Update Database Schema

```bash
psql $DATABASE_URL -f db/new-migration.sql
```

---

## Monitoring & Logs

### View Worker Logs

```bash
cd workers
wrangler tail
```

### View Pages Logs

1. Go to Cloudflare dashboard
2. Click your Pages project
3. Click "View build log" or "Functions"

---

## Troubleshooting

### WebSocket Connection Fails

1. Check your `VITE_WS_URL` uses `wss://` (not `ws://`)
2. Verify Worker is deployed: `curl https://your-worker.workers.dev/health`
3. Check browser console for CORS errors

### Database Connection Issues

1. Verify Hyperdrive is configured correctly
2. Check `DATABASE_URL` secret: `wrangler secret list`
3. Test connection from Neon dashboard

### Build Fails

1. Delete `node_modules` and `package-lock.json`
2. Run `npm install` again
3. Try `npm run build` locally first

### Players Can't Connect

1. Make sure they're using the correct room code
2. Check if Worker is deployed and responding
3. Look for errors in browser developer console (F12)

---

## Cost Estimates

With Cloudflare and Neon free tiers:

- **Cloudflare Workers**: 100,000 requests/day (FREE)
- **Cloudflare Pages**: Unlimited static requests (FREE)
- **Neon Database**: 0.5GB storage, 3GB transfer/month (FREE)

**Perfect for personal use and small parties!** 🎉

For higher traffic, upgrade to paid tiers (very affordable).

---

## Security Best Practices

1. **Rate Limiting**: Consider adding rate limits in Workers
2. **Room Expiry**: Clean up old games regularly
3. **Input Validation**: Already implemented in the code
4. **HTTPS Only**: Always use `https://` and `wss://` in production

---

## Next Steps

- Customize questions in `workers/src/game-room.ts`
- Add analytics tracking
- Implement persistent leaderboards
- Add email notifications for winners

---

**Questions?** Check the main `README.md` or open an issue on GitHub!

🎉 Happy Quizzing! 🎊

