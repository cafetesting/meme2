# Meme Generator Next.js + Supabase Migration Plan

## Overview
Migrate the existing meme generator from vanilla HTML/JS to Next.js framework with Supabase backend integration. Add user authentication, save/load/edit memes functionality, and public/private sharing while preserving the existing UI design and color scheme.

## Project Structure

### New Next.js Project Structure
```
meme-generator-nextjs/
├── app/                          # Next.js App Router
│   ├── (auth)/                   # Auth routes group
│   │   ├── login/
│   │   └── signup/
│   ├── (main)/                   # Main app routes group
│   │   ├── create/              # Meme creation page
│   │   ├── memes/               # User's saved memes
│   │   │   └── [id]/            # Edit meme page
│   │   └── gallery/             # Public gallery
│   ├── api/                     # API routes
│   │   └── memes/
│   ├── layout.tsx
│   └── page.tsx                 # Home/landing page
├── components/
│   ├── meme/
│   │   ├── MemeCanvas.tsx
│   │   ├── TextBox.tsx
│   │   └── MemeEditor.tsx
│   ├── auth/
│   │   ├── LoginForm.tsx
│   │   └── SignupForm.tsx
│   └── ui/                      # Reusable UI components
├── lib/
│   ├── supabase/
│   │   ├── client.ts            # Supabase client
│   │   └── server.ts            # Server-side Supabase client
│   └── utils/
├── public/
│   └── templates/               # Template images
├── supabase/
│   ├── migrations/              # Database migrations
│   └── config.toml              # Supabase config
├── types/
│   └── database.ts              # TypeScript types
└── styles/
    └── globals.css              # Global styles (preserve existing colors)
```

## Database Schema Design

### Tables to Create

1. **profiles** (extends Supabase auth.users)
   - `id` (uuid, primary key, references auth.users)
   - `username` (text, unique)
   - `avatar_url` (text, nullable)
   - `created_at` (timestamp)
   - `updated_at` (timestamp)

2. **memes**
   - `id` (uuid, primary key)
   - `user_id` (uuid, foreign key to profiles)
   - `title` (text, nullable)
   - `image_url` (text) - Supabase Storage path
   - `is_public` (boolean, default false)
   - `created_at` (timestamp)
   - `updated_at` (timestamp)

3. **meme_texts**
   - `id` (uuid, primary key)
   - `meme_id` (uuid, foreign key to memes, on delete cascade)
   - `content` (text)
   - `x` (float)
   - `y` (float)
   - `width` (float)
   - `height` (float)
   - `font_size` (integer)
   - `font_family` (text, default 'Impact')
   - `color` (text, default '#ffffff')
   - `order` (integer) - display order
   - `created_at` (timestamp)

### Row Level Security (RLS) Policies

- **profiles**: Users can read all profiles, update own profile
- **memes**: Users can read own memes + public memes, create/update/delete own memes
- **meme_texts**: Users can read texts for memes they can access, create/update/delete texts for own memes

### Storage Buckets

- **meme-images**: Public read, authenticated write (users can upload, all can view)

## Implementation Steps

### Phase 1: Project Setup

1. **Initialize Next.js Project**
   - Create Next.js 14+ app with TypeScript
   - Configure App Router
   - Set up Tailwind CSS (or CSS modules) while preserving existing color scheme
   - Install dependencies: `@supabase/supabase-js`, `@supabase/ssr`

2. **Set Up Supabase Locally**
   - Install Supabase CLI globally: `npm install -g supabase`
   - Run `supabase init` in project root
   - Run `supabase start` to start local instance
   - Create `.env.local` with Supabase connection strings

3. **Create Database Schema**
   - Create migration files for profiles, memes, meme_texts tables
   - Set up RLS policies
   - Create storage bucket for meme images
   - Run migrations: `supabase db reset`

### Phase 2: Authentication Setup

4. **Configure Supabase Auth**
   - Set up email/password authentication
   - Configure OAuth providers (Google, GitHub) in Supabase config
   - Create Supabase client utilities (client-side and server-side)

5. **Build Auth Components**
   - Create `LoginForm.tsx` with email/password and OAuth buttons
   - Create `SignupForm.tsx`
   - Create auth layout wrapper
   - Add protected route middleware

### Phase 3: Core Meme Generator Migration

