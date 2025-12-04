# Google OAuth Setup Guide

This guide will walk you through setting up Google OAuth for your local development environment.

## Step 1: Create Google OAuth Credentials (YOU NEED TO DO THIS)

### 1.1 Go to Google Cloud Console
1. Visit [Google Cloud Console](https://console.cloud.google.com/)
2. Sign in with your Google account

### 1.2 Create or Select a Project
1. Click the project dropdown at the top
2. Click **"New Project"** (or select an existing one)
3. Enter project name: `Meme Generator` (or any name you prefer)
4. Click **"Create"**

### 1.3 Configure OAuth Consent Screen
1. In the left sidebar, go to **"APIs & Services"** → **"OAuth consent screen"**
2. Select **"External"** (unless you have a Google Workspace account)
3. Click **"Create"**
4. Fill in the required fields:
   - **App name**: `Meme Generator` (or your app name)
   - **User support email**: Your email
   - **Developer contact information**: Your email
5. Click **"Save and Continue"**
6. On the "Scopes" page, click **"Save and Continue"** (no scopes needed for basic auth)
7. On the "Test users" page, click **"Save and Continue"** (optional for testing)
8. Review and click **"Back to Dashboard"**

### 1.4 Create OAuth 2.0 Credentials
1. Go to **"APIs & Services"** → **"Credentials"**
2. Click **"+ CREATE CREDENTIALS"** → **"OAuth client ID"**
3. Select **"Web application"** as the application type
4. Give it a name: `Meme Generator Local Dev`
5. **Authorized redirect URIs** - Add these TWO URLs:
   ```
   http://localhost:54321/auth/v1/callback
   http://localhost:3000/auth/callback
   ```
6. Click **"Create"**
7. **IMPORTANT**: Copy the **Client ID** and **Client Secret** - you'll need these next!

## Step 2: Set Environment Variables

After you get your Client ID and Client Secret from Google, run these commands:

```bash
cd /Users/user/Documents/GitHub/testing/meme-generator-nextjs

# Set the environment variables (replace with your actual values)
export SUPABASE_AUTH_EXTERNAL_GOOGLE_CLIENT_ID="your-client-id-here.apps.googleusercontent.com"
export SUPABASE_AUTH_EXTERNAL_GOOGLE_SECRET="your-client-secret-here"

# Verify they're set
echo $SUPABASE_AUTH_EXTERNAL_GOOGLE_CLIENT_ID
echo $SUPABASE_AUTH_EXTERNAL_GOOGLE_SECRET
```

## Step 3: Restart Supabase

After setting the environment variables, restart Supabase:

```bash
supabase stop
supabase start
```

## Step 4: Test Google OAuth

1. Start your Next.js app: `npm run dev`
2. Go to `http://localhost:3000/login`
3. Click the **"Google"** button
4. You should be redirected to Google's sign-in page
5. After signing in, you should be redirected back to your app

## Troubleshooting

### OAuth not working?
1. **Check environment variables are set**: Run `supabase status` and verify the config shows your client ID
2. **Verify redirect URIs**: Make sure both URIs are added in Google Cloud Console exactly as shown
3. **Check Supabase logs**: `docker logs supabase_auth_meme-generator-nextjs`
4. **Restart Supabase**: `supabase stop && supabase start`

### "redirect_uri_mismatch" error?
- Make sure you added BOTH redirect URIs in Google Cloud Console
- Check for typos (no trailing slashes, exact match required)
- Wait a few minutes after adding URIs (Google may cache)

### Environment variables not persisting?
- Environment variables set with `export` only last for the current terminal session
- For permanent setup, add them to your shell profile (`~/.zshrc` or `~/.bashrc`)
- Or use a `.env` file (but Supabase CLI reads from shell environment)

## Notes

- The OAuth credentials are for **local development only**
- For production, you'll need to create separate credentials with production URLs
- Google OAuth is **completely free** for authentication purposes
- The redirect URI `http://localhost:54321/auth/v1/callback` is for Supabase's internal auth handler
- The redirect URI `http://localhost:3000/auth/callback` is for your Next.js app callback route

