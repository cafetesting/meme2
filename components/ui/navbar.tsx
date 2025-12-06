'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { useEffect, useState } from 'react'

export default function Navbar() {
	const router = useRouter()
	const supabase = createClient()
	const [user, setUser] = useState<any>(null)

	useEffect(() => {
		supabase.auth.getUser().then(({ data: { user } }) => {
			setUser(user)
		})

		const {
			data: { subscription },
		} = supabase.auth.onAuthStateChange((_event, session) => {
			setUser(session?.user ?? null)
		})

		return () => subscription.unsubscribe()
	}, [supabase])

	async function handleSignOut() {
		await supabase.auth.signOut()
		router.push('/')
		router.refresh()
	}

	return (
		<nav className="bg-meme-sidebar border-b-2 border-meme-accent px-6 py-4">
			<div className="max-w-7xl mx-auto flex items-center justify-between">
				<Link
					href="/"
					className="text-xl font-bold text-meme-accent"
				>
					Meme Generator
				</Link>

				<div className="flex items-center gap-4">
					{user ? (
						<>
							<Link
								href="/create"
								className="text-meme-accent hover:underline"
							>
								Create
							</Link>
							<Link
								href="/memes"
								className="text-meme-accent hover:underline"
							>
								My Memes
							</Link>
							<Link
								href="/gallery"
								className="text-meme-accent hover:underline"
							>
								Gallery
							</Link>
							<button
								onClick={handleSignOut}
								className="btn btn-secondary text-sm"
							>
								Sign Out
							</button>
						</>
					) : (
						<>
							<Link
								href="/gallery"
								className="text-meme-accent hover:underline"
							>
								Gallery
							</Link>
							<Link
								href="/login"
								className="btn btn-primary text-sm"
							>
								Sign In
							</Link>
						</>
					)}
				</div>
			</div>
		</nav>
	)
}

