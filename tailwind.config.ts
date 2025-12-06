import type { Config } from 'tailwindcss'

const config: Config = {
	content: [
		'./pages/**/*.{js,ts,jsx,tsx,mdx}',
		'./components/**/*.{js,ts,jsx,tsx,mdx}',
		'./app/**/*.{js,ts,jsx,tsx,mdx}',
	],
	theme: {
		extend: {
			colors: {
				'meme-bg': '#FFEE91',
				'meme-sidebar': '#F5C857',
				'meme-accent': '#E2852E',
				'meme-content': '#ABE0F0',
			},
		},
	},
	plugins: [],
}
export default config

