# Fix Google OAuth 401: invalid_client Error

## Problem
Getting "Error 401: invalid_client" when trying to login with Google.

## Root Cause
This error typically means:
1. **Redirect URI mismatch** - The redirect URI in Google Cloud Console doesn't match what Supabase is using
2. **Supabase not reading environment variables** - Need to restart Supabase after setting env vars
3. **Incorrect Client ID/Secret** - Credentials might be wrong

## Solution Steps

### Step 1: Verify Redirect URI in Google Cloud Console

The redirect URI **MUST** be exactly:
```
http://localhost:54321/auth/v1/callback
```

**To check/fix:**
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Navigate to **APIs & Services** → **Credentials**
3. Click on your OAuth 2.0 Client ID
4. Under **Authorized redirect URIs**, make sure you have:
   ```
   http://localhost:54321/auth/v1/callback
   ```
5. **IMPORTANT**: It must be EXACTLY this - no trailing slashes, no typos
6. Click **Save**

### Step 2: Verify Environment Variables Are Set

Check if variables are set:
```bash
echo $SUPABASE_AUTH_EXTERNAL_GOOGLE_CLIENT_ID
echo $SUPABASE_AUTH_EXTERNAL_GOOGLE_SECRET
```

If they're not set, add them to `~/.zshrc`:
```bash
export SUPABASE_AUTH_EXTERNAL_GOOGLE_CLIENT_ID="your-client-id.apps.googleusercontent.com"
export SUPABASE_AUTH_EXTERNAL_GOOGLE_SECRET="your-client-secret"
```

Then reload:
```bash
source ~/.zshrc
```

### Step 3: Restart Supabase

Supabase needs to be restarted to pick up environment variables:

```bash
cd ~/Documents/GitHub/testing/meme-generator-nextjs
supabase stop
supabase start
```

Wait for all services to start, then verify:
```bash
supabase status
```

### Step 4: Verify Client ID Format

Your Client ID should look like:
```
123456789-abcdefghijklmnopqrstuvwxyz123456.apps.googleusercontent.com
```

Your Client Secret should look like:
```
GOCSPX-abcdefghijklmnopqrstuvwxyz123456
```

### Step 5: Test Again

1. Make sure Supabase is running: `supabase status`
2. Make sure Next.js is running: `npm run dev`
3. Go to: http://localhost:3000/login
4. Click "Sign in with Google"
5. Should redirect to Google login page

## Common Issues

### Issue 1: Redirect URI Not Matching
**Symptom:** 401 error immediately
**Fix:** Double-check the redirect URI in Google Cloud Console matches exactly: `http://localhost:54321/auth/v1/callback`

### Issue 2: Environment Variables Not Loaded
**Symptom:** Supabase shows warnings about unset variables
**Fix:** 
- Add to `~/.zshrc`
- Run `source ~/.zshrc`
- Restart Supabase

### Issue 3: Wrong Client ID/Secret
**Symptom:** 401 error
**Fix:** 
- Verify you copied the correct values from Google Cloud Console
- Make sure there are no extra spaces or quotes
- Check the Client ID ends with `.apps.googleusercontent.com`

### Issue 4: OAuth Consent Screen Not Configured
**Symptom:** Error about consent screen
**Fix:**
1. Go to Google Cloud Console
2. APIs & Services → OAuth consent screen
3. Complete the setup (even if it's in "Testing" mode)

## Quick Fix Checklist

- [ ] Redirect URI in Google Cloud Console is: `http://localhost:54321/auth/v1/callback`
- [ ] Environment variables are set: `echo $SUPABASE_AUTH_EXTERNAL_GOOGLE_CLIENT_ID`
- [ ] Supabase has been restarted after setting env vars: `supabase stop && supabase start`
- [ ] Client ID format is correct (ends with `.apps.googleusercontent.com`)
- [ ] OAuth consent screen is configured in Google Cloud Console

## Still Not Working?

1. **Check Supabase logs:**
   ```bash
   supabase logs
   ```

2. **Verify the exact redirect URI Supabase is using:**
   Check `supabase/config.toml` - should show:
   ```
   redirect_uri = "http://localhost:54321/auth/v1/callback"
   ```

3. **Try creating new OAuth credentials** in Google Cloud Console if the current ones aren't working

4. **Check browser console** for any additional error messages

