# Google OAuth Setup - Errors & Best Practices

## Summary of Errors Encountered

### Error 1: Google OAuth Not Working on Localhost
**Symptom:** Clicking "Google" button on login page doesn't work or shows errors

**Root Causes:**
- Missing Google OAuth credentials (Client ID and Secret)
- Environment variables not set for Supabase
- Supabase not restarted after setting credentials
- Missing redirect URIs in Google Cloud Console

**Solution:**
1. Create OAuth credentials in Google Cloud Console
2. Set permanent environment variables using `setup-permanent-env.sh`
3. Restart Supabase to pick up new credentials
4. Verify redirect URIs are configured correctly

---

### Error 2: "flowName: GeneralOAuthFlow" Error
**Symptom:** Error message appears when attempting Google OAuth login

**Root Causes:**
- OAuth flow parameters not specified in code
- Supabase configuration incomplete
- Missing query parameters for Google consent flow

**Solution:**
- Added `queryParams` to OAuth options:
  ```typescript
  options: {
    redirectTo: `${window.location.origin}/auth/callback`,
    queryParams: {
      access_type: 'offline',
      prompt: 'consent',
    },
  }
  ```
- Restart Supabase after configuration changes

---

### Error 3: Port Conflicts (3000, 3001)
**Symptom:** Next.js can't start on default ports, forced to use port 3002

**Root Causes:**
- Multiple Next.js dev servers running simultaneously
- Previous processes not properly terminated

**Solution:**
- Created `kill-ports.sh` script to free up ports
- Always check for running processes before starting dev server
- Use `lsof -i:3000` to check port usage

---

### Error 4: Frontend Setup Issues
**Symptom:** Frontend can't connect to Supabase

**Root Causes:**
- Missing `.env.local` file
- Incorrect environment variable names
- Supabase not running

**Solution:**
- Ensure `.env.local` exists with:
  ```
  NEXT_PUBLIC_SUPABASE_URL=http://127.0.0.1:54321
  NEXT_PUBLIC_SUPABASE_ANON_KEY=<your-anon-key>
  ```
- Verify Supabase containers are running
- Check browser console for connection errors

---

## Best Practices

### 1. Environment Variables Management

**✅ DO:**
- Use permanent environment variables for development credentials
- Store in `~/.zshrc` (or `~/.bashrc`) for persistence
- Use `.env.local` for Next.js-specific variables (never commit to git)
- Reload shell config after adding variables: `source ~/.zshrc`
- Verify variables are set: `echo $VARIABLE_NAME`

**❌ DON'T:**
- Hardcode credentials in code
- Commit `.env.local` to git (already in `.gitignore`)
- Use temporary `export` commands for long-term development
- Mix production and development credentials

**Example:**
```bash
# Permanent setup (recommended)
./setup-permanent-env.sh

# Verify
source ~/.zshrc
echo $SUPABASE_AUTH_EXTERNAL_GOOGLE_CLIENT_ID
```

---

### 2. Google OAuth Configuration

**✅ DO:**
- Create separate OAuth credentials for development and production
- Use descriptive names: "Meme Generator Local Dev" vs "Meme Generator Production"
- Add ALL required redirect URIs:
  - `http://localhost:54321/auth/v1/callback` (Supabase internal)
  - `http://localhost:3000/auth/callback` (Your app callback)
- Wait 2-5 minutes after adding redirect URIs (Google caches them)
- Keep Client Secret secure (never expose in frontend code)

**❌ DON'T:**
- Use production credentials for local development
- Forget to add both redirect URIs
- Share Client Secret publicly
- Skip OAuth consent screen configuration

**Redirect URI Checklist:**
```
✅ http://localhost:54321/auth/v1/callback
✅ http://localhost:3000/auth/callback
✅ https://yourdomain.com/auth/callback (for production)
```

---

### 3. Supabase OAuth Setup

**✅ DO:**
- Restart Supabase after setting environment variables
- Check Supabase logs for OAuth errors: `docker logs supabase_auth_meme-generator-nextjs`
- Verify `supabase/config.toml` has Google OAuth enabled
- Use environment variable substitution: `env(SUPABASE_AUTH_EXTERNAL_GOOGLE_CLIENT_ID)`
- Test OAuth flow in incognito window to avoid cache issues

**❌ DON'T:**
- Hardcode credentials in `config.toml`
- Skip restarting Supabase after credential changes
- Ignore Supabase logs when debugging

**Restart Process:**
```bash
# Method 1: Using Supabase CLI
supabase stop
supabase start

# Method 2: Using Docker directly
docker restart supabase_auth_meme-generator-nextjs supabase_kong_meme-generator-nextjs
```

---

### 4. OAuth Flow Implementation

**✅ DO:**
- Use PKCE flow (default in modern Supabase)
- Include proper query parameters for Google:
  ```typescript
  queryParams: {
    access_type: 'offline',
    prompt: 'consent',
  }
  ```
- Handle OAuth errors gracefully in callback route
- Show user-friendly error messages
- Log errors server-side for debugging

**❌ DON'T:**
- Skip error handling in OAuth callback
- Use deprecated OAuth flows
- Expose sensitive error details to users

