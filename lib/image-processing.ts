const TARGET_SIZE = 1080

export interface CropArea {
	x: number
	y: number
	width: number
	height: number
}

export interface ImageDimensions {
	width: number
	height: number
}

/**
 * Get image dimensions from a file
 */
export async function getImageDimensions(
	file: File
): Promise<ImageDimensions> {
	return new Promise((resolve, reject) => {
		const img = new Image()
		img.onload = () => {
			resolve({
				width: img.width,
				height: img.height,
			})
		}
		img.onerror = reject
		img.src = URL.createObjectURL(file)
	})
}

/**
 * Get aspect ratio of an image file
 */
export async function getImageAspectRatio(file: File): Promise<number> {
	const dimensions = await getImageDimensions(file)
	return dimensions.width / dimensions.height
}

/**
 * Check if image needs processing (not already 1080x1080)
 */
export async function validateImageDimensions(
	file: File
): Promise<{ isValid: boolean; dimensions: ImageDimensions }> {
	const dimensions = await getImageDimensions(file)
	const isValid =
		dimensions.width === TARGET_SIZE && dimensions.height === TARGET_SIZE
	return { isValid, dimensions }
}

/**
 * Crop and resize image to target size (1080x1080)
 * Returns a data URL of the processed image
 */
export async function cropAndResizeImage(
	file: File,
	cropArea: CropArea,
	targetSize: number = TARGET_SIZE
): Promise<string> {
	return new Promise((resolve, reject) => {
		const img = new Image()
		img.onload = () => {
			const canvas = document.createElement('canvas')
			canvas.width = targetSize
			canvas.height = targetSize
			const ctx = canvas.getContext('2d')

			if (!ctx) {
				reject(new Error('Could not get canvas context'))
				return
			}

			// Draw cropped and resized image
			ctx.drawImage(
				img,
				cropArea.x,
				cropArea.y,
				cropArea.width,
				cropArea.height,
				0,
				0,
				targetSize,
				targetSize
			)

			// Convert to data URL
			const dataUrl = canvas.toDataURL('image/jpeg', 0.9)
			resolve(dataUrl)
		}
		img.onerror = reject
		img.src = URL.createObjectURL(file)
	})
}

/**
 * Convert data URL to File object
 */
export function dataURLtoFile(
	dataUrl: string,
	filename: string = 'image.jpg'
): File {
	const arr = dataUrl.split(',')
	const mime = arr[0].match(/:(.*?);/)?.[1] || 'image/jpeg'
	const bstr = atob(arr[1])
	let n = bstr.length
	const u8arr = new Uint8Array(n)

	while (n--) {
		u8arr[n] = bstr.charCodeAt(n)
	}

	return new File([u8arr], filename, { type: mime })
}

/**
 * Calculate initial crop area for an image (centered, square)
 */
export function calculateInitialCropArea(
	imageWidth: number,
	imageHeight: number
): CropArea {
	const size = Math.min(imageWidth, imageHeight)
	const x = (imageWidth - size) / 2
	const y = (imageHeight - size) / 2

	return {
		x,
		y,
		width: size,
		height: size,
	}
}

/**
 * Get target size constant
 */
export function getTargetSize(): number {
	return TARGET_SIZE
}
