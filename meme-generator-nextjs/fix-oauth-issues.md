# Fixing Google OAuth and Frontend Issues

## Issues Identified

1. ✅ **Supabase is running** - Docker containers are active
2. ✅ **Environment variables for Next.js** - `.env.local` exists and is configured
3. ⚠️ **Google OAuth credentials** - Not configured in shell environment
4. ⚠️ **Frontend connection** - May need verification

## Root Cause

The Google OAuth isn't working because:
- Google OAuth Client ID and Secret are not set as environment variables
- Supabase needs these variables to authenticate with Google
- Without them, clicking "Google" button will fail

## Step-by-Step Fix

### Step 1: Set Up Google OAuth Credentials

**If you haven't created Google OAuth credentials yet:**

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create/select a project
3. Configure OAuth consent screen
4. Create OAuth 2.0 credentials
5. Add redirect URIs:
   - `http://localhost:54321/auth/v1/callback`
   - `http://localhost:3000/auth/callback`

**Then run:**
```bash
cd /Users/user/Documents/GitHub/testing/meme-generator-nextjs
./setup-permanent-env.sh
```

### Step 2: Restart Supabase

After setting environment variables, restart Supabase so it picks them up:

```bash
# Find Supabase CLI path (if installed via Homebrew)
which supabase || /opt/homebrew/bin/supabase stop
which supabase || /opt/homebrew/bin/supabase start

# Or if Supabase CLI is not in PATH, restart Docker containers manually:
docker restart supabase_auth_meme-generator-nextjs
docker restart supabase_kong_meme-generator-nextjs
```

### Step 3: Verify Frontend Connection

1. **Check if Next.js dev server is running:**
   ```bash
   cd /Users/user/Documents/GitHub/testing/meme-generator-nextjs
   npm run dev
   ```

2. **Verify Supabase connection:**
   - Open browser console (F12)
   - Go to `http://localhost:3000/login`
   - Check for any errors in console

3. **Test Google OAuth:**
   - Click "Google" button
   - Should redirect to Google sign-in
   - After signing in, should redirect back to `/create`

## Common Issues and Solutions

### Issue: "redirect_uri_mismatch" Error

**Solution:**
- Make sure both redirect URIs are added in Google Cloud Console:
  - `http://localhost:54321/auth/v1/callback`
  - `http://localhost:3000/auth/callback`
- Wait a few minutes after adding (Google caches redirect URIs)

### Issue: "OAuth provider not enabled"

**Solution:**
- Check `supabase/config.toml` - Google OAuth should be enabled
- Verify environment variables are set: `echo $SUPABASE_AUTH_EXTERNAL_GOOGLE_CLIENT_ID`
- Restart Supabase after setting variables

### Issue: Frontend can't connect to Supabase

**Solution:**
1. Check `.env.local` exists and has correct values
2. Verify Supabase is running: `docker ps | grep supabase`
3. Test API: `curl http://127.0.0.1:54321/rest/v1/`
4. Restart Next.js dev server: `npm run dev`

### Issue: "Authentication failed" after Google sign-in

**Solution:**
1. Check browser console for errors
2. Check Supabase auth logs: `docker logs supabase_auth_meme-generator-nextjs`
3. Verify callback route is accessible: `http://localhost:3000/auth/callback`
4. Check middleware isn't blocking the callback route

## Verification Checklist

- [ ] Google OAuth credentials created in Google Cloud Console
- [ ] Redirect URIs added correctly
- [ ] Environment variables set (run `./setup-permanent-env.sh`)
- [ ] Supabase restarted after setting env vars
- [ ] `.env.local` file exists with Supabase URL and anon key
- [ ] Supabase containers are running (`docker ps | grep supabase`)
- [ ] Next.js dev server is running (`npm run dev`)
- [ ] No errors in browser console
- [ ] Google OAuth button redirects to Google sign-in

## Quick Test

Run the diagnostic script:
```bash
./check-setup.sh
```

This will show you what's configured and what's missing.

