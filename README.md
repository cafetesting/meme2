# Meme2 - Meme Generator

The production version of the meme generator - a production-ready full-stack
meme generator application built with Next.js and Supabase, allowing users to
create, save, and share memes.

## Features

- Create memes with text overlays
- Save memes to cloud storage
- User authentication (Email/Password + OAuth)
- Private and public meme sharing
- Responsive design
- Edit saved memes

## Prerequisites

- Node.js 18+ and npm
- Docker Desktop (for local Supabase)
- Supabase CLI

## Quick Start

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

After running `supabase start`, copy the connection strings and create
`.env.local`:

```bash
cp .env.local.example .env.local
```

Update `.env.local` with values from `supabase start` output:
- `NEXT_PUBLIC_SUPABASE_URL` (usually `http://localhost:54321`)
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`

### 4. Set Up Database Schema

Run migrations:

```bash
supabase db reset
```

### 5. Create Storage Bucket

Access Supabase Studio at http://localhost:54323, then:

1. Go to Storage
2. Create a new bucket named `meme-images`
3. Set it to **Public** (for reading)
4. Set policies (or use the SQL from migration 002)

### 6. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the app.

## Project Structure

```
meme2/
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

### Recommended: Vercel (Free Tier)

1. Push your code to GitHub
2. Import project in Vercel
3. Add environment variables
4. Deploy

**Cost**: $0/month (hobby plan)

### Alternative: Netlify (Free Tier)

1. Push your code to GitHub
2. Import project in Netlify
3. Add environment variables
4. Deploy

**Cost**: $0/month (starter plan)

### Supabase Setup for Production

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
5. Configure OAuth providers in Supabase dashboard

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
