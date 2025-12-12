import sharp from 'sharp'
import { readdir } from 'fs/promises'
import { join } from 'path'

const TARGET_SIZE = 1080
const TEMPLATES_DIR = join(process.cwd(), 'public', 'templates')

async function validateTemplates() {
	try {
		console.log('Validating template dimensions...')
		console.log(`Target size: ${TARGET_SIZE}x${TARGET_SIZE}`)

		const files = await readdir(TEMPLATES_DIR)
		const templateFiles = files
			.filter((file) => file.startsWith('Template') && file.endsWith('.jpg'))
			.sort((a, b) => {
				const numA = parseInt(a.match(/\d+/)?.[0] || '0')
				const numB = parseInt(b.match(/\d+/)?.[0] || '0')
				return numA - numB
			})

		console.log(`Found ${templateFiles.length} template files\n`)

		let validCount = 0
		let invalidCount = 0
		const invalidFiles: string[] = []

		for (const file of templateFiles) {
			const filePath = join(TEMPLATES_DIR, file)

			try {
				const metadata = await sharp(filePath).metadata()

				if (
					metadata.width === TARGET_SIZE &&
					metadata.height === TARGET_SIZE
				) {
					console.log(`✓ ${file}: ${metadata.width}x${metadata.height}`)
					validCount++
				} else {
					console.error(
						`✗ ${file}: ${metadata.width}x${metadata.height} (expected ${TARGET_SIZE}x${TARGET_SIZE})`
					)
					invalidFiles.push(file)
					invalidCount++
				}
			} catch (error) {
				console.error(`✗ ${file}: Error reading metadata -`, error)
				invalidFiles.push(file)
				invalidCount++
			}
		}

		console.log('\n=== Validation Summary ===')
		console.log(`Valid templates: ${validCount}`)
		console.log(`Invalid templates: ${invalidCount}`)

		if (invalidFiles.length > 0) {
			console.log('\nInvalid files:')
			invalidFiles.forEach((file) => console.log(`  - ${file}`))
			process.exit(1)
		} else {
			console.log('\n✓ All templates are valid!')
			process.exit(0)
		}
	} catch (error) {
		console.error('Fatal error:', error)
		process.exit(1)
	}
}

validateTemplates()
