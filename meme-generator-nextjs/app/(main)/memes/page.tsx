import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import Navbar from '@/components/ui/Navbar'
import Image from 'next/image'

export default async function MyMemesPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const { data: memes, error } = await supabase
    .from('memes')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching memes:', error)
  }

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-meme-bg p-8">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-3xl font-bold text-meme-accent mb-6">My Memes</h1>

          {!memes || memes.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-600 mb-4">You haven't created any memes yet.</p>
              <Link href="/create" className="btn btn-primary">
                Create Your First Meme
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {memes.map((meme) => (
                <Link
                  key={meme.id}
                  href={`/memes/${meme.id}`}
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
                        {new Date(meme.created_at).toLocaleDateString()}
                      </span>
                      <span
                        className={`px-2 py-1 rounded ${
                          meme.is_public
                            ? 'bg-green-100 text-green-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}
                      >
                        {meme.is_public ? 'Public' : 'Private'}
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  )
}

