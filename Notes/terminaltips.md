# Terminal Tips & Best Practices

This guide covers terminal usage, process management, and understanding development servers.

## Table of Contents
1. [When to Use Same Terminal vs New Terminal](#when-to-use-same-terminal-vs-new-terminal)
2. [Tracking Active Terminals](#tracking-active-terminals)
3. [Risks of Killing Terminals](#risks-of-killing-terminals)
4. [Understanding npm run dev](#understanding-npm-run-dev)
5. [Resource Usage & Limits](#resource-usage--limits)

---

## When to Use Same Terminal vs New Terminal

### Use the Same Terminal When:

✅ **Quick commands that exit immediately:**
- `memestop` - Runs and exits
- `supabase status` - Shows info and exits
- `ls`, `cd`, `pwd` - Quick navigation
- `supabase start` - Starts services, shows output, exits

✅ **Terminal is not busy:**
- No long-running process active
- You can type commands freely

### Open a New Terminal When:

❌ **Long-running processes:**
- `npm run dev` - Keeps running continuously
- Any process that doesn't return to prompt
- Processes that show continuous output

❌ **Need multiple things running:**
- Keep `npm run dev` in Terminal 1
- Run other commands in Terminal 2
- Don't interrupt running processes

### Quick Decision Guide

| Command | Use Same Terminal? | Why? |
|---------|-------------------|------|
| `memestop` | ✅ Yes (if free) | Quick, exits immediately |
| `memestart` | ✅ Yes (if free) | Starts services, shows output |
| `npm run dev` | ❌ No (use new terminal) | Long-running, blocks terminal |
| `supabase start` | ✅ Yes (if free) | Shows logs, then exits |
| `supabase status` | ✅ Yes | Quick check, exits |
| `cd`, `ls`, `pwd` | ✅ Yes | Quick commands |

### Pro Tip: Use Terminal Tabs

Instead of opening new windows, use tabs:
- `Cmd + T` - New tab in same window
- `Cmd + W` - Close tab
- `Cmd + 1/2/3` - Switch between tabs

**Example setup:**
- Tab 1: `npm run dev` (running)
- Tab 2: For other commands (`memestop`, `supabase status`, etc.)

---

## Tracking Active Terminals

### Method 1: Check Running Processes

See what's actually running (not just terminals):

```bash
# See all Node.js processes (Next.js, npm, etc.)
ps aux | grep node

# See all processes on specific ports
lsof -i :3000 -i :54321 -i :54323

# See all your processes
ps aux | grep $USER
```

### Method 2: Check Specific Ports

```bash
# Check if Next.js is running
lsof -i :3000

# Check if Supabase is running
lsof -i :54321

# Check all your app's ports at once
lsof -i :3000 -i :54321 -i :54322 -i :54323 -i :54324
```

### Method 3: Use Activity Monitor (GUI)

1. Open **Activity Monitor** (Applications → Utilities)
2. Search for: `node`, `supabase`, `docker`
3. See what's running and resource usage

### Method 4: Terminal Window Management

**In Terminal app:**
- `Window` menu → `List All Windows` (or `Cmd + \`)
- See all open terminal windows

**For tabs:**
- Look at the tab bar at the top
- Each tab shows its title/process

### Create a Status Check Alias

Add to `~/.zshrc`:
```bash
alias memestatus="echo '=== Port Status ===' && lsof -i :3000 -i :54321 -i :54323 2>/dev/null | grep LISTEN && echo '' && echo '=== Supabase Status ===' && cd ~/Documents/GitHub/testing/meme-generator-nextjs && supabase status 2>&1 | head -10"
```

Then run:
```bash
memestatus
```

---

## Risks of Killing Terminals

### What Happens When You Close Terminals

**Safe to close:**
- ✅ Empty terminals (just showing prompt)
- ✅ Terminals running quick commands that finished
- ✅ Terminals showing logs/output (they'll just stop showing output)

**What gets killed:**
- ⚠️ Processes running in that terminal
- ⚠️ If `npm run dev` is running → it stops
- ✅ If `supabase start` is running → Supabase keeps running (it's in Docker)

### Important Distinction

| Process Type | What Happens When Terminal Closes |
|-------------|-----------------------------------|
| **Foreground process** (npm run dev) | ✅ Gets killed (SIGHUP signal) |
| **Background process** (`&` at end) | ✅ Keeps running |
| **Docker containers** (Supabase) | ✅ Keep running (independent of terminal) |
| **System services** | ✅ Keep running |

### Risk Levels

**Low Risk:**
- Losing unsaved work in editors (but code is saved in files)
- Stopping development servers (just restart them)
- Interrupting downloads/uploads

**Medium Risk:**
- Stopping important background tasks
- Losing terminal history/scrollback
- Interrupting long-running operations

**High Risk (Rare):**
- Stopping critical system processes (unlikely from user terminals)
- Interrupting database operations mid-transaction (unlikely in dev)

### Safer Approach: Check First, Then Kill

**Step 1: See what's running**
```bash
# Check your app's ports
lsof -i :3000 -i :54321 -i :54323

# Check Node processes
ps aux | grep node | grep -v grep
```

**Step 2: Kill specific processes (safer)**
```bash
# Kill Next.js specifically
lsof -ti:3000 | xargs kill -9

# Kill all Node processes (be careful!)
pkill -9 node

# Stop Supabase properly
cd ~/Documents/GitHub/testing/meme-generator-nextjs
supabase stop
```

**Step 3: Then close terminals**
- After processes are stopped, closing terminals is safe

### Recommended Workflow

**Before closing everything:**

1. **Check what's running:**
   ```bash
   lsof -i :3000 -i :54321 -i :54323
   ```

2. **Stop services properly:**
   ```bash
   memestop  # Your custom command
   ```

3. **Then close terminals:**
   - Safe to close all terminals now

### Summary Table

| Action | Risk Level | Recommendation |
|--------|-----------|----------------|
| **Close empty terminals** | ✅ Very Safe | Go ahead |
| **Close terminal with `npm run dev`** | ⚠️ Low Risk | Stops dev server (just restart) |
| **Kill all processes** | ⚠️ Medium Risk | Check first, then kill |
| **Close all terminals** | ✅ Usually Safe | Processes stop, Docker keeps running |

---

## Understanding npm run dev

### What `npm run dev` Actually Does

When you run `npm run dev`, it:

1. **Starts a web server** (Next.js dev server)
2. **Listens on port 3000** for incoming requests
3. **Waits for you** to visit `http://localhost:3000`
4. **Compiles your code** when you make changes
5. **Serves your app** when you access it

### Think of it Like a Restaurant

- The server is **open and waiting**
- It doesn't close just because no one is eating right now
- It stays open until you tell it to close

### What It's Doing When "Idle"

Even when you're not using the app:

1. **Listening for requests**
   - Watching port 3000
   - Ready to respond instantly

2. **Watching files**
   - Monitoring your code files for changes
   - Ready to recompile when you edit code

3. **Keeping compiled code in memory**
   - Cached compiled pages/components
   - Ready to serve quickly

4. **Running background processes**
   - Hot Module Replacement (HMR) system
   - File watchers
   - Build cache management

### Resource Usage When Idle

| Resource | Usage When Idle |
|----------|----------------|
| **CPU** | Very low (~0-2%) - just waiting |
| **Memory** | Moderate (~100-300MB) - holding code in RAM |
| **Network** | Minimal - just listening on port |

### Why It Never Stops Running

**It's designed to keep running:**

**It's a server, not a script:**
- **Scripts:** Run → Do work → Exit
- **Servers:** Start → Wait → Serve requests → Keep waiting

**Example comparison:**

```bash
# Script (stops automatically)
npm run build
# → Compiles code
# → Creates files
# → ✅ DONE (exits)

# Server (keeps running)
npm run dev
# → Starts server
# → Waits for requests...
# → Waits for requests...
# → Waits for requests...
# → Never stops (until you tell it to)
```

### Real-World Analogy

| Type | Behavior |
|------|----------|
| **Script** | Like a delivery person: Goes to address → Delivers → Leaves |
| **Server** | Like a store: Opens → Waits for customers → Stays open |

### What Happens When You Visit the App

When you open `http://localhost:3000`:

1. Your browser sends a request to port 3000
2. Next.js dev server receives it
3. Compiles/serves the page
4. Sends HTML/CSS/JS back to browser
5. Goes back to waiting for next request

### The Cycle

```
npm run dev starts
    ↓
Waits... (idle)
    ↓
You visit localhost:3000
    ↓
Server responds (serves page)
    ↓
Waits... (idle again)
    ↓
You edit a file
    ↓
Server recompiles (watches files)
    ↓
Waits... (idle)
    ↓
[Repeats forever until you stop it]
```

### Why This Design?

**Benefits of keeping it running:**

1. **Instant response**
   - No startup delay when you visit the app
   - Code already compiled and ready

2. **Hot reloading**
   - Changes appear immediately
   - No need to restart

3. **Development workflow**
   - Edit code → See changes instantly
   - No manual restart needed

4. **Debugging**
   - Server stays connected
   - Can debug continuously

### How to Stop It

**Normal stop:**
```bash
# In the terminal running npm run dev:
Ctrl + C  (or Cmd + C on Mac)
```

**Force stop:**
```bash
# From another terminal:
lsof -ti:3000 | xargs kill -9
```

**Using your script:**
```bash
memestop  # Stops it properly
```

---

## Resource Usage & Limits

### Each Terminal Uses:

- **Memory:** ~10-50 MB per terminal window/tab
- **CPU:** Minimal when idle (near 0%)
- **File handles:** A few per terminal

### Realistic Limits

| Number of Terminals | Impact | Notes |
|-------------------|--------|-------|
| **1-5 terminals** | ✅ Negligible | Normal usage |
| **10-20 terminals** | ✅ Still fine | Might get confusing |
| **50+ terminals** | ⚠️ Noticeable | Uses ~500MB-2GB RAM |
| **100+ terminals** | ❌ Problematic | Can slow down system |

### What Actually Matters

**Processes, not terminals:**
- 1 terminal running 10 processes = higher load
- 10 terminals with 1 process each = similar load
- The **processes** are what use CPU/RAM

**Example:**
```
Terminal 1: npm run dev        (uses CPU/RAM)
Terminal 2: supabase start     (uses CPU/RAM)
Terminal 3: (empty/idle)       (uses ~10MB RAM)
Terminal 4: (empty/idle)       (uses ~10MB RAM)
Terminal 5: (empty/idle)       (uses ~10MB RAM)
```

The first two terminals matter; the idle ones barely matter.

### Best Practices

**Recommended approach:**
- ✅ **2-5 terminals:** Normal and fine
- ✅ **Use tabs instead of windows:** Easier to manage
- ✅ **Close unused terminals:** Keep things tidy

**When to worry:**
- ⚠️ You have 20+ terminals open
- ⚠️ Your Mac is running slow
- ⚠️ You're low on RAM (< 4GB free)

### Practical Limits

**macOS limits:**
- macOS can handle hundreds of terminals
- System limits are usually process/file handle limits, not terminal count
- You'll hit **practical limits** (confusion) before system limits

**What to watch:**
- Total RAM usage (Activity Monitor)
- Number of running processes
- System responsiveness

### Summary

| Concern | Reality |
|---------|---------|
| **Too many terminals?** | Not really a problem |
| **Memory usage?** | Minimal per terminal (~10-50 MB) |
| **CPU usage?** | Negligible when idle |
| **Real issue?** | Confusion/management, not system resources |
| **Safe number?** | 5-10 terminals is fine |
| **When to worry?** | 50+ terminals or system slowdown |

---

## Key Takeaways

### Terminal Usage
- Use same terminal for quick commands
- Use new terminal for long-running processes
- Use tabs instead of many windows
- 5-10 terminals is perfectly fine

### Process Management
- Check what's running before killing
- Use `memestop` to stop services properly
- Close terminals after stopping processes
- Docker containers run independently

### Development Servers
- `npm run dev` is a server that stays running
- It waits for requests and watches files
- Uses minimal resources when idle
- Stop it when done developing

### Best Practices
- **Before AFK:** Run `memestop`, then close terminals
- **Check status:** Use `memestatus` alias (if created)
- **Monitor resources:** Use Activity Monitor if system slows
- **Stay organized:** Use tabs, close unused terminals

---

## Quick Reference

### Commands
```bash
# Stop all services
memestop

# Check what's running
memestatus  # (if alias created)
lsof -i :3000 -i :54321 -i :54323

# Stop specific process
lsof -ti:3000 | xargs kill -9

# Check Supabase
supabase status
```

### Keyboard Shortcuts
- `Cmd + T` - New tab
- `Cmd + W` - Close tab
- `Cmd + 1/2/3` - Switch tabs
- `Ctrl + C` / `Cmd + C` - Stop current process

---

## Related Documentation

- [Restart Guide After AFK](./RestartafterAFK.md)
- [Error Fixes Summary](../meme-generator-nextjs/F2Bconbineerror1.md)

