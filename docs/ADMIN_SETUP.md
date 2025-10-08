# 🎯 Admin Features Setup Guide

## What's New

Your QuizLink app now has a full admin dashboard where you can:
- ✅ Create and manage multiple quizzes
- ✅ Add, edit, and delete questions
- ✅ View quiz analytics and statistics
- ✅ Organize quizzes by category
- ✅ Drag to reorder questions
- ✅ See top scores and leaderboards

## 🗄️ Step 1: Update Database (Required!)

### Option A: Using Neon SQL Editor (Easiest)

1. **Go to Neon Console:**
   - [https://console.neon.tech](https://console.neon.tech)
   - Select your `QuizLink` project

2. **Open SQL Editor:**
   - Click "SQL Editor" in the sidebar

3. **Run Updated Schema:**
   - Copy the entire contents of `db/schema.sql`
   - Paste into the SQL editor
   - Click "Run" or press Ctrl+Enter

4. **Add Sample Data (Optional but recommended):**
   - Copy the entire contents of `db/seed-admin.sql`
   - Paste into the SQL editor
   - Click "Run"

This will create:
- 2 sample quiz templates (Birthday Trivia & General Knowledge)
- 10 sample questions
- Admin user structure

### Option B: Using psql

```bash
# Set your Neon connection string
$env:DATABASE_URL="postgresql://neondb_owner:npg_T3Fcr5HBNwSW@ep-solitary-silence-a9t7vo4y-pooler.gwc.azure.neon.tech/neondb?sslmode=require"

# Run migrations
psql $env:DATABASE_URL -f db/schema.sql
psql $env:DATABASE_URL -f db/seed-admin.sql
```

## 🚀 Step 2: Deploy Updated Backend

```powershell
cd workers
npm install
npm run deploy
```

Wait for: ✅ Deployed `quizlink-api`

## 🎨 Step 3: Deploy Frontend

```powershell
cd ..
npm install
npm run deploy:pages
```

Wait for: ✅ Deployment complete!

## 🧪 Step 4: Test the Admin Dashboard

1. **Open your app:**
   - [https://quizlink.pages.dev](https://quizlink.pages.dev)

2. **Click "⚙️ Admin Dashboard"** in top right

3. **Login:**
   - Password: `admin123`

4. **Explore:**
   - 📚 Quiz Library - See your 2 sample quizzes
   - ➕ Create Quiz - Make a new quiz
   - 📊 Analytics - View stats

## 📱 How to Use

### Creating a New Quiz:

1. Click **"📚 Quiz Library"**
2. Click **"➕ Create New Quiz"**
3. Fill in:
   - Title (e.g., "My Birthday Quiz")
   - Description
   - Category (e.g., "Party Games")
   - Difficulty (Easy/Medium/Hard)
4. Click **"💾 Save Quiz"**
5. Now add questions!

### Adding Questions:

1. In quiz editor, click **"➕ Add Question"**
2. Enter your question
3. Fill in 4 answer options (A, B, C, D)
4. Check the ✓ next to the correct answer
5. Add explanation (optional)
6. Click **"💾 Save Question"**
7. Repeat for all questions!

### Editing/Deleting:

- **Edit:** Click ✏️ Edit button on quiz card or question
- **Delete:** Click 🗑️ Delete button (will ask for confirmation)
- **Reorder:** Use ⬆️ ⬇️ buttons to move questions

### Using Your Quiz in a Game:

Currently, quizzes in the game still use hardcoded questions. To connect your quiz templates to the game, we need to:

1. Update the game room to load from database
2. Add quiz selector to join screen
3. Test the integration

**Want me to implement this now?** It will let players select which quiz to play!

## 🔐 Admin Authentication

**Current:** Simple password protection (`admin123`)

**For Production:** You should:
1. Change the admin password (in AdminLogin.tsx)
2. Or implement proper OAuth (Google, GitHub, etc.)
3. Add user management for multiple admins

## 📊 Analytics Features

View for each quiz:
- **Total Games Played**
- **Average Duration**
- **Unique Hosts**
- **Top 10 Scores** (leaderboard)

## 🎨 Customization

### Change Admin Password:

Edit `src/pages/AdminLogin.tsx`:
```typescript
if (password === 'YOUR_NEW_PASSWORD') {
  // ...
}
```

### Add More Categories:

Just create quizzes with new category names - they'll appear automatically in the filter!

### Customize UI Colors:

Edit `src/styles/admin.css` - look for:
```css
background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
```

## 🐛 Troubleshooting

### "Failed to load quizzes"

1. Check worker is deployed: `curl https://quizlink-api.humzab1711.workers.dev/health`
2. Test API: `curl https://quizlink-api.humzab1711.workers.dev/api/admin/quizzes`
3. Verify database tables exist in Neon

### Can't access admin

- Make sure you ran `db/schema.sql` in Neon
- Check browser console for errors (F12)
- Verify you're using password: `admin123`

### Questions not saving

- Verify quiz is saved first (need quiz ID)
- Check all 4 options are filled in
- Ensure correct answer is selected

## 🔗 Admin URLs

- **Dashboard:** https://quizlink.pages.dev/admin
- **Quiz Library:** https://quizlink.pages.dev/admin/quizzes
- **Create Quiz:** https://quizlink.pages.dev/admin/quizzes/new
- **Analytics:** https://quizlink.pages.dev/admin/quizzes/:id/analytics

## 🎯 Next Features to Add

Want me to implement any of these?

1. **Quiz Selector in Game** - Let players choose which quiz to play
2. **Image Upload** - Add images to questions
3. **Timer Mode** - Time-limited questions
4. **Quiz Templates** - Pre-made quiz categories
5. **Team Mode** - Players in teams
6. **Import/Export** - Share quizzes via JSON
7. **Public Quiz Gallery** - Browse community quizzes

---

**Ready to use your admin dashboard!** 🎉

Login at: [https://quizlink.pages.dev/admin](https://quizlink.pages.dev/admin)

Password: `admin123`

