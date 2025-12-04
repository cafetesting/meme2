# Meme Generator - Error Fixes Summary

This document summarizes the errors encountered during development and their solutions.

## Table of Contents
1. [Canvas Reference Error](#1-canvas-reference-error)
2. [Blob Serialization Error](#2-blob-serialization-error)
3. [Next.js Image Configuration Error](#3-nextjs-image-configuration-error)
4. [Server Action Function Serialization Error](#4-server-action-function-serialization-error)

---

## 1. Canvas Reference Error

### Error Message
```
ReferenceError: canvas is not defined
    at MemeEditor (./components/meme/MemeEditor.tsx:416:9)
```

### Location
`components/meme/MemeEditor.tsx` - Line 421 in `handleSave` useCallback dependency array

### Root Cause
The `handleSave` callback included `canvas` in its dependency array, but `canvas` was not a component-level variable. Instead, it was accessed via `canvasRef.current` inside the callback function.

### Why This Happens
- React's `useCallback` hook requires all dependencies to be actual variables in scope
- Refs (like `canvasRef`) are stable references that don't change between renders
- Including a non-existent variable in the dependency array causes React to try to access it during dependency checking, leading to a ReferenceError

### Solution
Removed `canvas` from the dependency array since refs don't need to be included:

```typescript
// Before
}, [canvas, image, texts, isPublic, title, onSave])

// After
}, [image, texts, isPublic, title, onSave])
```

### Files Changed
- `components/meme/MemeEditor.tsx`

---

## 2. Blob Serialization Error

### Error Message
```
Error: Only plain objects, and a few built-ins, can be passed to Server Actions. 
Classes or null prototypes are not supported.
```

### Location
`components/meme/MemeEditor.tsx` - Line 414 when calling `onSave(blob, ...)`

### Root Cause
Next.js Server Actions can only accept serializable data types. `Blob` objects are not directly serializable and cannot be passed as arguments to Server Actions.

### Why This Happens
- Server Actions serialize data to send it from client to server
- `Blob` is a browser API class that contains binary data
- Next.js serialization only supports: plain objects, arrays, primitives (string, number, boolean, null), and a few built-in types
- Classes and complex objects like `Blob` cannot be serialized

### Solution
Converted the Blob to `FormData`, which is a supported format for Server Actions:

```typescript
// Before - MemeEditor.tsx
await onSave(blob, texts, isPublic, title || undefined)

// After - MemeEditor.tsx
const formData = new FormData()
formData.append('image', blob, 'meme.png')
formData.append('texts', JSON.stringify(texts))
formData.append('isPublic', String(isPublic))
if (title) {
  formData.append('title', title)
}
await onSave(formData)
```

```typescript
// Before - Server Action signature
const handleSave = async (
  imageBlob: Blob,
  texts: any[],
  isPublic: boolean,
  title?: string
) => { ... }

// After - Server Action signature
const handleSave = async (formData: FormData) => {
  const imageBlob = formData.get('image') as Blob
  const textsJson = formData.get('texts') as string
  const isPublic = formData.get('isPublic') === 'true'
  const title = formData.get('title') as string | null
  const texts = JSON.parse(textsJson || '[]')
  // ... rest of the logic
}
```

### Files Changed
- `components/meme/MemeEditor.tsx`
- `app/(main)/create/page.tsx`
- `app/(main)/memes/[id]/page.tsx`

---

## 3. Next.js Image Configuration Error

### Error Message
```
Error: Invalid src prop (http://127.0.0.1:54321/storage/v1/object/public/meme-images/...)
on `next/image`, hostname "127.0.0.1" is not configured under images in your `next.config.js`
```

### Location
`app/(main)/memes/page.tsx` - When rendering meme images using Next.js `Image` component

### Root Cause
Next.js `Image` component requires explicit configuration of allowed image hostnames for security reasons. The Supabase Storage URLs use `127.0.0.1` (localhost IP), which wasn't configured.

### Why This Happens
- Next.js Image Optimization requires explicit hostname allowlisting to prevent unauthorized image loading
- This is a security feature to prevent SSRF (Server-Side Request Forgery) attacks
- Even localhost addresses need to be explicitly allowed
- The config had `localhost` but not `127.0.0.1` (they're technically different hostnames)

### Solution
Updated `next.config.js` to use `remotePatterns` (modern approach) and added both `localhost` and `127.0.0.1`:

```javascript
// Before
const nextConfig = {
  images: {
    domains: ['localhost'],
  },
}

// After
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'http',
        hostname: 'localhost',
      },
      {
        protocol: 'http',
        hostname: '127.0.0.1',
      },
    ],
  },
}
```

**Note:** After changing `next.config.js`, you must restart the Next.js dev server for changes to take effect.

### Files Changed
- `next.config.js`

---

## 4. Server Action Function Serialization Error

### Error Message
```
Error: Functions cannot be passed directly to Client Components unless you explicitly 
expose it by marking it with "use server". Or maybe you meant to call this function 
rather than return it.
[function split, ...]
```

### Location
`app/(main)/memes/[id]/page.tsx` - When passing `handleDelete` to `DeleteMemeButton` component

### Root Cause
A Server Action function was defined inline in a Server Component and captured server-side variables (`meme` and `params`). When passed to a Client Component, Next.js tried to serialize the function, but it contained references to server-side data that couldn't be serialized.

### Why This Happens
- Server Actions can be passed to Client Components, but they must be serializable
- Functions that capture variables from their closure (like `meme` and `params`) cannot be serialized
- The `split` function reference in the error comes from `meme.image_url.split('/')` inside the closure
- Next.js needs to serialize the function to send it from server to client, but closures with server-side data break this

### Solution
Moved the Server Action to a separate file and passed primitive values (strings) as props instead:

**Step 1:** Created a standalone server action file:
```typescript
// app/(main)/memes/actions.ts
'use server'

import { createClient } from '@/lib/supabase/server'

export async function deleteMeme(memeImageUrl: string, memeId: string) {
  // ... implementation using only the passed parameters
}
```

**Step 2:** Updated the Client Component to import and call the action directly:
```typescript
// components/meme/DeleteMemeButton.tsx
'use client'

import { deleteMeme } from '@/app/(main)/memes/actions'

interface DeleteMemeButtonProps {
  memeId: string
  imageUrl: string  // Changed from onDelete function
}

export default function DeleteMemeButton({ memeId, imageUrl }: DeleteMemeButtonProps) {
  const handleDelete = async () => {
    await deleteMeme(imageUrl, memeId)  // Call server action directly
    // ...
  }
}
```

**Step 3:** Updated the Server Component to pass primitive values:
```typescript
// app/(main)/memes/[id]/page.tsx
<DeleteMemeButton 
  memeId={params.id}
  imageUrl={meme.image_url}  // Pass string values, not functions
/>
```

### Files Changed
- `app/(main)/memes/actions.ts` (new file)
- `components/meme/DeleteMemeButton.tsx`
- `app/(main)/memes/[id]/page.tsx`

---

## Key Takeaways

### Best Practices Learned

1. **Refs in Dependency Arrays**: Never include refs (like `canvasRef.current`) in dependency arrays. Refs are stable and don't need to be dependencies.

2. **Server Action Serialization**: 
   - Use `FormData` for binary data (like images)
   - Keep Server Actions in separate files when they need to be called from Client Components
   - Pass primitive values (strings, numbers) as props, not functions with closures

3. **Next.js Image Configuration**: 
   - Always configure `remotePatterns` for external image sources
   - Include both `localhost` and `127.0.0.1` for local development
   - Restart dev server after changing `next.config.js`

4. **Server/Client Component Boundaries**:
   - Server Components can't pass functions with closures to Client Components
   - Extract Server Actions to separate files
   - Pass data, not functions, when crossing the server/client boundary

### Common Patterns

- **For binary data**: Use `FormData` instead of `Blob`
- **For Server Actions**: Keep them in separate `actions.ts` files
- **For image sources**: Configure `remotePatterns` in `next.config.js`
- **For refs**: Access via `.current`, don't include in dependencies

---

## Related Documentation

- [Next.js Server Actions](https://nextjs.org/docs/app/building-your-application/data-fetching/server-actions-and-mutations)
- [Next.js Image Optimization](https://nextjs.org/docs/app/api-reference/components/image)
- [React useCallback Hook](https://react.dev/reference/react/useCallback)
- [FormData API](https://developer.mozilla.org/en-US/docs/Web/API/FormData)

