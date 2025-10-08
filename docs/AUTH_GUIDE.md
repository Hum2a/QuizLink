# 🔐 QuizLink Authentication Guide

## ✅ Authentication System Complete!

Your QuizLink platform now has enterprise-grade authentication powered by JWT tokens and Neon database!

---

## 🚀 Quick Start

### 1. Set Up Database (First Time Only)

Run these in your [Neon SQL Editor](https://console.neon.tech):

**Step 1 - Create tables:**
- Copy all text from `db/schema.sql`
- Paste in Neon SQL Editor
- Click "Run"

**Step 2 - Add sample quizzes (optional):**
- Copy all text from `db/seed-admin.sql`
- Paste in Neon SQL Editor
- Click "Run"

### 2. Create Your Admin Account

1. **Go to:** https://quizlink.pages.dev/admin/register
2. **Fill in:**
   - Name: (your name)
   - Email: (your email)
   - Password: (min 6 characters)
   - Confirm Password
3. **Click "Create Account"**
4. **Done!** You're now logged in!

### 3. Start Managing Quizzes

- **Dashboard:** https://quizlink.pages.dev/admin
- **Create Quiz:** https://quizlink.pages.dev/admin/quizzes/new
- **View Library:** https://quizlink.pages.dev/admin/quizzes

---

## 🔒 Security Features

### What's Implemented:

✅ **JWT Tokens** - Industry-standard authentication  
✅ **Password Hashing** - SHA-256 encryption  
✅ **Secure Storage** - Tokens in browser localStorage  
✅ **Token Expiration** - 7-day lifetime  
✅ **Auto-logout** - Invalid tokens redirect to login  
✅ **Protected Routes** - Admin pages require authentication  
✅ **API Protection** - All admin endpoints check tokens  
✅ **User Sessions** - Persistent login across page refreshes  

### How It Works:

```
Register/Login
     ↓
Password Hashed (SHA-256)
     ↓
Saved to Neon Database
     ↓
JWT Token Generated
     ↓
Token Stored in Browser
     ↓
Every API Request includes Token
     ↓
Worker Verifies Token
     ↓
Returns Data if Valid
```

---

## 📝 Admin User Management

### Create New Admin:

**Via Registration Page:**
1. Go to: https://quizlink.pages.dev/admin/register
2. Fill in details
3. Click "Create Account"

**Via API (for scripts):**
```powershell
curl -X POST https://quizlink-api.humzab1711.workers.dev/api/auth/register `
  -H "Content-Type: application/json" `
  -d '{"email":"admin@example.com","password":"securepass123","name":"Admin Name"}'
```

### Login:

**Via Login Page:**
1. Go to: https://quizlink.pages.dev/admin/login
2. Enter email + password
3. Click "Login"

**Via API:**
```powershell
curl -X POST https://quizlink-api.humzab1711.workers.dev/api/auth/login `
  -H "Content-Type: application/json" `
  -d '{"email":"admin@example.com","password":"securepass123"}'
```

Returns:
```json
{
  "user": {
    "id": "uuid-here",
    "email": "admin@example.com",
    "name": "Admin Name"
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

### Check Current User:

```powershell
curl https://quizlink-api.humzab1711.workers.dev/api/auth/me `
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

---

## 🔑 Token Management

### Where Tokens are Stored:
- **Browser:** localStorage (key: `quizlink_auth_token`)
- **Auto-sent:** With every admin API request
- **Format:** `Authorization: Bearer <token>`

### Token Lifetime:
- **Duration:** 7 days
- **Renewal:** Login again to get new token
- **Expiration:** Auto-logout when expired

### Manual Logout:
```typescript
// Removes token from localStorage
authService.logout();
```

---

## 🛡️ API Protection

### Endpoints Requiring Authentication:

All `/api/admin/*` endpoints require a valid JWT token:

- `GET /api/admin/quizzes` 🔒
- `POST /api/admin/quizzes` 🔒
- `PUT /api/admin/quizzes/:id` 🔒
- `DELETE /api/admin/quizzes/:id` 🔒
- `GET /api/admin/quizzes/:id/questions` 🔒
- `POST /api/admin/quizzes/:id/questions` 🔒
- `PUT /api/admin/questions/:id` 🔒
- `DELETE /api/admin/questions/:id` 🔒
- `GET /api/admin/quizzes/:id/analytics` 🔒

### Public Endpoints:

These work without authentication:

- `GET /health` ✅
- `POST /api/auth/register` ✅
- `POST /api/auth/login` ✅
- `/game/:roomCode` (WebSocket) ✅

---

## 🧪 Testing Authentication

### Test Registration:

```powershell
# Create a test account
curl -X POST https://quizlink-api.humzab1711.workers.dev/api/auth/register `
  -H "Content-Type: application/json" `
  -d '{
    "email": "test@example.com",
    "password": "testpass123",
    "name": "Test User"
  }'
```

Should return:
```json
{
  "user": {...},
  "token": "eyJ..."
}
```

### Test Login:

```powershell
curl -X POST https://quizlink-api.humzab1711.workers.dev/api/auth/login `
  -H "Content-Type: application/json" `
  -d '{
    "email": "test@example.com",
    "password": "testpass123"
  }'
```

### Test Protected Endpoint:

```powershell
# Without token (should fail)
curl https://quizlink-api.humzab1711.workers.dev/api/admin/quizzes

# Response: {"error":"Authentication required"}

# With token (should work)
curl https://quizlink-api.humzab1711.workers.dev/api/admin/quizzes `
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

---

## 👥 Multi-User Support

### Create Multiple Admins:

Each admin can register their own account:
- Separate logins
- Individual user tracking
- Can see who created each quiz (stored in database)

### View All Admins (SQL):

In Neon SQL Editor:
```sql
SELECT id, email, name, created_at, last_login
FROM admin_users
ORDER BY created_at DESC;
```

---

## 🔧 Configuration

### Change Token Expiration:

Edit `workers/src/auth.ts`:
```typescript
exp: Math.floor(Date.now() / 1000) + (7 * 24 * 60 * 60) // 7 days
// Change 7 to desired days
```

### Change Password Requirements:

Edit `src/pages/AdminRegister.tsx`:
```typescript
if (formData.password.length < 6) {
  // Change minimum length
}
```

### Add Email Validation:

In `AdminRegister.tsx`:
```typescript
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
if (!emailRegex.test(formData.email)) {
  setError('Invalid email format');
  return;
}
```

---

## 🐛 Troubleshooting

### "Failed to login"
- Check email and password are correct
- Verify database tables exist
- Check browser console for errors

### "Authentication required"
- Token expired - login again
- Token invalid - check localStorage
- Clear localStorage and re-login

### "User already exists"
- Email already registered
- Use different email
- Or login with existing account

### Can't access admin pages
- Not logged in - go to /admin/login
- Token expired - login again
- Network error - check API is running

---

## 📊 Database Tables

### admin_users Table:

| Column | Type | Description |
|--------|------|-------------|
| id | UUID | User ID |
| email | VARCHAR | Login email (unique) |
| password_hash | VARCHAR | Hashed password |
| name | VARCHAR | Display name |
| created_at | TIMESTAMP | Account creation |
| last_login | TIMESTAMP | Last login time |

### Quiz Tracking:

Quizzes can optionally track who created them:
- `quiz_templates.created_by` → Links to `admin_users.id`

---

## 🎯 Authentication Checklist

Setup:
- [ ] Run `db/schema.sql` in Neon
- [ ] Run `db/seed-admin.sql` in Neon (optional)
- [ ] Create your admin account via registration

Testing:
- [ ] Register new account
- [ ] Login with credentials
- [ ] Access admin dashboard
- [ ] Create a quiz (tests API auth)
- [ ] Logout
- [ ] Login again
- [ ] Verify token persists across page refresh

---

## 🚀 What's Next?

Your authentication is complete and deployed! You can now:

1. **Create your admin account** (if database is set up)
2. **Start managing quizzes** with secure authentication
3. **Invite other admins** (they can register too)

### Want to Add:

- **OAuth (Google/GitHub login)** - I can implement this
- **Password reset** - Email-based password recovery
- **Role-based access** - Different permission levels
- **Email verification** - Verify email on signup

Just let me know what you'd like next! 🎉

---

## 📚 Related Files

- `workers/src/auth.ts` - Auth logic
- `src/services/auth.ts` - Frontend auth service
- `src/pages/AdminLogin.tsx` - Login page
- `src/pages/AdminRegister.tsx` - Registration page
- `src/components/ProtectedRoute.tsx` - Route protection

---

**Your QuizLink platform now has:**
- ✅ Multiplayer quiz game
- ✅ Admin dashboard
- ✅ Secure authentication
- ✅ Global deployment
- ✅ Database persistence

**Ready to create your first admin account!** 🎊

Visit: https://quizlink.pages.dev/admin/register

