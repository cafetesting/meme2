# GitHub OAuth Configuration Fix

## The Problem

The GitHub OAuth flow requires two different callback URLs:

1. **GitHub OAuth App** → Must point to **Supabase** callback URL
2. **Supabase Dashboard** → Must include your **application** callback URL

## Current Configuration

Based on your error URL, here's what needs to be configured:

- **Supabase Project URL**: `https://zwwaaoqtzhptbwzlrmdo.supabase.co`
- **Application Domain**: `https://meme-gen.cursorapp.fun`
- **GitHub Client ID**: `Ov23lit7j0jFduoUwUXh`

## Step-by-Step Fix

### 1. Fix GitHub OAuth App Settings

1. Go to: https://github.com/settings/developers/oauth-apps
2. Find your OAuth App (Client ID: `Ov23lit7j0jFduoUwUXh`)
3. Click on the app to edit it
4. Under **Authorization callback URL**, you should have:
   ```
   https://zwwaaoqtzhptbwzlrmdo.supabase.co/auth/v1/callback
   ```
   **NOT** `https://meme-gen.cursorapp.fun/auth/callback`
5. Click **Update application**

### 2. Fix Supabase Dashboard Settings

1. Go to: https://supabase.com/dashboard → Your Project → Authentication → URL Configuration
2. Under **Redirect URLs**, add:
   ```
   https://meme-gen.cursorapp.fun/auth/callback
   ```
3. Update **Site URL** to:
   ```
   https://meme-gen.cursorapp.fun
   ```
4. Click **Save**

### 3. Verify Environment Variables

Make sure your Supabase project has these environment variables set:

- `SUPABASE_AUTH_EXTERNAL_GITHUB_CLIENT_ID` = `Ov23lit7j0jFduoUwUXh`
- `SUPABASE_AUTH_EXTERNAL_GITHUB_SECRET` = (Your GitHub OAuth App Secret)

To set these:
1. Go to: Supabase Dashboard → Project Settings → Auth → External OAuth Providers
2. Find GitHub section
3. Enter Client ID and Secret
4. Save

## OAuth Flow Explanation

The correct flow is:

```
User clicks "Login with GitHub"
  ↓
Redirects to GitHub OAuth
  ↓
GitHub redirects to: https://zwwaaoqtzhptbwzlrmdo.supabase.co/auth/v1/callback
  ↓
Supabase processes authentication
  ↓
Supabase redirects to: https://meme-gen.cursorapp.fun/auth/callback
  ↓
Your app handles the callback and creates session
```

## Common Mistakes

❌ **Wrong**: Setting GitHub callback URL to `https://meme-gen.cursorapp.fun/auth/callback`
✅ **Correct**: Set GitHub callback URL to `https://zwwaaoqtzhptbwzlrmdo.supabase.co/auth/v1/callback`

❌ **Wrong**: Not adding application callback URL to Supabase redirect URLs
✅ **Correct**: Add `https://meme-gen.cursorapp.fun/auth/callback` to Supabase redirect URLs

## Testing

After making these changes:

1. Clear your browser cache
2. Try logging in with GitHub again
3. Check browser console for any errors
4. Verify you're redirected correctly

## Additional Notes

- The `redirectTo` parameter in your code (`${window.location.origin}/auth/callback`) is correct - this tells Supabase where to redirect after authentication
- GitHub OAuth App callback URL must match exactly (including protocol `https://`)
- Supabase redirect URLs support wildcards, but exact URLs are recommended for production


