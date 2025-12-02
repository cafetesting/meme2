# Supabase Setup Guide: Local & Production Deployment

## Common Mistakes Made & How to Avoid Them

### Mistake 1: Empty `.env.local` File
**What happened:** Created `.env.local` but forgot to add the environment variables.

**Why it matters:** Next.js can't connect to Supabase without these values.

**How to avoid:**
- Always create the file AND immediately add the values
- Copy values directly from `supabase start` output
- Verify with: `cat .env.local` (should show 3 lines)

```bash
# ✅ DO THIS:
cat > .env.local << 'EOF'
NEXT_PUBLIC_SUPABASE_URL=http://127.0.0.1:54321
NEXT_PUBLIC_SUPABASE_ANON_KEY=<your-key>
SUPABASE_SERVICE_ROLE_KEY=<your-key>
EOF

# ❌ DON'T: Create empty file and forget to fill it
touch .env.local  # Then forget to add content
```

### Mistake 2: Installing Supabase CLI via npm
**What happened:** Tried `npm install -g supabase` which isn't supported.

**Why it matters:** Supabase CLI must be installed via Homebrew or install script.

**How to avoid:**
- Use Homebrew: `brew install supabase/tap/supabase`
- Or use install script: `curl -fsSL https://supabase.com/install.sh | sh`
- Always verify: `supabase --version`

### Mistake 3: 502 Error Panic
**What happened:** Got 502 error during `supabase db reset`, but it was temporary.

**Why it happened:** Some containers were restarting, causing brief connection issues.

**How to handle:**
- Wait 30 seconds and try again
- Check Docker containers: `docker ps`
- Check logs: `docker logs supabase_kong_meme-generator-nextjs`
- Often resolves itself

## Local Setup Checklist

### Prerequisites
```bash
# 1. Check Node.js (need 18+)
node --version

# 2. Check Docker (must be running)
docker ps

# 3. Install Supabase CLI (NOT via npm!)
brew install supabase/tap/supabase
# OR
curl -fsSL https://supabase.com/install.sh | sh
```

### Step-by-Step Local Setup

```bash
# 1. Navigate to project
cd /path/to/your/project

# 2. Initialize Supabase (first time only)
supabase init

# 3. Start Supabase (this downloads Docker images - takes time first run)
supabase start

# 4. COPY THE OUTPUT VALUES IMMEDIATELY!
# You'll see:
# - API URL
# - anon key (or publishable key)
# - service_role key (or secret key)

# 5. Create .env.local with those values
cat > .env.local << 'EOF'
NEXT_PUBLIC_SUPABASE_URL=<from-step-4>
NEXT_PUBLIC_SUPABASE_ANON_KEY=<from-step-4>
SUPABASE_SERVICE_ROLE_KEY=<from-step-4>
EOF

# 6. Verify .env.local has content
cat .env.local  # Should show 3 lines

# 7. Run migrations
supabase db reset

# 8. Verify tables exist
supabase db reset  # Should show "Finished supabase db reset"

# 9. Start your app
npm run dev
```

## Production Deployment Guide

### Differences: Local vs Production

| Aspect | Local | Production |
|--------|-------|------------|
| **Setup** | `supabase start` | Create project on supabase.com |
| **URL** | `http://127.0.0.1:54321` | `https://your-project.supabase.co` |
| **Keys** | Generated locally | From Supabase dashboard |
| **Database** | Docker container | Managed PostgreSQL |
| **Storage** | Local Docker | Cloud storage |
| **Migrations** | `supabase db reset` | `supabase db push` |

### Production Setup Steps

#### 1. Create Supabase Project
```bash
# Go to https://supabase.com
# Click "New Project"
# Fill in:
# - Project name
# - Database password (SAVE THIS!)
# - Region (choose closest)
# - Wait ~2 minutes for setup
```

#### 2. Link Local Project to Production
```bash
# Get your project reference ID from Supabase dashboard URL
# Example: https://supabase.com/dashboard/project/abcdefghijklmnop
#                                    project ref: ^^^^^^^^^^^^^^^^

supabase link --project-ref abcdefghijklmnop
```

