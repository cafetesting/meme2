import Link from 'next/link'
import SignupForm from '@/components/auth/signup-form'

export default function SignupPage() {
	return (
		<div className="min-h-screen bg-meme-bg flex items-center justify-center p-8">
			<div className="w-full max-w-md">
				<div className="text-center mb-8">
					<h1 className="text-3xl font-bold text-meme-accent mb-2">
						Sign Up
					</h1>
					<p className="text-gray-600">
						Create an account to get started
					</p>
				</div>
				<SignupForm />
				<p className="mt-6 text-center text-sm text-gray-600">
					Already have an account?{' '}
					<Link
						href="/login"
						className="text-meme-accent font-medium hover:underline"
					>
						Sign in
					</Link>
				</p>
			</div>
		</div>
	)
}

