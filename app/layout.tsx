import type { Metadata } from 'next'
import './globals.css'
import '../styles/globals.css'

export const metadata: Metadata = {
	title: 'Meme Generator',
	description: 'Create and share memes',
}

interface RootLayoutProps {
	children: React.ReactNode
}

export default function RootLayout({ children }: RootLayoutProps) {
	return (
		<html lang="en">
			<body>{children}</body>
		</html>
	)
}

