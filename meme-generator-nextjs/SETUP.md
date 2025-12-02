# Quick Setup Guide

## Step 1: Install Dependencies

```bash
npm install
```

## Step 2: Install Supabase CLI

```bash
npm install -g supabase
```

## Step 3: Start Supabase Locally

```bash
cd meme-generator-nextjs
supabase start
```

**Important**: Copy the connection strings from the output. You'll need:
- API URL (usually `http://localhost:54321`)
- `anon` key
- `service_role` key

## Step 4: Create Environment File

Create `.env.local` in the project root:

```env
NEXT_PUBLIC_SUPABASE_URL=http://localhost:54321
NEXT_PUBLIC_SUPABASE_ANON_KEY=<paste-anon-key-here>
SUPABASE_SERVICE_ROLE_KEY=<paste-service-role-key-here>
```

## Step 5: Run Database Migrations

```bash
supabase db reset
```

This will:
- Create all tables (profiles, memes, meme_texts)
- Set up Row Level Security policies
- Create storage bucket and policies
- Set up profile creation trigger

## Step 6: Verify Storage Bucket

1. Open Supabase Studio: http://localhost:54323
2. Go to Storage
3. Verify `meme-images` bucket exists and is public

## Step 7: Start Development Server

```bash
npm run dev
```

Open http://localhost:3000

## Troubleshooting

### Storage bucket not found
Run the storage migration manually:
```bash
supabase db reset
```

Or create it via SQL in Supabase Studio:
```sql
INSERT INTO storage.buckets (id, name, public)
VALUES ('meme-images', 'meme-images', true);
```

### OAuth not working
1. Set up OAuth apps with Google/GitHub
2. Add credentials to `supabase/config.toml` or environment variables
3. Restart Supabase: `supabase stop && supabase start`

### Images not loading
- Check that storage bucket is public
- Verify storage policies are set correctly
- Check browser console for CORS errors

## Next Steps

1. Sign up for an account
2. Create your first meme
3. Save it and view in "My Memes"
4. Make it public to see it in the Gallery