6. **Convert Meme Generator to React Components**
   - Migrate `MemeGenerator` class to React hooks
   - Create `MemeCanvas.tsx` component (preserve canvas logic)
   - Create `TextBox.tsx` component for text overlays
   - Create `MemeEditor.tsx` main component
   - Preserve existing UI styling and color scheme (#FFEE91, #F5C857, #E2852E, #ABE0F0)

7. **Migrate Template System**
   - Move template images to `public/templates/`
   - Create template loading component
   - Preserve template selection UI

### Phase 4: Save/Load Functionality

8. **Implement Save Meme Feature**
   - Convert canvas to blob/image
   - Upload image to Supabase Storage
   - Save meme metadata and texts to database
   - Add "Save" button to toolbar

9. **Implement Load/Edit Meme Feature**
   - Create "My Memes" page listing user's saved memes
   - Create edit page (`/memes/[id]`) to load and edit saved memes
   - Load image from Storage and restore text overlays
   - Update existing meme on save

10. **Implement Delete Meme Feature**
    - Add delete functionality with confirmation
    - Delete from database and Storage

### Phase 5: Public Gallery & Sharing

11. **Create Public Gallery**
    - Create `/gallery` page showing public memes
    - Add filtering and pagination
    - Display meme previews with author info

12. **Add Sharing Controls**
    - Add toggle for public/private when saving
    - Allow users to change visibility of existing memes

### Phase 6: UI Polish & Testing

13. **Preserve Existing Design**
    - Migrate CSS to Next.js compatible format
    - Ensure responsive design works
    - Maintain color scheme and visual style

14. **Add Navigation**
    - Create header/navbar with auth status
    - Add links to Create, My Memes, Gallery
    - Add user profile dropdown

15. **Testing & Refinement**
    - Test all CRUD operations
    - Test authentication flows
    - Test public/private sharing
    - Ensure mobile responsiveness

## Key Files to Create/Modify

### New Files
- `app/layout.tsx` - Root layout with Supabase provider
- `app/page.tsx` - Landing/home page
- `app/(main)/create/page.tsx` - Meme creation page
- `app/(main)/memes/page.tsx` - User's saved memes list
- `app/(main)/memes/[id]/page.tsx` - Edit meme page
- `app/(main)/gallery/page.tsx` - Public gallery
- `app/(auth)/login/page.tsx` - Login page
- `app/(auth)/signup/page.tsx` - Signup page
- `components/meme/MemeEditor.tsx` - Main meme editor component
- `components/meme/MemeCanvas.tsx` - Canvas component
- `lib/supabase/client.ts` - Client-side Supabase client
- `lib/supabase/server.ts` - Server-side Supabase client
- `supabase/migrations/001_initial_schema.sql` - Database schema

### Migrate/Adapt
- Convert `Meme/script.js` logic to React components
- Convert `Meme/styles.css` to CSS modules or Tailwind (preserve colors)
- Move `Meme/Asset/` images to `public/templates/`

## Environment Variables

```env
NEXT_PUBLIC_SUPABASE_URL=http://localhost:54321
NEXT_PUBLIC_SUPABASE_ANON_KEY=<local-anon-key>
SUPABASE_SERVICE_ROLE_KEY=<local-service-role-key>
```

## Dependencies to Install

```json
{
  "dependencies": {
    "next": "^14.0.0",
    "react": "^18.0.0",
    "react-dom": "^18.0.0",
    "@supabase/supabase-js": "^2.38.0",
    "@supabase/ssr": "^0.0.10"
  },
  "devDependencies": {
    "@types/node": "^20.0.0",
    "@types/react": "^18.0.0",
    "typescript": "^5.0.0"
  }
}
```

## User Requirements Summary

Based on user input:
- **Authentication**: Both email/password and OAuth providers
- **Meme Visibility**: Both private memes and optional public sharing
- **Edit Saved Memes**: Yes, users can load and edit saved memes
- **UI Design**: Preserve existing design and color scheme

## Success Criteria

- [ ] Meme generator functionality preserved (create, edit text, download)
- [ ] User authentication working (email/password + OAuth)
- [ ] Users can save memes to database
- [ ] Users can load and edit saved memes
- [ ] Users can delete their memes
- [ ] Public gallery displays public memes
- [ ] Users can toggle public/private visibility
- [ ] Existing UI design and colors preserved
- [ ] Responsive design maintained
- [ ] All features work with local Supabase instance

## Color Scheme (Preserve)

- Background: `#FFEE91`
- Sidebar: `#F5C857`
- Accent/Border: `#E2852E`
- Main Content Background: `#ABE0F0`
- Text: `#333`

## Notes

- Start with local Supabase development
- When ready for production, link local project to Supabase cloud project
- Use `supabase db push` to deploy schema changes to production
- Consider adding image optimization for uploaded memes
- May want to add thumbnail generation for gallery view

