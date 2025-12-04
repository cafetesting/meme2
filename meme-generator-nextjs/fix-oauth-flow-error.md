# Fixing GeneralOAuthFlow Error

## Issue Fixed

The "flowName: GeneralOAuthFlow" error typically occurs when:
1. OAuth credentials are not properly configured
2. Supabase hasn't been restarted after setting environment variables
3. OAuth flow parameters need to be specified

## What I Fixed

### 1. ✅ Killed processes on ports 3000 and 3001
- Ports are now free for your Next.js app

### 2. ✅ Updated OAuth flow configuration
- Added `queryParams` to OAuth options in both LoginForm and SignupForm
- This helps with Google OAuth consent flow

## Next Steps to Complete the Fix

### Step 1: Reload Environment Variables

Since you just updated your Google OAuth credentials, make sure they're loaded:

```bash
# Reload your shell configuration
source ~/.zshrc

# Verify they're set
echo $SUPABASE_AUTH_EXTERNAL_GOOGLE_CLIENT_ID
echo $SUPABASE_AUTH_EXTERNAL_GOOGLE_SECRET
```

### Step 2: Restart Supabase

**Important:** Supabase needs to be restarted to pick up the new environment variables.

```bash
cd /Users/user/Documents/GitHub/testing/meme-generator-nextjs

# If Supabase CLI is available:
/opt/homebrew/bin/supabase stop
/opt/homebrew/bin/supabase start

# OR restart Docker containers directly:
docker restart supabase_auth_meme-generator-nextjs supabase_kong_meme-generator-nextjs
```

### Step 3: Verify Supabase Configuration

Check that Supabase can see your Google OAuth credentials:

```bash
# Check Supabase auth logs
docker logs supabase_auth_meme-generator-nextjs 2>&1 | tail -30 | grep -i "google\|oauth" || echo "No Google/OAuth logs found"
```

### Step 4: Start Next.js on Port 3000

Now that ports 3000 and 3001 are free:

```bash
cd /Users/user/Documents/GitHub/testing/meme-generator-nextjs
npm run dev
```

This should start on `http://localhost:3000` (or 3001 if 3000 is still in use).

### Step 5: Test Google OAuth

1. Go to `http://localhost:3000/login` (or whatever port Next.js uses)
2. Click the "Google" button
3. Should redirect to Google sign-in
4. After signing in, should redirect back to `/create`

## If Error Persists

### Check Browser Console
- Open browser DevTools (F12)
- Check Console tab for specific error messages
- Check Network tab to see if OAuth requests are failing

### Check Supabase Logs
```bash
docker logs supabase_auth_meme-generator-nextjs 2>&1 | tail -50
```

### Verify Google Cloud Console Settings
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Check OAuth 2.0 credentials
3. Verify redirect URIs are correct:
   - `http://localhost:54321/auth/v1/callback`
   - `http://localhost:3000/auth/callback` (or your actual port)

### Common Issues

**Issue:** "redirect_uri_mismatch"
- **Fix:** Make sure both redirect URIs are added in Google Cloud Console
- Wait a few minutes after adding (Google caches redirect URIs)

**Issue:** "OAuth provider not enabled"
- **Fix:** Restart Supabase after setting environment variables
- Verify env vars are set: `env | grep SUPABASE_AUTH_EXTERNAL_GOOGLE`

**Issue:** "GeneralOAuthFlow" error persists
- **Fix:** 
  1. Double-check Client ID and Secret are correct
  2. Restart Supabase completely
  3. Clear browser cache and cookies
  4. Try in incognito/private window

## Quick Verification Script

Run this to check everything:

```bash
cd /Users/user/Documents/GitHub/testing/meme-generator-nextjs
./check-setup.sh
```

## Summary

✅ Ports 3000 and 3001 are now free
✅ OAuth flow configuration updated
⏳ **You need to:**
   1. Reload environment variables (`source ~/.zshrc`)
   2. Restart Supabase
   3. Start Next.js dev server
   4. Test Google OAuth

