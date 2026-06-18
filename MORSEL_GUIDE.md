# Morsel — Owner Guide

## Your App
- **Web app:** https://foodgram-tau.vercel.app
- **GitHub repo:** https://github.com/Jensen2408/Foodi
- **Vercel project:** vercel.com → foodgram

---

## Admin Panel
- **URL:** foodgram-tau.vercel.app/admin
- Only visible to accounts with admin role
- **What you can do:**
  - See stats (users, posts, recipes, comments, likes, stories)
  - Delete any user, post or recipe
  - Change any user's username
  - Give or remove admin role from users

---

## Database
- **Where:** vercel.com → foodgram → Storage → neon-rose-branch
- **Query tab** — run SQL commands directly
- **Data Editor tab** — browse and edit tables manually
- **Main tables:** User, Post, Recipe, Comment, Like, Follow, Session

### Useful SQL commands
```sql
-- See all users
SELECT username, email, "isAdmin" FROM "User";

-- Make someone admin
UPDATE "User" SET "isAdmin" = true WHERE username = 'username_here';

-- Delete a user
DELETE FROM "User" WHERE username = 'username_here';

-- See all posts
SELECT id, caption, "userId" FROM "Post" ORDER BY "createdAt" DESC;
```

---

## Vercel
- **Deployments:** Every push to GitHub automatically deploys to Vercel
- **Environment Variables:** vercel.com → foodgram → Settings → Environment Variables
- **Logs:** vercel.com → foodgram → Deployments → click a deployment → Functions

---

## Making Changes (Updates)
- Most fixes (bugs, UI, features) → push to GitHub → Vercel deploys automatically → done
- No app update needed for most things
- Only need a new Play Store build if you change native app settings (icon, permissions, etc.)

---

## Play Store
- **App ID:** com.morsel.app
- **App name:** Morsel
- To release a new version:
  1. Bump version in `android/app/build.gradle` (`versionCode` and `versionName`)
  2. Build → Generate Signed App Bundle in Android Studio
  3. Upload to Google Play Console

---

## Auth
- Users sign in with email/password or Google
- **Remember me** = 30 day session cookie
- Without remember me = session cookie (expires when browser closes)
- Sessions stored in `Session` table in database

---

## File Structure (important files)
```
src/
  app/
    page.tsx              — Home/landing page
    admin/page.tsx        — Admin panel
    profile/edit/page.tsx — Edit profile (name, bio, username, avatar)
    auth/login/page.tsx   — Login page
    auth/register/page.tsx — Register page
    api/                  — All backend API routes
  components/
    layout/Navbar.tsx     — Sidebar + mobile nav
    post/PostCard.tsx     — Individual post card
  hooks/
    useUser.ts            — Current logged in user
prisma/
  schema.prisma           — Database schema
```

---

## Branding
- **App name:** Morsel
- **Logo:** public/logo.png
- **Main color:** #db2777 (pink)
- **Secondary color:** #a855f7 (purple)
- **Background:** #f8f6f3 (warm off-white)

---

## Guest Access
- Guests can browse feed, explore, recipes and profiles
- Guests cannot post, comment, like, edit profile or view notifications
- Guests see a landing page with Sign in / Create account / Continue as guest