#### 3. Push Database Schema
```bash
# Push your local migrations to production
supabase db push

# This applies all migrations from supabase/migrations/
```

#### 4. Set Up Storage Bucket
```bash
# Option 1: Via Supabase Dashboard
# - Go to Storage
# - Create bucket "meme-images"
# - Set to Public
# - Configure policies

# Option 2: Via SQL (in Supabase SQL Editor)
# Run the SQL from supabase/migrations/002_storage_setup.sql
```

#### 5. Update Environment Variables
```bash
# In your hosting platform (Vercel/Netlify/etc.)
# Add these environment variables:

NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<from-dashboard>
SUPABASE_SERVICE_ROLE_KEY=<from-dashboard>
```

#### 6. Configure OAuth (if using)
```bash
# In Supabase Dashboard → Authentication → Providers
# Add Google/GitHub OAuth credentials
# Update redirect URLs:
# - Development: http://localhost:3000/auth/callback
# - Production: https://yourdomain.com/auth/callback
```

## Best Practices

### 1. Environment Variables
```bash
# ✅ DO: Use .env.local for local (gitignored)
# ✅ DO: Use platform env vars for production
# ❌ DON'T: Commit .env.local to git
# ❌ DON'T: Hardcode keys in code

# .gitignore should include:
.env.local
.env*.local
```

### 2. Migrations
```bash
# ✅ DO: Create migration files for schema changes
supabase migration new add_new_table

# ✅ DO: Test migrations locally first
supabase db reset  # Test locally

# ✅ DO: Push to production after testing
supabase db push  # Deploy to production

# ❌ DON'T: Make manual changes in production dashboard
# ❌ DON'T: Skip testing migrations locally
```

### 3. Database Schema
```sql
-- ✅ DO: Use Row Level Security (RLS)
ALTER TABLE memes ENABLE ROW LEVEL SECURITY;

-- ✅ DO: Create policies for security
CREATE POLICY "Users can read own memes"
  ON memes FOR SELECT
  USING (auth.uid() = user_id);

-- ❌ DON'T: Disable RLS in production
-- ❌ DON'T: Use service_role key in client-side code
```

### 4. Storage Buckets
```bash
# ✅ DO: Set appropriate policies
# - Public read for images
# - Authenticated write only

# ✅ DO: Organize files by user
# Path: {user_id}/{filename}

# ❌ DON'T: Make buckets public write
# ❌ DON'T: Store sensitive data in public buckets
```

## Troubleshooting Guide

### Issue: "command not found: supabase"
```bash
# Solution 1: Install via Homebrew
brew install supabase/tap/supabase

# Solution 2: Add to PATH
export PATH="/opt/homebrew/bin:$PATH"
# Add to ~/.zshrc for permanent fix

# Solution 3: Use full path
/opt/homebrew/bin/supabase --version
```

### Issue: "502 Bad Gateway"
```bash
# Check Docker containers
docker ps

# Restart Supabase
supabase stop
supabase start

# Check logs
docker logs supabase_kong_meme-generator-nextjs
```

### Issue: "Connection refused"
```bash
# Check if Supabase is running
supabase status

# Check Docker
docker ps | grep supabase

# Restart if needed
supabase stop && supabase start
```

### Issue: Migrations not applying
```bash
# Check migration files exist
ls supabase/migrations/

# Reset database (WARNING: deletes all data)
supabase db reset

# Check migration status
supabase migration list
```

### Issue: Environment variables not working
```bash
# Verify .env.local exists and has content
cat .env.local

# Check variable names (must start with NEXT_PUBLIC_ for client-side)
# Restart dev server after changing .env.local
```

## Production Deployment Checklist

- [ ] Created Supabase project on supabase.com
- [ ] Linked local project: `supabase link --project-ref <ref>`
- [ ] Pushed migrations: `supabase db push`
- [ ] Created storage bucket and set policies
- [ ] Configured OAuth providers (if using)
- [ ] Set environment variables in hosting platform
- [ ] Updated redirect URLs for OAuth
- [ ] Tested authentication flow
- [ ] Tested database operations
- [ ] Tested file uploads
- [ ] Verified RLS policies are working
- [ ] Set up database backups (Supabase does this automatically)

