import type { Metadata } from 'next'
import './globals.css'
import '../styles/globals.css'

export const metadata: Metadata = {
  title: 'Meme Generator',
  description: 'Create and share memes',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}

