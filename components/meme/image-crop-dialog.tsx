'use client'

import { useState, useRef, useCallback, useEffect } from 'react'
import ReactCrop, {
	Crop,
	PixelCrop,
	makeAspectCrop,
	centerCrop,
} from 'react-image-crop'
import 'react-image-crop/dist/ReactCrop.css'
import {
	cropAndResizeImage,
	calculateInitialCropArea,
	getImageDimensions,
	type CropArea,
} from '@/lib/image-processing'

const TARGET_SIZE = 1080

interface ImageCropDialogProps {
	imageFile: File
	onCropComplete: (croppedImageDataUrl: string) => void
	onCancel: () => void
}

export default function ImageCropDialog({
	imageFile,
	onCropComplete,
	onCancel,
}: ImageCropDialogProps) {
	const [imgSrc, setImgSrc] = useState<string>('')
	const [crop, setCrop] = useState<Crop>()
	const [completedCrop, setCompletedCrop] = useState<PixelCrop>()
	const [previewUrl, setPreviewUrl] = useState<string>('')
	const [imageDimensions, setImageDimensions] = useState<{
		width: number
		height: number
	} | null>(null)
	const [isProcessing, setIsProcessing] = useState(false)
	const imgRef = useRef<HTMLImageElement>(null)

	// Load image and set up initial crop
	useEffect(() => {
		const reader = new FileReader()
		reader.onload = async () => {
			const dataUrl = reader.result as string
			setImgSrc(dataUrl)

			// Get image dimensions for display
			const dimensions = await getImageDimensions(imageFile)
			setImageDimensions(dimensions)
		}
		reader.readAsDataURL(imageFile)
	}, [imageFile])

	// Update preview when crop changes
	useEffect(() => {
		if (!completedCrop || !imgRef.current || !imageDimensions) return

		const updatePreview = async () => {
			const img = imgRef.current
			if (!img) return

			// Get displayed image dimensions (after CSS scaling)
			const displayedRect = img.getBoundingClientRect()
			const displayedWidth = displayedRect.width
			const displayedHeight = displayedRect.height

			// Get natural image dimensions
			const naturalWidth = img.naturalWidth
			const naturalHeight = img.naturalHeight

			// Calculate scale factor between displayed and natural size
			const scaleX = naturalWidth / displayedWidth
			const scaleY = naturalHeight / displayedHeight

			// Convert crop coordinates from displayed size to natural image size
			// PixelCrop coordinates are relative to the displayed image when using unit: 'px'
			const cropArea: CropArea = {
				x: Math.round(completedCrop.x * scaleX),
				y: Math.round(completedCrop.y * scaleY),
				width: Math.round(completedCrop.width * scaleX),
				height: Math.round(completedCrop.height * scaleY),
			}

			try {
				const preview = await cropAndResizeImage(
					imageFile,
					cropArea,
					TARGET_SIZE
				)
				setPreviewUrl(preview)
			} catch (error) {
				console.error('Error creating preview:', error)
			}
		}

		updatePreview()
	}, [completedCrop, imageFile, imageDimensions])

	const handleApply = useCallback(async () => {
		if (!completedCrop || !imgRef.current) return

		setIsProcessing(true)

		try {
			const img = imgRef.current

			// Get displayed image dimensions (after CSS scaling)
			const displayedRect = img.getBoundingClientRect()
			const displayedWidth = displayedRect.width
			const displayedHeight = displayedRect.height

			// Get natural image dimensions
			const naturalWidth = img.naturalWidth
			const naturalHeight = img.naturalHeight

			// Calculate scale factor between displayed and natural size
			const scaleX = naturalWidth / displayedWidth
			const scaleY = naturalHeight / displayedHeight

			// Convert crop coordinates from displayed size to natural image size
			const cropArea: CropArea = {
				x: Math.round(completedCrop.x * scaleX),
				y: Math.round(completedCrop.y * scaleY),
				width: Math.round(completedCrop.width * scaleX),
				height: Math.round(completedCrop.height * scaleY),
			}

			const croppedImage = await cropAndResizeImage(
				imageFile,
				cropArea,
				TARGET_SIZE
			)
			onCropComplete(croppedImage)
		} catch (error) {
			console.error('Error processing image:', error)
			alert('Failed to process image. Please try again.')
			setIsProcessing(false)
		}
	}, [completedCrop, imageFile, onCropComplete])

	const onImageLoad = useCallback((e: React.SyntheticEvent<HTMLImageElement>) => {
		const img = e.currentTarget
		if (!crop && img.naturalWidth && img.naturalHeight) {
			const naturalWidth = img.naturalWidth
			const naturalHeight = img.naturalHeight

			const initialCrop = calculateInitialCropArea(
				naturalWidth,
				naturalHeight
			)

			const aspectCrop = makeAspectCrop(
				{
					unit: 'px',
					x: initialCrop.x,
					y: initialCrop.y,
					width: initialCrop.width,
					height: initialCrop.height,
				},
				1,
				naturalWidth,
				naturalHeight
			)

			setCrop(aspectCrop)
		}
	}, [crop])

	return (
		<div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-75">
			<div className="bg-white rounded-lg shadow-xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-auto">
				{/* Header */}
				<div className="p-6 border-b border-gray-200">
					<h2 className="text-xl font-semibold text-gray-800">
						Crop Image to Square (1080x1080)
					</h2>
					<p className="text-sm text-gray-600 mt-1">
						Adjust the crop area to select the best part of your image
					</p>
				</div>

				{/* Content */}
				<div className="p-6">
					<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
						{/* Crop Area */}
						<div>
							<h3 className="text-sm font-medium text-gray-700 mb-3">
								Original Image
							</h3>
							{imgSrc && (
								<div className="border-2 border-gray-300 rounded-lg overflow-hidden bg-gray-100">
									<ReactCrop
										crop={crop}
										onChange={(c) => setCrop(c)}
										onComplete={(c) => setCompletedCrop(c)}
										aspect={1}
										minWidth={100}
										minHeight={100}
									>
										<img
											ref={imgRef}
											src={imgSrc}
											alt="Crop preview"
											onLoad={onImageLoad}
											style={{
												maxWidth: '100%',
												maxHeight: '400px',
												display: 'block',
											}}
										/>
									</ReactCrop>
								</div>
							)}
							{imageDimensions && (
								<p className="text-xs text-gray-500 mt-2">
									Original: {imageDimensions.width} × {imageDimensions.height}px
								</p>
							)}
						</div>

						{/* Preview */}
						<div>
							<h3 className="text-sm font-medium text-gray-700 mb-3">
								Preview (1080×1080)
							</h3>
							<div className="border-2 border-gray-300 rounded-lg overflow-hidden bg-gray-100 aspect-square flex items-center justify-center">
								{previewUrl ? (
									<img
										src={previewUrl}
										alt="Cropped preview"
										className="max-w-full max-h-full object-contain"
									/>
								) : (
									<div className="text-gray-400 text-sm">
										Adjust crop area to see preview
									</div>
								)}
							</div>
							<p className="text-xs text-gray-500 mt-2">
								Target: 1080 × 1080px
							</p>
						</div>
					</div>
				</div>

				{/* Footer */}
				<div className="p-6 border-t border-gray-200 flex justify-end gap-3">
					<button
						onClick={onCancel}
						disabled={isProcessing}
						className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
					>
						Cancel
					</button>
					<button
						onClick={handleApply}
						disabled={isProcessing || !completedCrop}
						className="px-4 py-2 text-white bg-[#e2852e] rounded-lg hover:bg-[#d1751e] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
					>
						{isProcessing ? 'Processing...' : 'Apply Crop'}
					</button>
				</div>
			</div>
		</div>
	)
}
