import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'

export default async function Home() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  return (
    <div className="min-h-screen bg-meme-bg flex flex-col items-center justify-center p-8">
      <div className="text-center max-w-2xl">
        <h1 className="text-5xl font-bold text-meme-accent mb-4">
          Meme Generator
        </h1>
        <p className="text-xl text-gray-700 mb-8">
          Create, save, and share your favorite memes
        </p>
        <div className="flex gap-4 justify-center">
          {user ? (
            <>
              <Link
                href="/create"
                className="btn btn-primary px-8 py-3 text-lg"
              >
                Create Meme
              </Link>
              <Link
                href="/memes"
                className="btn btn-secondary px-8 py-3 text-lg"
              >
                My Memes
              </Link>
              <Link
                href="/gallery"
                className="btn btn-secondary px-8 py-3 text-lg"
              >
                Gallery
              </Link>
            </>
          ) : (
            <>
              <Link
                href="/login"
                className="btn btn-primary px-8 py-3 text-lg"
              >
                Get Started
              </Link>
              <Link
                href="/gallery"
                className="btn btn-secondary px-8 py-3 text-lg"
              >
                Browse Gallery
              </Link>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

