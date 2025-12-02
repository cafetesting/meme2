import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import Navbar from '@/components/ui/Navbar'
import Image from 'next/image'

export default async function GalleryPage() {
  const supabase = await createClient()

  const { data: memes, error } = await supabase
    .from('memes')
    .select(`
      *,
      profiles:user_id (
        username
      )
    `)
    .eq('is_public', true)
    .order('created_at', { ascending: false })
    .limit(50)

  if (error) {
    console.error('Error fetching memes:', error)
  }

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-meme-bg p-8">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-3xl font-bold text-meme-accent mb-6">Public Gallery</h1>

          {!memes || memes.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-600">No public memes yet. Be the first to share!</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {memes.map((meme: any) => (
                <div
                  key={meme.id}
                  className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow"
                >
                  <div className="aspect-video relative bg-gray-100">
                    <Image
                      src={meme.image_url}
                      alt={meme.title || 'Meme'}
                      fill
                      className="object-contain"
                    />
                  </div>
                  <div className="p-4">
                    <h3 className="font-semibold text-gray-800 mb-2">
                      {meme.title || 'Untitled Meme'}
                    </h3>
                    <div className="flex items-center justify-between text-sm text-gray-500">
                      <span>
                        by {meme.profiles?.username || 'Anonymous'}
                      </span>
                      <span>
                        {new Date(meme.created_at).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  )
}

