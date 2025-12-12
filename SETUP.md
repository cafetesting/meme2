# Meme2 Setup Guide

Detailed setup instructions for the Meme2 meme generator project.

## Prerequisites

Before starting, ensure you have:

- Node.js 18+ installed
- npm or yarn package manager
- Docker Desktop installed and running
- Git installed
- A code editor (VS Code recommended)

## Step-by-Step Setup

### 1. Install Dependencies

```bash
cd meme2
npm install
```

This will install all required packages including Next.js, React, Supabase
clients, and TypeScript.

### 2. Install Supabase CLI

Install the Supabase CLI globally:

```bash
npm install -g supabase
```

Verify installation:

```bash
supabase --version
```

### 3. Initialize Supabase

Initialize Supabase in your project:

```bash
supabase init
```

This creates the `supabase/` directory with configuration files.

### 4. Start Local Supabase

Start the local Supabase instance:

```bash
supabase start
```

This will:
- Start PostgreSQL database
- Start Supabase API
- Start Supabase Studio (web interface)
- Generate connection strings

**Important**: Copy the connection strings shown in the output. You'll need
them for the next step.

### 5. Configure Environment Variables

Create `.env.local` file in the root directory:

```bash
cp .env.local.example .env.local
```

Edit `.env.local` and add your Supabase credentials:

```env
NEXT_PUBLIC_SUPABASE_URL=http://localhost:54321
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-from-supabase-start
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-from-supabase-start
```

Replace the placeholder values with the actual values from `supabase start`
output.

### 6. Run Database Migrations

Apply the database schema:

```bash
supabase db reset
```

This will:
- Create all tables (profiles, memes, meme_texts)
- Set up Row Level Security policies
- Create storage bucket policies
- Set up triggers for profile creation

### 7. Verify Storage Bucket

Access Supabase Studio at http://localhost:54323:

1. Navigate to Storage section
2. Verify `meme-images` bucket exists
3. Check that it's set to Public
4. Verify policies are in place

If the bucket doesn't exist, create it manually or run migration 002 again.

### 8. Add Template Images

Add your template images to `public/templates/`:

```bash
mkdir -p public/templates
# Copy your template images here
```

Supported formats: PNG, JPG, GIF, WEBP

### 9. Start Development Server

Start the Next.js development server:

```bash
npm run dev
```

The app will be available at http://localhost:3000

### 10. Test the Application

1. Open http://localhost:3000
2. Sign up for an account
3. Create a meme
4. Save and view your memes

## Production Deployment

### Option 1: Vercel (Recommended - Free)

1. **Push to GitHub**
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git remote add origin your-repo-url
   git push -u origin main
   ```

2. **Deploy to Vercel**
   - Go to https://vercel.com
   - Click "New Project"
   - Import your GitHub repository
   - Add environment variables:
     - `NEXT_PUBLIC_SUPABASE_URL`
     - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
     - `SUPABASE_SERVICE_ROLE_KEY`
   - Click "Deploy"

3. **Set Up Production Supabase**
   - Create project at https://supabase.com
   - Link local project:
     ```bash
     supabase link --project-ref your-project-ref
     ```
   - Push schema:
     ```bash
     supabase db push
     ```
   - Update Vercel environment variables with production Supabase URLs

**Cost**: $0/month (free tier)

### Option 2: Netlify (Free)

1. Push to GitHub (same as above)
2. Go to https://netlify.com
3. Click "Add new site" > "Import an existing project"
4. Connect GitHub repository
5. Add build settings:
   - Build command: `npm run build`
   - Publish directory: `.next`
6. Add environment variables
7. Deploy

**Cost**: $0/month (free tier)

### Option 3: Self-Hosted

For self-hosting, you'll need:

- VPS or server (DigitalOcean, AWS, etc.)
- Node.js 18+ installed
- PM2 or similar process manager
- Nginx or Apache for reverse proxy
- SSL certificate (Let's Encrypt)

**Cost**: Varies ($5-20/month for basic VPS)

## OAuth Configuration (Optional)

To enable Google/GitHub OAuth:

### Google OAuth

1. Go to Google Cloud Console
2. Create OAuth 2.0 credentials
3. Add authorized redirect URIs:
   - `http://localhost:54321/auth/v1/callback` (local)
   - `https://your-project.supabase.co/auth/v1/callback` (Supabase)
   - `https://meme-gen.cursorapp.fun/auth/callback` (production)
   - `https://staging-meme-gen.cursorapp.fun/auth/callback` (staging)
4. Set environment variables in Supabase:
   - `SUPABASE_AUTH_EXTERNAL_GOOGLE_CLIENT_ID`
   - `SUPABASE_AUTH_EXTERNAL_GOOGLE_SECRET`

### GitHub OAuth

1. Go to GitHub Settings > Developer settings > OAuth Apps
2. Create new OAuth App
3. Set Authorization callback URLs:
   - `http://localhost:54321/auth/v1/callback` (local)
   - `https://your-project.supabase.co/auth/v1/callback` (Supabase)
   - `https://meme-gen.cursorapp.fun/auth/callback` (production)
   - `https://staging-meme-gen.cursorapp.fun/auth/callback` (staging)
4. Set environment variables in Supabase:
   - `SUPABASE_AUTH_EXTERNAL_GITHUB_CLIENT_ID`
   - `SUPABASE_AUTH_EXTERNAL_GITHUB_SECRET`

### Domain Setup

For detailed instructions on setting up custom domains (`meme-gen.cursorapp.fun` and `staging.meme-gen.cursorapp.fun`), see [DOMAIN_SETUP.md](./DOMAIN_SETUP.md).

## Troubleshooting

### Supabase won't start

- Ensure Docker Desktop is running
- Check if ports 54321-54324 are available
- Try: `supabase stop` then `supabase start`

### Database connection errors

- Verify `.env.local` has correct values
- Check Supabase is running: `supabase status`
- Restart Supabase: `supabase stop && supabase start`

### Storage bucket errors

- Verify bucket exists in Supabase Studio
- Check bucket is set to Public
- Verify policies are applied (run migration 002)

### Build errors

- Clear `.next` directory: `rm -rf .next`
- Reinstall dependencies: `rm -rf node_modules && npm install`
- Check Node.js version: `node --version` (should be 18+)

## Additional Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [Supabase Documentation](https://supabase.com/docs)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)

## Support

For issues or questions:
1. Check the troubleshooting section above
2. Review Supabase logs: `supabase logs`
3. Check Next.js build output: `npm run build`

