import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
	const requestUrl = new URL(request.url)
	const code = requestUrl.searchParams.get('code')
	const error = requestUrl.searchParams.get('error')
	const errorDescription =
		requestUrl.searchParams.get('error_description')
	const origin = requestUrl.origin

	// Handle OAuth errors
	if (error) {
		console.error('OAuth error:', error, errorDescription)
		return NextResponse.redirect(
			`${origin}/login?error=${encodeURIComponent(
				errorDescription || error
			)}`
		)
	}

	// Handle missing code
	if (!code) {
		console.error('OAuth callback missing code parameter')
		return NextResponse.redirect(
			`${origin}/login?error=${encodeURIComponent(
				'Authentication failed. Please try again.'
			)}`
		)
	}

	try {
		const supabase = await createClient()
		const { error: exchangeError } =
			await supabase.auth.exchangeCodeForSession(code)

		if (exchangeError) {
			console.error(
				'Error exchanging code for session:',
				exchangeError
			)
			return NextResponse.redirect(
				`${origin}/login?error=${encodeURIComponent(
					exchangeError.message || 'Authentication failed'
				)}`
			)
		}

		// Success - redirect to create page
		return NextResponse.redirect(`${origin}/create`)
	} catch (error) {
		console.error('Unexpected error in OAuth callback:', error)
		return NextResponse.redirect(
			`${origin}/login?error=${encodeURIComponent(
				'An unexpected error occurred. Please try again.'
			)}`
		)
	}
}

