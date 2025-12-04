# Meme Generator - Next.js + Supabase

A full-stack meme generator application built with Next.js and Supabase, allowing users to create, save, and share memes.

## Features

- 🎨 Create memes with text overlays
- 💾 Save memes to cloud storage
- 👤 User authentication (Email/Password + OAuth)
- 🔒 Private and public meme sharing
- 📱 Responsive design
- 🎯 Edit saved memes

## Prerequisites

- Node.js 18+ and npm
- Docker Desktop (for local Supabase)
- Supabase CLI

## Setup Instructions

### 1. Install Dependencies

```bash
npm install
```

### 2. Install Supabase CLI

```bash
npm install -g supabase
```

### 3. Initialize Supabase Locally

```bash
supabase init
supabase start
```

After running `supabase start`, you'll see connection strings. Copy them to create `.env.local`:

```bash
cp .env.local.example .env.local
```

Then update `.env.local` with the values from `supabase start` output:
- `NEXT_PUBLIC_SUPABASE_URL` (usually `http://localhost:54321`)
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`

### 4. Set Up Database Schema

The migrations are already created. Run them:

```bash
supabase db reset
```

### 5. Create Storage Bucket

Access Supabase Studio at http://localhost:54323, then:

1. Go to Storage
2. Create a new bucket named `meme-images`
3. Set it to **Public** (for reading)
4. Set policies:
   - **Insert**: Authenticated users can upload
   - **Select**: Public can read
   - **Update**: Users can update their own files
   - **Delete**: Users can delete their own files

Or use the SQL editor:

```sql
-- Create bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('meme-images', 'meme-images', true);

-- Policy: Anyone can view images
CREATE POLICY "Public Access"
ON storage.objects FOR SELECT
USING (bucket_id = 'meme-images');

-- Policy: Authenticated users can upload
CREATE POLICY "Authenticated users can upload"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'meme-images' AND
  auth.role() = 'authenticated'
);

-- Policy: Users can update their own files
CREATE POLICY "Users can update own files"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'meme-images' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

-- Policy: Users can delete their own files
CREATE POLICY "Users can delete own files"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'meme-images' AND
  auth.uid()::text = (storage.foldername(name))[1]
);
```

### 6. Configure OAuth (Optional)

For OAuth providers (Google, GitHub), see the detailed guide:

**Quick Setup:**
```bash
./setup-google-oauth.sh
```

**Detailed Guide:** See [GOOGLE_OAUTH_SETUP.md](./GOOGLE_OAUTH_SETUP.md)

The setup involves:
1. Creating OAuth credentials in Google Cloud Console (you need to do this)
2. Setting environment variables for Supabase
3. Restarting Supabase to apply changes

### 7. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the app.

## Project Structure

```
meme-generator-nextjs/
├── app/                    # Next.js App Router pages
│   ├── (auth)/            # Authentication routes
│   ├── (main)/            # Main app routes
│   └── api/               # API routes
├── components/            # React components
│   ├── meme/             # Meme editor components
│   ├── auth/             # Auth components
│   └── ui/               # UI components
├── lib/                   # Utilities
│   └── supabase/         # Supabase clients
├── supabase/              # Supabase config
│   └── migrations/       # Database migrations
├── public/                # Static files
│   └── templates/        # Template images
└── types/                 # TypeScript types
```

## Environment Variables

Create `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=http://localhost:54321
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

## Database Schema

- **profiles**: User profiles extending auth.users
- **memes**: Meme metadata
- **meme_texts**: Text overlay data for each meme

See `supabase/migrations/001_initial_schema.sql` for details.

## Deployment

### Deploy to Production

1. Create a Supabase project at https://supabase.com
2. Link your local project:
   ```bash
   supabase link --project-ref your-project-ref
   ```
3. Push database schema:
   ```bash
   supabase db push
   ```
4. Update environment variables with production Supabase credentials
5. Deploy Next.js app to Vercel/Netlify/etc.

## Development Commands

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm start` - Start production server
- `supabase start` - Start local Supabase
- `supabase stop` - Stop local Supabase
- `supabase status` - Check Supabase status
- `supabase db reset` - Reset database

## Color Scheme

The app uses a custom color palette:
- Background: `#FFEE91`
- Sidebar: `#F5C857`
- Accent: `#E2852E`
- Content Background: `#ABE0F0`

## License

MIT

