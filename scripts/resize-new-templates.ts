import sharp from 'sharp'
import { readdir, copyFile, mkdir, unlink } from 'fs/promises'
import { join } from 'path'
import { existsSync } from 'fs'

const TARGET_SIZE = 1080
const TEMPLATES_DIR = join(process.cwd(), 'public', 'templates')
const BACKUP_DIR = join(process.cwd(), 'public', 'templates', 'backup')

/**
 * Script to resize only new templates that haven't been processed yet.
 * Useful after manually adding new template files.
 */
async function resizeNewTemplates() {
	try {
		console.log('Checking for new templates to resize...')
		console.log(`Target size: ${TARGET_SIZE}x${TARGET_SIZE}`)

		// Create backup directory if it doesn't exist
		if (!existsSync(BACKUP_DIR)) {
			await mkdir(BACKUP_DIR, { recursive: true })
			console.log(`Created backup directory: ${BACKUP_DIR}`)
		}

		// Read all template files
		const files = await readdir(TEMPLATES_DIR)
		const templateFiles = files
			.filter((file) => file.endsWith('.jpg') && !file.endsWith('.tmp'))

		// Read backup directory to see what's already been processed
		const backupFiles = existsSync(BACKUP_DIR)
			? await readdir(BACKUP_DIR)
			: []
		const processedFiles = new Set(
			backupFiles.filter((f) => f.endsWith('.jpg'))
		)

		// Find new templates (not in backup)
		const newTemplates = templateFiles.filter(
			(file) => !processedFiles.has(file)
		)

		if (newTemplates.length === 0) {
			console.log(
				'✓ No new templates found. All templates are already processed.'
			)
			return
		}

		console.log(`Found ${newTemplates.length} new template(s) to process:`)
		newTemplates.forEach((file) => console.log(`  - ${file}`))
		console.log('')

		let successCount = 0
		let errorCount = 0

		for (const file of newTemplates) {
			const inputPath = join(TEMPLATES_DIR, file)
			const backupPath = join(BACKUP_DIR, file)

			try {
				// Backup original file
				await copyFile(inputPath, backupPath)
				console.log(`✓ Backed up ${file}`)

				// Get image metadata
				const metadata = await sharp(inputPath).metadata()
				console.log(
					`Processing ${file}: ${metadata.width}x${metadata.height} -> ${TARGET_SIZE}x${TARGET_SIZE}`
				)

				// Use temporary file for output
				const tempPath = join(TEMPLATES_DIR, `${file}.tmp`)

				// Fit to frame: Scale longer side to 1080px, add white padding to make 1080x1080
				const scale = Math.min(
					TARGET_SIZE / metadata.width!,
					TARGET_SIZE / metadata.height!
				)
				const scaledWidth = Math.round(metadata.width! * scale)
				const scaledHeight = Math.round(metadata.height! * scale)

				const paddingTop = Math.floor((TARGET_SIZE - scaledHeight) / 2)
				const paddingBottom = TARGET_SIZE - scaledHeight - paddingTop
				const paddingLeft = Math.floor((TARGET_SIZE - scaledWidth) / 2)
				const paddingRight = TARGET_SIZE - scaledWidth - paddingLeft

				await sharp(inputPath)
					.resize(scaledWidth, scaledHeight, {
						fit: 'contain',
						withoutEnlargement: false,
						background: { r: 255, g: 255, b: 255, alpha: 1 },
					})
					.extend({
						top: paddingTop,
						bottom: paddingBottom,
						left: paddingLeft,
						right: paddingRight,
						background: { r: 255, g: 255, b: 255, alpha: 1 },
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

		console.log('\n=== Summary ===')
		console.log(`Successfully processed: ${successCount}`)
		console.log(`Errors: ${errorCount}`)
		console.log(`Total new templates: ${newTemplates.length}`)
	} catch (error) {
		console.error('Fatal error:', error)
		process.exit(1)
	}
}

resizeNewTemplates()
