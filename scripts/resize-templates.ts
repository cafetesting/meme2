import sharp from 'sharp'
import { readdir, copyFile, mkdir, unlink } from 'fs/promises'
import { join } from 'path'
import { existsSync } from 'fs'

const TARGET_SIZE = 1080
const TEMPLATES_DIR = join(process.cwd(), 'public', 'templates')
const BACKUP_DIR = join(process.cwd(), 'public', 'templates', 'backup')

async function resizeTemplates() {
	try {
		console.log('Starting template resize process...')
		console.log(`Target size: ${TARGET_SIZE}x${TARGET_SIZE}`)
		console.log(`Templates directory: ${TEMPLATES_DIR}`)

		// Create backup directory if it doesn't exist
		if (!existsSync(BACKUP_DIR)) {
			await mkdir(BACKUP_DIR, { recursive: true })
			console.log(`Created backup directory: ${BACKUP_DIR}`)
		}

		// Read all template files (any .jpg file, not just Template*.jpg)
		const files = await readdir(TEMPLATES_DIR)
		const templateFiles = files
			.filter((file) => file.endsWith('.jpg') && !file.endsWith('.tmp'))
			.sort((a, b) => {
				// Try to sort by number if filename contains one, otherwise alphabetical
				const numA = parseInt(a.match(/\d+/)?.[0] || '0')
				const numB = parseInt(b.match(/\d+/)?.[0] || '0')
				if (numA !== 0 || numB !== 0) {
					return numA - numB
				}
				return a.localeCompare(b)
			})

		console.log(`Found ${templateFiles.length} template files`)

		let successCount = 0
		let errorCount = 0

		for (const file of templateFiles) {
			const inputPath = join(TEMPLATES_DIR, file)
			const backupPath = join(BACKUP_DIR, file)

			try {
				// Backup original file if backup doesn't exist
				if (!existsSync(backupPath)) {
					await copyFile(inputPath, backupPath)
					console.log(`✓ Backed up ${file}`)
				}

				// Get image metadata
				const metadata = await sharp(inputPath).metadata()
				console.log(
					`Processing ${file}: ${metadata.width}x${metadata.height} -> ${TARGET_SIZE}x${TARGET_SIZE}`
				)

				// Use temporary file for output (Sharp can't write to same file it reads)
				const tempPath = join(TEMPLATES_DIR, `${file}.tmp`)

				// Fit to frame: Scale longer side to 1080px, add white padding to make 1080x1080
				// Calculate scale factor to fit the longer dimension to 1080px
				const scale = Math.min(
					TARGET_SIZE / metadata.width!,
					TARGET_SIZE / metadata.height!
				)
				const scaledWidth = Math.round(metadata.width! * scale)
				const scaledHeight = Math.round(metadata.height! * scale)

				// Calculate padding needed to center the image in 1080x1080 frame
				const paddingTop = Math.floor((TARGET_SIZE - scaledHeight) / 2)
				const paddingBottom = TARGET_SIZE - scaledHeight - paddingTop
				const paddingLeft = Math.floor((TARGET_SIZE - scaledWidth) / 2)
				const paddingRight = TARGET_SIZE - scaledWidth - paddingLeft

				// Resize image to scaled dimensions (maintaining aspect ratio)
				// Then extend with white background to create 1080x1080 frame
				await sharp(inputPath)
					.resize(scaledWidth, scaledHeight, {
						fit: 'contain', // Maintain aspect ratio, fit within dimensions
						withoutEnlargement: false, // Allow upscaling if needed
						background: { r: 255, g: 255, b: 255, alpha: 1 }, // White background
					})
					.extend({
						top: paddingTop,
						bottom: paddingBottom,
						left: paddingLeft,
						right: paddingRight,
						background: { r: 255, g: 255, b: 255, alpha: 1 }, // White background
					})
					.jpeg({ quality: 90 })
					.toFile(tempPath)

				// Replace original with resized version
				await copyFile(tempPath, inputPath)
				await unlink(tempPath)

				console.log(`✓ Resized ${file}`)
				successCount++

				// Verify the result
				const newMetadata = await sharp(inputPath).metadata()
				if (
					newMetadata.width !== TARGET_SIZE ||
					newMetadata.height !== TARGET_SIZE
				) {
					console.error(
						`⚠ Warning: ${file} dimensions don't match target (${newMetadata.width}x${newMetadata.height})`
					)
				}
			} catch (error) {
				console.error(`✗ Error processing ${file}:`, error)
				errorCount++
			}
		}

		console.log('\n=== Resize Summary ===')
		console.log(`Successfully processed: ${successCount}`)
		console.log(`Errors: ${errorCount}`)
		console.log(`Total templates: ${templateFiles.length}`)
		console.log(`Backups saved to: ${BACKUP_DIR}`)
	} catch (error) {
		console.error('Fatal error:', error)
		process.exit(1)
	}
}

resizeTemplates()
