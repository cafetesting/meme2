# Quick Start: Google OAuth Setup

## What You Need to Do (5 minutes)

### Step 1: Google Cloud Console (YOU DO THIS)
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create/select a project
3. Go to **APIs & Services** → **OAuth consent screen**
   - Choose "External"
   - Fill in app name and your email
   - Save through all steps
4. Go to **APIs & Services** → **Credentials**
   - Click **"+ CREATE CREDENTIALS"** → **"OAuth client ID"**
   - Choose "Web application"
   - Add these **TWO** redirect URIs:
     ```
     http://localhost:54321/auth/v1/callback
     http://localhost:3000/auth/callback
     ```
   - Click Create
   - **COPY** the Client ID and Client Secret

### Step 2: Run Setup Script

**Option A: Temporary Setup (for testing)**
```bash
cd /Users/user/Documents/GitHub/testing/meme-generator-nextjs
./setup-google-oauth.sh
```

**Option B: Permanent Setup (recommended)**
```bash
cd /Users/user/Documents/GitHub/testing/meme-generator-nextjs
./setup-permanent-env.sh
```

The permanent setup script will:
- Ask for your Client ID and Secret
- Add them to `~/.zshrc` (persists across sessions)
- Reload your shell configuration
- Variables available in all future terminal sessions

**Note:** After permanent setup, restart Supabase:
```bash
supabase stop && supabase start
```

### Step 3: Test It!
```bash
npm run dev
```

Then go to `http://localhost:3000/login` and click "Google" button.

---

**That's it!** For detailed troubleshooting, see [GOOGLE_OAUTH_SETUP.md](./GOOGLE_OAUTH_SETUP.md)

