# 👥 QuizLink User Accounts - Complete Guide

## 🎉 What Changed

QuizLink now has a **complete user account system**! Users MUST create an account before playing - this enables personalized stats, game history, and persistent profiles.

---

## 🌟 New User Features

### For Every Player:

1. **Personal Account** ✅
   - Unique username
   - Email login
   - Secure password
   - Colorful avatar

2. **Profile Dashboard** ✅
   - View personal stats
   - See game history
   - Track performance
   - Monitor progress

3. **Persistent Stats** ✅
   - Total games played
   - Total score (all-time)
   - Highest score
   - Average score per game
   - Per-quiz statistics

4. **Game History** ✅
   - Recent games played
   - Scores and rankings
   - Quiz titles
   - Timestamps

---

## 🚀 How It Works

### First Time User Experience:

```
1. Visit: https://quizlink.pages.dev
2. → Automatically redirected to /register
3. See: "Join QuizLink!" registration form
4. Fill in:
   - Username (unique, 3+ chars)
   - Display Name (shown in games)
   - Email
   - Password (6+ chars)
   - Confirm Password
5. Click "Create Account & Start Playing"
6. → Auto-logged in
7. → Redirected to join screen
8. → Ready to play!
```

### Returning User:

```
1. Visit: https://quizlink.pages.dev
2. If logged out → Redirected to /login
3. Enter email or username + password
4. → Logged in
5. → Join screen (name pre-filled!)
```

### During Gameplay:

```
1. Top-right shows: 👤 [Your Name]
2. Click name → View profile
3. Click 🚪 Logout → Logout
4. Stats automatically saved after each game!
```

---

## 📊 Database Structure

### user_accounts Table:
```sql
- id (UUID)
- email (unique)
- username (unique)  
- display_name
- password_hash (SHA-256)
- avatar_color
- total_games_played
- total_score
- highest_score
- created_at
- last_login
- last_active
```

### user_game_history Table:
```sql
- user_id → links to user account
- game_id → links to game
- player_id → links to player in game
- score
- rank
- played_at
```

### user_stats Table:
```sql
- user_id
- quiz_template_id
- times_played
- best_score
- avg_score
- total_correct
- total_questions
- last_played
```

---

## 🔐 Security & Privacy

### What's Secure:
- ✅ Passwords hashed with SHA-256
- ✅ JWT tokens (30-day expiration)
- ✅ Tokens stored in localStorage
- ✅ Auto-logout on invalid/expired token
- ✅ Separate user and admin authentication

### User Data Stored:
- ✅ Account info (email, username, name)
- ✅ Game history and scores
- ✅ Quiz performance stats
- ✅ Login timestamps

### Privacy Notes:
- Emails not shared publicly
- Stats visible only to account owner
- Usernames visible in games
- Display names shown to other players

---

## 🎯 Key URLs

| Page | URL | Access |
|------|-----|--------|
| **Registration** | https://quizlink.pages.dev/register | Public (first visit) |
| **Login** | https://quizlink.pages.dev/login | Public |
| **Game** | https://quizlink.pages.dev/ | Requires login |
| **Profile** | https://quizlink.pages.dev/profile | Requires login |
| **Admin** | https://quizlink.pages.dev/admin | Separate login |

---

## 🎮 User Flow Examples

### New Player Joins:

