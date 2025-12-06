# Restart Guide After Being AFK

This guide explains how to restart all services for the Meme Generator app after being away for a while.

## Quick Overview

After being AFK, you typically need to restart:
1. **Docker Desktop** (if it stopped)
2. **Supabase services** (database, API, storage)
3. **Next.js dev server** (your main app)

**Note:** Google OAuth doesn't need restarting - it works automatically once Supabase is running.

---

## Step-by-Step Restart Process

### Step 1: Check/Start Docker Desktop

Docker Desktop must be running for Supabase to work.

**Check if Docker is running:**
- Look for the Docker icon (whale) in your macOS menu bar
- Or run: `docker ps` in terminal

**If Docker is not running:**
- Open Docker Desktop from Applications
- Wait until you see "Docker Desktop is running" in the menu bar

### Step 2: Start Supabase Services

```bash
cd ~/Documents/GitHub/testing/meme-generator-nextjs
supabase start
```

This starts:
- ✅ Database (port 54322)
- ✅ API (port 54321)
- ✅ Studio (port 54323)
- ✅ Mailpit/Email testing (port 54324)

**Verify Supabase is running:**
```bash
supabase status
```

You should see all services listed as running.

### Step 3: Start Next.js App

Open a **new terminal window/tab** and run:

```bash
cd ~/Documents/GitHub/testing/meme-generator-nextjs
npm run dev
```

This starts your app on **port 3000**.

**You'll see output like:**
```
▲ Next.js 14.x.x
- Local:        http://localhost:3000
- Ready in 2.3s
```

### Step 4: Verify Everything Works

Open your browser and check:
- **Main App:** http://localhost:3000
- **Supabase Studio:** http://localhost:54323
- **Supabase API:** http://localhost:54321

---

## Quick Restart Script

Create a script to automate the restart process:

**Create file:** `restart-all.sh` in project root:

```bash
#!/bin/bash

echo "🚀 Starting Meme Generator Services..."

# Check if Docker is running
if ! docker ps > /dev/null 2>&1; then
    echo "⚠️  Docker is not running. Please start Docker Desktop first."
    exit 1
fi

# Navigate to project directory
cd ~/Documents/GitHub/testing/meme-generator-nextjs

# Start Supabase
echo "📦 Starting Supabase..."
supabase start

# Wait a moment for Supabase to fully start
sleep 3

# Check Supabase status
echo "✅ Supabase Status:"
supabase status

echo ""
echo "🌐 Starting Next.js dev server..."
echo "   App will be available at: http://localhost:3000"
echo "   Press Ctrl+C to stop"
echo ""

# Start Next.js (this will run in foreground)
npm run dev
```

**Make it executable:**
```bash
chmod +x restart-all.sh
```

**Run it:**
```bash
./restart-all.sh
```

---

## Common Issues & Solutions

### Issue 1: Port Already in Use

**Error:** "Port 3000 is already in use" or similar

**Solution:**
```bash
# Stop Supabase
cd ~/Documents/GitHub/testing/meme-generator-nextjs
supabase stop

# Kill Next.js process
lsof -ti:3000 | xargs kill -9

# Then restart both
supabase start
npm run dev
```

### Issue 2: Docker Stopped

**Symptom:** `supabase start` fails with Docker connection error

**Solution:**
1. Open Docker Desktop application
2. Wait for it to fully start (check menu bar icon)
3. Run `supabase start` again

### Issue 3: Next.js Terminal Closed

**Symptom:** App was working but now http://localhost:3000 doesn't respond

**Solution:**
- Just run `npm run dev` again in a new terminal
- The terminal window may have closed while you were away

### Issue 4: Supabase Containers Stopped

**Symptom:** `supabase status` shows services as stopped

**Solution:**
```bash
cd ~/Documents/GitHub/testing/meme-generator-nextjs
supabase stop
supabase start
```

---

## Quick Reference Commands

| Action | Command |
|--------|---------|
| **Start Supabase** | `cd ~/Documents/GitHub/testing/meme-generator-nextjs && supabase start` |
| **Stop Supabase** | `cd ~/Documents/GitHub/testing/meme-generator-nextjs && supabase stop` |
| **Check Supabase Status** | `cd ~/Documents/GitHub/testing/meme-generator-nextjs && supabase status` |
| **Start Next.js** | `cd ~/Documents/GitHub/testing/meme-generator-nextjs && npm run dev` |
| **Check Ports** | `lsof -i :3000 -i :54321 -i :54323` |
| **Kill Port 3000** | `lsof -ti:3000 | xargs kill -9` |

---

## Typical Restart Workflow

1. **Open Terminal**
2. **Check Docker:** Look for Docker icon in menu bar, start if needed
3. **Start Supabase:**
   ```bash
   cd ~/Documents/GitHub/testing/meme-generator-nextjs
   supabase start
   ```
4. **Open new terminal tab/window**
5. **Start Next.js:**
   ```bash
   cd ~/Documents/GitHub/testing/meme-generator-nextjs
   npm run dev
   ```
6. **Open browser:** http://localhost:3000

---

## Active Ports Reference

When everything is running, these ports should be active:

| Service | Port | URL | Purpose |
|---------|------|-----|---------|
| **Next.js App** | 3000 | http://localhost:3000 | Main application |
| **Supabase API** | 54321 | http://localhost:54321 | REST API, Auth |
| **Supabase Studio** | 54323 | http://localhost:54323 | Database admin UI |
| **Mailpit** | 54324 | http://localhost:54324 | Email testing |
| **PostgreSQL** | 54322 | (connection string) | Database |

---

## Google OAuth Notes

**No restart needed!** Google OAuth works automatically once:
- ✅ Supabase is running
- ✅ Environment variables are set in `.env.local`
- ✅ OAuth credentials are configured in Supabase dashboard

If OAuth stops working:
1. Check Supabase is running: `supabase status`
2. Verify environment variables: Check `.env.local` file
3. Check Supabase dashboard: http://localhost:54323 → Authentication → Providers

---

## Tips

- **Keep Docker Desktop running** - It's needed for Supabase
- **Use separate terminal tabs** - One for Supabase, one for Next.js
- **Check status first** - Run `supabase status` before starting to see what's already running
- **Save your work** - Restarting services won't affect your code or database data

---

## Troubleshooting Checklist

If something isn't working:

- [ ] Is Docker Desktop running?
- [ ] Did you run `supabase start`?
- [ ] Is Next.js dev server running (`npm run dev`)?
- [ ] Are the ports responding? (Check URLs above)
- [ ] Did you check for port conflicts?
- [ ] Are environment variables set correctly?

---

## Need Help?

If services won't start:
1. Check Docker Desktop is running
2. Try: `supabase stop && supabase start`
3. Check logs: `supabase logs` or Docker Desktop logs
4. Restart Docker Desktop if needed

