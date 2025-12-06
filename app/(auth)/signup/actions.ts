'use server'

import { createClient } from '@/lib/supabase/server'

/**
 * Server action to ensure user profile exists after signup
 * This is a fallback in case the database trigger fails
 */
export async function ensureProfile(userId: string, username: string) {
	const supabase = await createClient()
	const {
		data: { user },
	} = await supabase.auth.getUser()

	if (!user || user.id !== userId) {
		throw new Error('Not authenticated')
	}

	// Check if profile exists
	const { data: existingProfile } = await supabase
		.from('profiles')
		.select('id')
		.eq('id', userId)
		.single()

	if (existingProfile) {
		// Profile exists, update username if needed
		const { error: updateError } = await supabase
			.from('profiles')
			.update({ username })
			.eq('id', userId)

		if (updateError) {
			console.error('Error updating profile:', updateError)
			return { success: false, error: updateError.message }
		}

		return { success: true }
	}

	// Profile doesn't exist, create it
	const { error: insertError } = await supabase
		.from('profiles')
		.insert({
			id: userId,
			username: username,
		})

	if (insertError) {
		console.error('Error creating profile:', insertError)
		return { success: false, error: insertError.message }
	}

	return { success: true }
}