## Key Takeaways

1. **Always copy environment variables immediately** after `supabase start`
2. **Never install Supabase CLI via npm** - use Homebrew or install script
3. **Test migrations locally** before pushing to production
4. **Use `.env.local` for local**, platform env vars for production
5. **Enable RLS** and create proper policies
6. **Keep service_role key secret** - never expose in client code
7. **Use `supabase db reset` locally**, `supabase db push` for production
8. **Verify setup at each step** - don't assume it worked

## Quick Reference Commands

```bash
# Local Development
supabase start              # Start local Supabase
supabase stop               # Stop local Supabase
supabase status             # Check status
supabase db reset           # Reset database (local)
supabase migration new <name> # Create new migration

# Production
supabase link --project-ref <ref>  # Link to production
supabase db push                   # Push migrations to production
supabase db pull                   # Pull schema from production

# Both
supabase migration list     # List migrations
supabase db diff            # See schema differences
```

## Environment Variables Reference

### Local (.env.local)
```env
NEXT_PUBLIC_SUPABASE_URL=http://127.0.0.1:54321
NEXT_PUBLIC_SUPABASE_ANON_KEY=sb_publishable_...
SUPABASE_SERVICE_ROLE_KEY=sb_secret_...
```

### Production (Platform Environment Variables)
```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Important Notes:**
- `NEXT_PUBLIC_` prefix is required for client-side access
- `SUPABASE_SERVICE_ROLE_KEY` should NEVER be exposed to client
- Always use different keys for local vs production
- Never commit `.env.local` to version control

## Migration Workflow

### Creating a New Migration
```bash
# 1. Create migration file
supabase migration new add_user_preferences

# 2. Edit the file in supabase/migrations/
# Add your SQL changes

# 3. Test locally
supabase db reset

# 4. Verify it works
# Test your app locally

# 5. Push to production
supabase db push
```

### Example Migration File
```sql
-- supabase/migrations/20241202123456_add_user_preferences.sql

-- Add preferences column to profiles
ALTER TABLE profiles 
ADD COLUMN preferences JSONB DEFAULT '{}'::jsonb;

-- Create index for faster queries
CREATE INDEX idx_profiles_preferences ON profiles USING GIN (preferences);
```

## Security Best Practices

1. **Row Level Security (RLS)**
   - Always enable RLS on tables
   - Create policies for each operation (SELECT, INSERT, UPDATE, DELETE)
   - Test policies thoroughly

2. **API Keys**
   - Use `anon` key for client-side (public)
   - Use `service_role` key only server-side (never expose)
   - Rotate keys if compromised

3. **Storage Policies**
   - Never allow public write access
   - Use user-specific paths: `{user_id}/{filename}`
   - Validate file types and sizes

4. **Database Access**
   - Use connection pooling in production
   - Set up database backups
   - Monitor query performance

## Common Patterns

### Pattern 1: User-Specific Data
```sql
-- Policy: Users can only see their own data
CREATE POLICY "Users see own data"
ON memes FOR SELECT
USING (auth.uid() = user_id);
```

### Pattern 2: Public Read, Authenticated Write
```sql
-- Policy: Anyone can read public memes
CREATE POLICY "Public memes readable"
ON memes FOR SELECT
USING (is_public = true);

-- Policy: Only owners can update
CREATE POLICY "Owners can update"
ON memes FOR UPDATE
USING (auth.uid() = user_id);
```

### Pattern 3: Storage Organization
```javascript
// Upload file with user-specific path
const fileName = `${user.id}/${Date.now()}.png`;
await supabase.storage
  .from('meme-images')
  .upload(fileName, file);
```

## Notes from This Project

- **Project:** Meme Generator Next.js + Supabase
- **Date:** December 2025
- **Mistakes Learned:**
  1. Empty .env.local file
  2. Wrong Supabase CLI installation method
  3. 502 errors are often temporary - wait and retry
- **Success Factors:**
  - Verified each step before proceeding
  - Used proper Supabase CLI installation
  - Tested migrations locally before production
  - Set up RLS policies correctly

