'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

export default function SignupForm() {
	const [email, setEmail] = useState('')
	const [password, setPassword] = useState('')
	const [username, setUsername] = useState('')
	const [loading, setLoading] = useState(false)
	const [error, setError] = useState<string | null>(null)
	const router = useRouter()
	const supabase = createClient()

	async function handleSignup(e: React.FormEvent) {
		e.preventDefault()
		setLoading(true)
		setError(null)

		const { data, error: signUpError } =
			await supabase.auth.signUp({
				email,
				password,
			})

		if (signUpError) {
			setError(signUpError.message)
			setLoading(false)
			return
		}

		if (data.user) {
			// Create profile
			const { error: profileError } = await supabase
				.from('profiles')
				.insert({
					id: data.user.id,
					username: username || null,
				})

			if (profileError) {
				setError(profileError.message)
				setLoading(false)
			} else {
				router.push('/create')
				router.refresh()
			}
		}
	}

	async function handleOAuthSignup(provider: 'google' | 'github') {
		setLoading(true)
		setError(null)

		const { error } = await supabase.auth.signInWithOAuth({
			provider,
			options: {
				redirectTo: `${window.location.origin}/auth/callback`,
				queryParams: {
					access_type: 'offline',
					prompt: 'consent',
				},
			},
		})

		if (error) {
			setError(error.message)
			setLoading(false)
		}
	}

	return (
		<div className="w-full max-w-md mx-auto">
			<form onSubmit={handleSignup} className="space-y-4">
				{error && (
					<div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
						{error}
					</div>
				)}

				<div>
					<label
						htmlFor="username"
						className="block text-sm font-medium mb-2"
					>
						Username (optional)
					</label>
					<input
						id="username"
						type="text"
						value={username}
						onChange={(e) => setUsername(e.target.value)}
						className="w-full px-4 py-2 border border-meme-accent rounded-lg focus:outline-none focus:ring-2 focus:ring-meme-accent"
						placeholder="username"
					/>
				</div>

				<div>
					<label
						htmlFor="email"
						className="block text-sm font-medium mb-2"
					>
						Email
					</label>
					<input
						id="email"
						type="email"
						value={email}
						onChange={(e) => setEmail(e.target.value)}
						required
						className="w-full px-4 py-2 border border-meme-accent rounded-lg focus:outline-none focus:ring-2 focus:ring-meme-accent"
						placeholder="your@email.com"
					/>
				</div>

				<div>
					<label
						htmlFor="password"
						className="block text-sm font-medium mb-2"
					>
						Password
					</label>
					<input
						id="password"
						type="password"
						value={password}
						onChange={(e) => setPassword(e.target.value)}
						required
						minLength={6}
						className="w-full px-4 py-2 border border-meme-accent rounded-lg focus:outline-none focus:ring-2 focus:ring-meme-accent"
						placeholder="••••••••"
					/>
				</div>

				<button
					type="submit"
					disabled={loading}
					className="w-full btn btn-primary py-3 disabled:opacity-50"
				>
					{loading ? 'Signing up...' : 'Sign Up'}
				</button>
			</form>

			<div className="mt-6">
				<div className="relative">
					<div className="absolute inset-0 flex items-center">
						<div className="w-full border-t border-gray-300"></div>
					</div>
					<div className="relative flex justify-center text-sm">
						<span className="px-2 bg-meme-bg text-gray-500">
							Or continue with
						</span>
					</div>
				</div>

				<div className="mt-6 grid grid-cols-2 gap-3">
					<button
						onClick={() => handleOAuthSignup('google')}
						disabled={loading}
						className="w-full btn btn-secondary py-3 disabled:opacity-50"
					>
						Google
					</button>
					<button
						onClick={() => handleOAuthSignup('github')}
						disabled={loading}
						className="w-full btn btn-secondary py-3 disabled:opacity-50"
					>
						GitHub
					</button>
				</div>
			</div>
		</div>
	)
}

