'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

type PasswordStrength = 'weak' | 'moderate' | 'strong'

function calculatePasswordStrength(password: string): PasswordStrength {
	if (password.length === 0) return 'weak'

	const hasLowercase = /[a-z]/.test(password)
	const hasUppercase = /[A-Z]/.test(password)
	const hasNumbers = /\d/.test(password)
	const hasSpecial = /[!@#$%^&*(),.?":{}|<>]/.test(password)

	const complexityCount =
		(hasLowercase ? 1 : 0) +
		(hasUppercase ? 1 : 0) +
		(hasNumbers ? 1 : 0) +
		(hasSpecial ? 1 : 0)

	if (password.length < 6 || complexityCount <= 1) {
		return 'weak'
	}

	if (
		password.length >= 9 &&
		complexityCount >= 3 &&
		hasLowercase &&
		hasUppercase &&
		(hasNumbers || hasSpecial)
	) {
		return 'strong'
	}

	return 'moderate'
}

export default function SignupForm() {
	const [email, setEmail] = useState('')
	const [password, setPassword] = useState('')
	const [username, setUsername] = useState('')
	const [loading, setLoading] = useState(false)
	const [error, setError] = useState<string | null>(null)
	const [emailError, setEmailError] = useState<string | null>(null)
	const [passwordStrength, setPasswordStrength] =
		useState<PasswordStrength>('weak')
	const router = useRouter()
	const supabase = createClient()

	function validateEmail(emailValue: string): boolean {
		const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
		return emailRegex.test(emailValue)
	}

	function handleEmailChange(e: React.ChangeEvent<HTMLInputElement>) {
		const emailValue = e.target.value
		setEmail(emailValue)

		if (emailValue && !validateEmail(emailValue)) {
			setEmailError('Please enter a valid email address')
		} else {
			setEmailError(null)
		}
	}

	function handleEmailBlur() {
		if (email && !validateEmail(email)) {
			setEmailError('Please enter a valid email address')
		}
	}

	function handlePasswordChange(e: React.ChangeEvent<HTMLInputElement>) {
		const passwordValue = e.target.value
		setPassword(passwordValue)
		setPasswordStrength(calculatePasswordStrength(passwordValue))
	}

	async function handleSignup(e: React.FormEvent) {
		e.preventDefault()
		setLoading(true)
		setError(null)
		setEmailError(null)

		// Validate username
		if (!username.trim()) {
			setError('Username is required')
			setLoading(false)
			return
		}

		// Validate email
		if (!validateEmail(email)) {
			setEmailError('Please enter a valid email address')
			setError('Please enter a valid email address')
			setLoading(false)
			return
		}

		// Validate password length
		if (password.length < 6) {
			setError('Password must be at least 6 characters long')
			setLoading(false)
			return
		}

		// Validate password strength - ensure it's not weak
		const strength = calculatePasswordStrength(password)
		if (strength === 'weak') {
			setError(
				'Password is too weak. Please use a combination of letters, numbers, and special characters.'
			)
			setLoading(false)
			return
		}

		const { data, error: signUpError } =
			await supabase.auth.signUp({
				email,
				password,
				options: {
					data: {
						username: username,
						display_name: username,
					},
				},
			})

		if (signUpError) {
			setError(signUpError.message)
			setLoading(false)
			return
		}

		if (data.user) {
			// Update user metadata to ensure display_name is set
			const { error: updateError } = await supabase.auth.updateUser({
				data: {
					display_name: username,
				},
			})

			if (updateError) {
				console.error('Error updating user metadata:', updateError)
			}

			// Use upsert to handle case where trigger already created profile
			const { error: profileError } = await supabase
				.from('profiles')
				.upsert(
					{
						id: data.user.id,
						username: username,
					},
					{
						onConflict: 'id',
					}
				)

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
						Username
					</label>
					<input
						id="username"
						type="text"
						value={username}
						onChange={(e) => setUsername(e.target.value)}
						required
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
						onChange={handleEmailChange}
						onBlur={handleEmailBlur}
						required
						className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-meme-accent ${
							emailError
								? 'border-red-500 focus:ring-red-500'
								: 'border-meme-accent'
						}`}
						placeholder="your@email.com"
					/>
					{emailError && (
						<p className="mt-1 text-sm text-red-600">{emailError}</p>
					)}
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
						onChange={handlePasswordChange}
						required
						minLength={6}
						className="w-full px-4 py-2 border border-meme-accent rounded-lg focus:outline-none focus:ring-2 focus:ring-meme-accent"
						placeholder="••••••••"
					/>
					{password && (
						<div className="mt-2">
							<div className="flex items-center gap-2 mb-1">
								<div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
									<div
										className={`h-full transition-all duration-300 ${
											passwordStrength === 'weak'
												? 'bg-red-500'
												: passwordStrength === 'moderate'
													? 'bg-yellow-500'
													: 'bg-green-500'
										}`}
										style={{
											width:
												passwordStrength === 'weak'
													? '33%'
													: passwordStrength === 'moderate'
														? '66%'
														: '100%',
										}}
									/>
								</div>
								<span
									className={`text-xs font-medium ${
										passwordStrength === 'weak'
											? 'text-red-600'
											: passwordStrength === 'moderate'
												? 'text-yellow-600'
												: 'text-green-600'
									}`}
								>
									{passwordStrength === 'weak'
										? 'Weak'
										: passwordStrength === 'moderate'
											? 'Moderate'
											: 'Strong'}
								</span>
							</div>
						</div>
					)}
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