1. **Friend shares:** "Join my quiz at quizlink.pages.dev"
2. **New user visits** → Sees registration
3. **Creates account** (30 seconds)
4. **Auto-logged in** → Join screen
5. **Enters room code** (friend's game)
6. **Plays quiz!**
7. **Scores saved** to their profile
8. **Can view stats** anytime

### Returning Player:

1. **Visits:** quizlink.pages.dev
2. **Logged in?** → Join screen (name pre-filled)
3. **Logged out?** → Login page
4. **After login** → Join screen
5. **Previous stats** still there!

---

## 📱 What Users See

### Registration Form:
- **Username** - Unique handle (e.g., "player123")
- **Display Name** - Shown in games (e.g., "John Doe")
- **Email** - For login
- **Password** - Minimum 6 characters
- **Confirm Password** - Validation

### Login Form:
- **Email or Username** - Either works!
- **Password** - Same password from registration

### Profile Page:
- **Avatar** - Colorful circle with initial
- **Stats**:
  - Games Played: 15
  - Total Score: 12,450
  - Highest Score: 900
  - Avg Score: 830
- **Recent Games** - Last 10 games
- **Quiz Stats** - Performance per quiz

---

## 🔗 API Endpoints

### User Auth Endpoints:

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/auth/user/register` | POST | Create new user account |
| `/api/auth/user/login` | POST | Login user |
| `/api/auth/user/me` | GET | Get current user |
| `/api/auth/user/profile` | GET | Get full profile with stats |

### Example - Register User:

```powershell
curl -X POST https://quizlink-api.humzab1711.workers.dev/api/auth/user/register `
  -H "Content-Type: application/json" `
  -d '{
    "email": "player@example.com",
    "password": "password123",
    "username": "player123",
    "display_name": "Cool Player"
  }'
```

### Example - Login User:

```powershell
curl -X POST https://quizlink-api.humzab1711.workers.dev/api/auth/user/login `
  -H "Content-Type: application/json" `
  -d '{
    "emailOrUsername": "player123",
    "password": "password123"
  }'
```

Returns:
```json
{
  "user": {
    "id": "uuid",
    "email": "player@example.com",
    "username": "player123",
    "display_name": "Cool Player",
    "avatar_color": "#667eea",
    "total_games_played": 0,
    "total_score": 0,
    "highest_score": 0
  },
  "token": "eyJ..."
}
```

---

## 🎨 Customization

### Change Avatar Colors:

Edit `workers/src/user-auth.ts`:
```typescript
const colors = [
  '#667eea', // Purple-blue
  '#764ba2', // Purple
  '#f093fb', // Pink
  '#4facfe', // Blue
  '#43e97b', // Green
  '#fa709a', // Pink-orange
  '#feca57', // Yellow
  '#ff6348'  // Red
];
```

### Change Token Expiration:

Edit `workers/src/user-auth.ts`:
```typescript
exp: Math.floor(Date.now() / 1000) + (30 * 24 * 60 * 60) // 30 days
// Change 30 to desired days
```

### Username Requirements:

Edit `src/pages/UserRegister.tsx`:
```typescript
if (formData.username.length < 3) {
  // Change minimum length
}
```

---

## 📝 Next Steps

### For You (Setup):

1. **Run Database Migration:**
   - Copy `db/schema.sql` into Neon
   - Run it
   - This creates `user_accounts` table

2. **Create Your Account:**
   - Go to: https://quizlink.pages.dev
   - → Redirects to registration
   - Fill in your details
   - Create account!

3. **Test It:**
   - View your profile
   - Join a quiz game
   - Play and see stats saved!

### For Your Users:

Just share: **https://quizlink.pages.dev**

They'll see registration first, create account, and start playing!

---

## 🔄 Migration from Old System

**Before:**
- No accounts required
- Just enter name
- No data saved
- Anonymous players

**After:**
- Account required
- Username + profile
- All stats saved
- Persistent identity

**Migrating:**
- Old anonymous games still work
- No migration needed
- New games use new system
- Gradual adoption

---

## 🎊 Benefits of User Accounts

### For Players:
- ✅ Track personal progress
- ✅ View game history
- ✅ See improvement over time
- ✅ Compete on global leaderboard (coming soon!)
- ✅ Personalized experience

### For You (Host):
- ✅ See who plays your quizzes
- ✅ Track user engagement
- ✅ Build community
- ✅ Reward top players
- ✅ Analytics on users

### For Platform:
- ✅ User retention
- ✅ Data persistence
- ✅ Better analytics
- ✅ Social features (future)
- ✅ Premium features (future)

---

## 🐛 Troubleshooting

### "Failed to register"
- Username already taken → Try different username
- Email already exists → Login instead
- Password too short → Use 6+ characters

### "Invalid credentials"
- Check email/username spelling
- Verify password is correct
- Account might not exist → Register

### Can't access game
- Not logged in → Login first
- Token expired → Login again
- Network issue → Check connection

### Stats not showing
- Database not set up → Run schema.sql
- Haven't played games yet → Play some!
- Profile not loading → Check API

---

## 🚀 What's Next?

I can add these features:

1. **Global Leaderboard** - Top players across all games
2. **Achievements System** - Unlock badges
3. **Friend System** - Add friends, invite to games
4. **User Avatars** - Upload custom profile pics
5. **Stat Comparison** - Compare with friends
6. **Email Verification** - Verify email on signup
7. **Password Reset** - Email-based recovery
8. **OAuth Login** - Google/Facebook/GitHub
9. **User Levels** - XP and leveling system
10. **Social Features** - Comments, reactions

**Want any of these?** Just let me know! 🎯

---

## 📊 Complete Platform Architecture

```
User Visits QuizLink
     ↓
Registration Page (FIRST!)
     ↓
Create Account → Saved to Neon
     ↓
Auto-Login → JWT Token
     ↓
Join Screen (name pre-filled)
     ↓
Enter Room Code
     ↓
Play Quiz (real-time)
     ↓
Scores Saved to Profile
     ↓
View Profile → See Stats
```

---

## ✨ Summary

**You now have:**
- ✅ Complete user account system
- ✅ Registration as first screen
- ✅ User profiles with stats
- ✅ Persistent game history
- ✅ Secure authentication
- ✅ Global deployment

**All deployed and ready to use!** 🎉

**Next:** Run the database migration, then visit the app! The first thing users will see is account creation! 🚀

