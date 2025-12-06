/** @type {import('next').NextConfig} */
const nextConfig = {
	images: {
		remotePatterns: [
			{
				protocol: 'http',
				hostname: 'localhost',
			},
			{
				protocol: 'http',
				hostname: '127.0.0.1',
			},
			{
				protocol: 'https',
				hostname: '*.supabase.co',
			},
		],
	},
}

module.exports = nextConfig

