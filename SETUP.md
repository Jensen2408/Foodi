# FoodGram — Setup Guide

## Prerequisites

Install Node.js (one of these):

**Option A — Homebrew (recommended):**
```bash
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
brew install node
```

**Option B — Direct download:**
Go to https://nodejs.org and download the LTS installer.

---

## Quick Start

```bash
# 1. Navigate to the project
cd /Users/simonjensen/foodgram

# 2. Install dependencies
npm install

# 3. Set up the database
npm run db:push

# 4. (Optional) Seed with sample data
npm run db:seed

# 5. Start the app
npm run dev
```

Then open **http://localhost:3000** in your browser.

---

## Features

| Feature | Description |
|---------|-------------|
| 📸 **Photo Posts** | Upload up to 10 photos per post with captions |
| 🍳 **Recipes in Posts** | Attach a full recipe (ingredients + steps) to any post |
| 📖 **Recipe Library** | Standalone recipe pages, searchable by title/tag |
| 📚 **Profile Recipes** | Every user has a public recipe collection tab |
| 🎬 **Stories** | 24-hour food stories, shown at the top of the feed |
| ❤️ **Likes & Comments** | Full engagement on every post |
| 👥 **Follow System** | Follow creators to see their posts in your feed |
| 🔍 **Explore** | Browse all posts in a masonry grid |
| 🔐 **Auth** | Email + password sign up / sign in |

---

## Demo login (after seeding)

- Email: `chef@foodgram.com`
- Password: `password123`

---

## Project structure

```
src/
  app/
    page.tsx              — Home feed
    explore/              — Explore grid
    post/[id]/            — Single post page
    post/new/             — Create post form
    profile/[username]/   — User profile
    recipes/              — Recipe browser
    recipes/[id]/         — Single recipe page
    recipes/new/          — Create recipe form
    stories/new/          — Create story form
    auth/login|register/  — Auth pages
    api/                  — All API routes
  components/
    layout/Navbar.tsx
    feed/Feed.tsx
    post/PostCard.tsx
    story/StoryBar.tsx + StoryViewer.tsx
    ui/                   — Button, Input, Textarea, Avatar
  lib/
    prisma.ts, auth.ts, upload.ts, utils.ts
  hooks/
    useUser.ts
prisma/
  schema.prisma           — SQLite database schema
  seed.ts                 — Sample data
public/uploads/           — Uploaded images stored here
```
