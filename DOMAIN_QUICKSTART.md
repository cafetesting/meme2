# Quick Start: Domain Setup Checklist

Follow these steps in order to set up your domains.

## ✅ DNS Configuration (Do this first)

In your DNS provider (where `cursorapp.fun` is managed):

1. Add CNAME record:
   ```
   Name: meme-gen
   Type: CNAME
   Value: cname.vercel-dns.com
   TTL: Auto (or 3600)
   ```

2. Add CNAME record:
   ```
   Name: staging.meme-gen (or just "staging" if your DNS supports subdomains)
   Type: CNAME  
   Value: cname.vercel-dns.com
   TTL: Auto (or 3600)
   ```

**Wait 5-10 minutes for DNS propagation before proceeding.**

## ✅ Vercel Configuration

### 1. Add Production Domain
- Go to: https://vercel.com/dashboard → Your Project → Settings → Domains
- Click **Add Domain**
- Enter: `meme-gen.cursorapp.fun`
- Click **Add**
- Wait for DNS verification (green checkmark)
- Click **Edit** → Set **Git Branch** to `main` → Save

### 2. Add Staging Domain  
- Still in Domains settings
- Click **Add Domain**
- Enter: `staging.meme-gen.cursorapp.fun`
- Click **Add**
- Wait for DNS verification (green checkmark)
- Click **Edit** → Set **Git Branch** to **All Branches** (or manually select branches)

## ✅ Supabase Configuration

1. Go to: Supabase Dashboard → Your Project → Authentication → URL Configuration
2. Add to **Redirect URLs**:
   ```
   https://meme-gen.cursorapp.fun/auth/callback
   https://staging-meme-gen.cursorapp.fun/auth/callback
   ```
3. Update **Site URL** to: `https://meme-gen.cursorapp.fun`
4. Click **Save**

## ✅ Google OAuth Configuration

1. Go to: https://console.cloud.google.com/ → APIs & Services → Credentials
2. Click your OAuth 2.0 Client ID
3. Under **Authorized redirect URIs**, click **+ ADD URI**
4. Add both:
   ```
   https://meme-gen.cursorapp.fun/auth/callback
   https://staging-meme-gen.cursorapp.fun/auth/callback
   ```
5. Click **Save**

## ✅ GitHub OAuth Configuration

1. Go to: https://github.com/settings/developers → OAuth Apps → Your App
2. Under **Authorization callback URL**, add:
   ```
   https://meme-gen.cursorapp.fun/auth/callback
   https://staging-meme-gen.cursorapp.fun/auth/callback
   ```
3. Click **Update application**

## ✅ Verification

Test each domain:

1. **Production**: 
   - Visit: https://meme-gen.cursorapp.fun
   - Should show main branch
   - Try logging in with OAuth

2. **Staging**:
   - Visit: https://staging-meme-gen.cursorapp.fun  
   - Should show your staging branch
   - Try logging in with OAuth

## 🐛 Troubleshooting

**Domain shows "Not configured" in Vercel:**
- Wait longer for DNS propagation (can take up to 48 hours)
- Verify CNAME records are correct
- Check: `dig meme-gen.cursorapp.fun` or `nslookup meme-gen.cursorapp.fun`

**OAuth redirect fails:**
- Double-check all redirect URLs are added to Supabase and OAuth providers
- Clear browser cache and try again
- Check browser console for errors

**Wrong branch showing:**
- Verify Git Branch assignment in Vercel domain settings
- Check that the branch has been deployed
- Try redeploying the branch

## 📝 Notes

- Preview deployments (PRs) will still get unique `*.vercel.app` URLs
- The staging domain will show the latest deployment from non-main branches
- Both domains use the same Supabase project (you can create separate projects if needed)
