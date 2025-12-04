import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import MemeEditor from '@/components/meme/MemeEditor'
import Navbar from '@/components/ui/Navbar'

export default async function CreatePage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const handleSave = async (formData: FormData) => {
    'use server'

    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      throw new Error('Not authenticated')
    }

    // Extract data from FormData
    const imageBlob = formData.get('image') as Blob
    const textsJson = formData.get('texts') as string
    const isPublic = formData.get('isPublic') === 'true'
    const title = formData.get('title') as string | null

    if (!imageBlob) {
      throw new Error('Image blob is required')
    }

    const texts = JSON.parse(textsJson || '[]')

    // Upload image to Supabase Storage
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

    // Save meme metadata
    const { data: meme, error: memeError } = await supabase
      .from('memes')
      .insert({
        user_id: user.id,
        title: title || null,
        image_url: publicUrl,
        is_public: isPublic,
      })
      .select()
      .single()

    if (memeError) {
      throw memeError
    }

    // Save text overlays
    if (texts.length > 0) {
      const textInserts = texts.map((text: any, index: number) => ({
        meme_id: meme.id,
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

    return meme.id
  }

  return (
    <>
      <Navbar />
      <MemeEditor onSave={handleSave} />
    </>
  )
}