**Example Implementation:**
```typescript
const { error } = await supabase.auth.signInWithOAuth({
  provider: 'google',
  options: {
    redirectTo: `${window.location.origin}/auth/callback`,
    queryParams: {
      access_type: 'offline',
      prompt: 'consent',
    },
  },
})
```

---

### 5. Port Management

**✅ DO:**
- Check for port conflicts before starting dev server
- Use `kill-ports.sh` script to free up ports
- Document which ports your services use
- Use consistent ports for development (3000 for Next.js, 54321 for Supabase)

**❌ DON'T:**
- Force kill processes without checking what they are
- Run multiple dev servers on same port
- Ignore port conflicts

**Port Management Script:**
```bash
# Check what's using a port
lsof -i:3000

# Kill process on specific port
lsof -ti:3000 | xargs kill -9

# Or use the helper script
./kill-ports.sh
```

---

### 6. Debugging OAuth Issues

**✅ DO:**
- Check browser console for client-side errors
- Check Supabase auth logs: `docker logs supabase_auth_meme-generator-nextjs`
- Verify environment variables are loaded: `env | grep SUPABASE`
- Test in incognito/private window
- Use browser DevTools Network tab to inspect OAuth requests
- Verify redirect URIs match exactly (no trailing slashes)

**❌ DON'T:**
- Ignore error messages
- Skip checking logs
- Assume credentials are correct without verifying

**Debugging Checklist:**
```
□ Browser console shows no errors
□ Network tab shows successful OAuth redirect
□ Supabase logs show OAuth attempt
□ Environment variables are set
□ Redirect URIs match exactly
□ Supabase is running and restarted
□ Google Cloud Console credentials are correct
```

---

### 7. Security Best Practices

**✅ DO:**
- Store credentials as environment variables
- Use different credentials for dev/prod
- Never commit secrets to git
- Rotate credentials if exposed
- Use `.gitignore` for `.env.local`
- Limit OAuth scopes to minimum required

**❌ DON'T:**
- Commit `.env.local` or credentials to git
- Share Client Secret in code or documentation
- Use same credentials across environments
- Grant unnecessary OAuth scopes

**Security Checklist:**
```
□ .env.local is in .gitignore
□ No credentials in code
□ Different credentials for dev/prod
□ Client Secret never exposed to frontend
□ OAuth scopes are minimal
```

---

## Quick Reference

### Setup Commands
```bash
# 1. Set up permanent environment variables
cd /Users/user/Documents/GitHub/testing/meme-generator-nextjs
./setup-permanent-env.sh

# 2. Reload shell configuration
source ~/.zshrc

# 3. Restart Supabase
supabase stop && supabase start

# 4. Start Next.js dev server
npm run dev

# 5. Verify setup
./check-setup.sh
```

### Verification Commands
```bash
# Check environment variables
echo $SUPABASE_AUTH_EXTERNAL_GOOGLE_CLIENT_ID
echo $SUPABASE_AUTH_EXTERNAL_GOOGLE_SECRET

# Check Supabase status
supabase status
# OR
docker ps | grep supabase

# Check port usage
lsof -i:3000 -i:3001

# Check Supabase logs
docker logs supabase_auth_meme-generator-nextjs | tail -50
```

### Common Error Solutions

| Error | Quick Fix |
|-------|-----------|
| `redirect_uri_mismatch` | Add redirect URI in Google Cloud Console, wait 2-5 min |
| `GeneralOAuthFlow` | Restart Supabase, verify env vars, check OAuth config |
| `OAuth provider not enabled` | Check `config.toml`, restart Supabase |
| Port already in use | Run `./kill-ports.sh` or `lsof -ti:PORT | xargs kill -9` |
| Frontend can't connect | Check `.env.local`, verify Supabase is running |

---

## File Locations

- **Environment Variables:** `~/.zshrc` (permanent)
- **Next.js Config:** `.env.local` (project root)
- **Supabase Config:** `supabase/config.toml`
- **OAuth Components:** 
  - `components/auth/LoginForm.tsx`
  - `components/auth/SignupForm.tsx`
- **Callback Route:** `app/auth/callback/route.ts`
- **Helper Scripts:**
  - `setup-permanent-env.sh` - Set up permanent env vars
  - `kill-ports.sh` - Free up ports
  - `check-setup.sh` - Diagnostic script

---

## Lessons Learned

1. **Always restart Supabase after credential changes** - Environment variables are only loaded at startup
2. **Both redirect URIs are required** - One for Supabase, one for your app
3. **Google caches redirect URIs** - Wait a few minutes after adding new ones
4. **Use permanent environment variables** - Saves time and prevents errors
5. **Check logs first** - Supabase and browser logs reveal most issues
6. **Test in incognito** - Avoids browser cache issues
7. **Port conflicts are common** - Always check before starting dev server

---

## Additional Resources

- [Google OAuth Setup Guide](./GOOGLE_OAUTH_SETUP.md) - Detailed setup instructions
- [Supabase Auth Documentation](https://supabase.com/docs/guides/auth)
- [Google OAuth 2.0 Documentation](https://developers.google.com/identity/protocols/oauth2)

---

**Last Updated:** 2024-12-03
**Project:** Meme Generator Next.js + Supabase

