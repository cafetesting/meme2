import { Suspense } from 'react'
import Link from 'next/link'
import LoginForm from '@/components/auth/login-form'

export default function LoginPage() {
	return (
		<div className="min-h-screen bg-meme-bg flex items-center justify-center p-8">
			<div className="w-full max-w-md">
				<div className="text-center mb-8">
					<h1 className="text-3xl font-bold text-meme-accent mb-2">
						Sign In
					</h1>
					<p className="text-gray-600">
						Sign in to create and save memes
					</p>
				</div>
				<Suspense
					fallback={
						<div className="text-center">Loading...</div>
					}
				>
					<LoginForm />
				</Suspense>
				<p className="mt-6 text-center text-sm text-gray-600">
					Don't have an account?{' '}
					<Link
						href="/signup"
						className="text-meme-accent font-medium hover:underline"
					>
						Sign up
					</Link>
				</p>
			</div>
		</div>
	)
}

