import { createClient } from '@/lib/supabase/server'
import { redirect, notFound } from 'next/navigation'
import MemeEditor from '@/components/meme/MemeEditor'
import Navbar from '@/components/ui/Navbar'
import DeleteMemeButton from '@/components/meme/DeleteMemeButton'
import { MemeText } from '@/types/database'

interface EditMemePageProps {
  params: {
    id: string
  }
}

export default async function EditMemePage({ params }: EditMemePageProps) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Fetch meme
  const { data: meme, error: memeError } = await supabase
    .from('memes')
    .select('*')
    .eq('id', params.id)
    .eq('user_id', user.id)
    .single()

  if (memeError || !meme) {
    notFound()
  }

  // Fetch texts
  const { data: texts, error: textsError } = await supabase
    .from('meme_texts')
    .select('*')
    .eq('meme_id', params.id)
    .order('order', { ascending: true })

  if (textsError) {
    console.error('Error fetching texts:', textsError)
  }

  const handleSave = async (
    imageBlob: Blob,
    texts: any[],
    isPublic: boolean,
    title?: string
  ) => {
    'use server'

    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      throw new Error('Not authenticated')
    }

    // Delete old image
    const oldFileName = meme.image_url.split('/').pop()
    if (oldFileName) {
      await supabase.storage.from('meme-images').remove([`${user.id}/${oldFileName}`])
    }

    // Upload new image
    const fileName = `${user.id}/${Date.now()}.png`
    const { error: uploadError } = await supabase.storage
      .from('meme-images')
      .upload(fileName, imageBlob, {
        contentType: 'image/png',
        upsert: false,
      })

    if (uploadError) {
      throw uploadError
    }

    // Get public URL
    const {
      data: { publicUrl },
    } = supabase.storage.from('meme-images').getPublicUrl(fileName)

    // Update meme metadata
    const { error: memeError } = await supabase
      .from('memes')
      .update({
        title: title || null,
        image_url: publicUrl,
        is_public: isPublic,
      })
      .eq('id', params.id)

    if (memeError) {
      throw memeError
    }

    // Delete old texts
    await supabase.from('meme_texts').delete().eq('meme_id', params.id)

    // Insert new texts
    if (texts.length > 0) {
      const textInserts = texts.map((text, index) => ({
        meme_id: params.id,
        content: text.content,
        x: text.x,
        y: text.y,
        width: text.width,
        height: text.height,
        font_size: text.font_size,
        font_family: text.font_family,
        color: text.color,
        order: index,
      }))

      const { error: textsError } = await supabase
        .from('meme_texts')
        .insert(textInserts)

      if (textsError) {
        throw textsError
      }
    }
  }

  const handleDelete = async () => {
    'use server'

    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      throw new Error('Not authenticated')
    }

    // Delete image from storage
    const fileName = meme.image_url.split('/').pop()
    if (fileName) {
      await supabase.storage.from('meme-images').remove([`${user.id}/${fileName}`])
    }

    // Delete meme (cascade will delete texts)
    await supabase.from('memes').delete().eq('id', params.id)
  }

  return (
    <>
      <Navbar />
      <div className="relative">
        <div className="absolute top-4 right-4 z-50">
          <DeleteMemeButton memeId={params.id} onDelete={handleDelete} />
        </div>
        <MemeEditor
          initialImage={meme.image_url}
          initialTexts={(texts as MemeText[]) || []}
          memeId={params.id}
          onSave={handleSave}
        />
      </div>
    </>
  )
}

