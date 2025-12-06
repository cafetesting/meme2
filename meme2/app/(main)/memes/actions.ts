'use server'

import { createClient } from '@/lib/supabase/server'

export async function deleteMeme(
	memeImageUrl: string,
	memeId: string
) {
	const supabase = await createClient()
	const {
		data: { user },
	} = await supabase.auth.getUser()

	if (!user) {
		throw new Error('Not authenticated')
	}

	// Delete image from storage
	const fileName = memeImageUrl.split('/').pop()
	if (fileName) {
		await supabase.storage
			.from('meme-images')
			.remove([`${user.id}/${fileName}`])
	}

	// Delete meme (cascade will delete texts)
	await supabase.from('memes').delete().eq('id', memeId)
}

