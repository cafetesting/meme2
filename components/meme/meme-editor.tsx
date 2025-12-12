'use client'

import {
	useState,
	useRef,
	useEffect,
	useCallback,
} from 'react'
import MemeCanvas from './meme-canvas'
import TextBoxOverlay from './text-box-overlay'
import ImageCropDialog from './image-crop-dialog'
import { MemeText, Database } from '@/types/database'

export interface TextObject {
	id: number
	order: number
	content: string
	x: number
	y: number
	width: number
	height: number
	font_size: number
	font_family: string
	color: string
}

interface MemeEditorProps {
	initialImage?: string | null
	initialTexts?: MemeText[]
	memeId?: string
	onSave?: (formData: FormData) => Promise<void>
}

export default function MemeEditor({
	initialImage,
	initialTexts,
	memeId,
	onSave,
}: MemeEditorProps) {
	const [image, setImage] = useState<HTMLImageElement | null>(
		null
	)
	const [texts, setTexts] = useState<TextObject[]>([])
	const [selectedTextId, setSelectedTextId] = useState<
		number | null
	>(null)
	const [isDragging, setIsDragging] = useState(false)
	const [isResizing, setIsResizing] = useState(false)
	const [resizeHandle, setResizeHandle] = useState<
		string | null
	>(null)
	const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 })
	const [canvasScale, setCanvasScale] = useState({ x: 1, y: 1 })
	const [showCanvas, setShowCanvas] = useState(false)
	const [isPublic, setIsPublic] = useState(false)
	const [title, setTitle] = useState('')
	const [saving, setSaving] = useState(false)
	const [showCropDialog, setShowCropDialog] = useState(false)
	const [pendingImageFile, setPendingImageFile] = useState<File | null>(null)

	const canvasRef = useRef<HTMLCanvasElement>(null)
	const canvasWrapperRef = useRef<HTMLDivElement>(null)
	const textBoxesOverlayRef = useRef<HTMLDivElement>(null)
	const nextTextIdRef = useRef(1)

	const templates = Array.from(
		{ length: 34 },
		(_, i) => `/templates/Template${i + 1}.jpg`
	)

	// Load initial image and texts if provided
	useEffect(() => {
		if (initialImage) {
			const img = new Image()
			img.onload = () => {
				setImage(img)
				setShowCanvas(true)
				setupCanvas(img)
			}
			img.src = initialImage
		}

		if (initialTexts && initialTexts.length > 0) {
			const convertedTexts: TextObject[] = initialTexts.map(
				(text: MemeText, index: number): TextObject => {
					const t = text as any as Database['public']['Tables']['meme_texts']['Row']
					return {
						id: index + 1,
						content: t.content,
						x: t.x,
						y: t.y,
						width: t.width,
						height: t.height,
						font_size: t.font_size,
						font_family: t.font_family,
						color: t.color,
						order: t.order,
					}
				}
			)
			setTexts(convertedTexts)
			nextTextIdRef.current = convertedTexts.length + 1
		}
	}, [initialImage, initialTexts])

	const setupCanvas = useCallback(
		(img: HTMLImageElement) => {
			const canvas = canvasRef.current
			if (!canvas) return

			// Use actual image dimensions (should be 1080x1080 for standardized images)
			// But scale display for UI if needed
			const maxWidth = 800
			const maxHeight = 800

			let width = img.width
			let height = img.height

			// Scale down for display if image is larger than max display size
			if (width > maxWidth || height > maxHeight) {
				const ratio = Math.min(
					maxWidth / width,
					maxHeight / height
				)
				width = width * ratio
				height = height * ratio
			}

			// Set canvas to actual image dimensions (not scaled)
			canvas.width = img.width
			canvas.height = img.height

			setTimeout(() => {
				updateCanvasScale()
			}, 0)
		},
		[]
	)

	const updateCanvasScale = useCallback(() => {
		const canvas = canvasRef.current
		const overlay = textBoxesOverlayRef.current
		if (!canvas || !overlay) return

		const rect = canvas.getBoundingClientRect()
		if (rect.width > 0 && rect.height > 0) {
			setCanvasScale({
				x: canvas.width / rect.width,
				y: canvas.height / rect.height,
			})

			overlay.style.width = `${rect.width}px`
			overlay.style.height = `${rect.height}px`
		}
	}, [])

	useEffect(() => {
		function handleResize() {
			if (image) {
				updateCanvasScale()
			}
		}

		window.addEventListener('resize', handleResize)
		return () => window.removeEventListener('resize', handleResize)
	}, [image, updateCanvasScale])

	const calculateFontSize = useCallback(
		(width: number, height: number) => {
			const minDimension = Math.min(width, height)
			return Math.max(20, Math.min(100, minDimension * 0.3))
		},
		[]
	)

	const addText = useCallback(
		(
			x?: number,
			y?: number,
			width = 200,
			height = 80
		) => {
			const canvas = canvasRef.current
			if (!canvas) return

			const textId = nextTextIdRef.current++
			const newText: TextObject = {
				id: textId,
				content: 'Your Text Here',
				x: x || canvas.width / 2,
				y: y || canvas.height / 2,
				width,
				height,
				font_size: calculateFontSize(width, height),
				font_family: 'Impact, Arial Black, sans-serif',
				color: '#ffffff',
				order: texts.length,
			}

			setTexts((prev) => [...prev, newText])
			setSelectedTextId(textId)
		},
		[texts.length, calculateFontSize]
	)

	const updateText = useCallback(
		(
			id: number,
			field: keyof TextObject,
			value: any
		) => {
			setTexts((prev) =>
				prev.map((text) => {
					if (text.id === id) {
						const updated: TextObject = { ...text }
						if (
							field === 'font_size' ||
							field === 'width' ||
							field === 'height' ||
							field === 'order'
						) {
							;(updated as any)[field] = parseInt(value)
						} else {
							;(updated as any)[field] = value
						}

						if (
							(field === 'width' || field === 'height') &&
							updated.width &&
							updated.height
						) {
							updated.font_size = calculateFontSize(
								updated.width,
								updated.height
							)
						}

						return updated
					}
					return text
				})
			)
		},
		[calculateFontSize]
	)

	const removeText = useCallback(
		(id: number) => {
			setTexts((prev) => prev.filter((text) => text.id !== id))
			if (selectedTextId === id) {
				setSelectedTextId(null)
			}
		},
		[selectedTextId]
	)

	const selectTemplate = useCallback(
		(templatePath: string) => {
			const img = new Image()
			img.onload = () => {
				setImage(img)
				setShowCanvas(true)
				setupCanvas(img)
			}
			img.onerror = () => {
				alert(
					'Failed to load template image. Please try another template or upload your own image.'
				)
			}
			img.src = templatePath
		},
		[setupCanvas]
	)

	const handleImageSelect = useCallback((file: File) => {
		if (file && file.type.startsWith('image/')) {
			// Show crop dialog for user uploads
			setPendingImageFile(file)
			setShowCropDialog(true)
		}
	}, [])

	const handleCropComplete = useCallback(
		(croppedImageDataUrl: string) => {
			const img = new Image()
			img.onload = () => {
				setImage(img)
				setShowCanvas(true)
				setupCanvas(img)
			}
			img.src = croppedImageDataUrl
			setShowCropDialog(false)
			setPendingImageFile(null)
		},
		[setupCanvas]
	)

	const handleCropCancel = useCallback(() => {
		setShowCropDialog(false)
		setPendingImageFile(null)
	}, [])

	const getCanvasCoordinates = useCallback(
		(e: React.MouseEvent | React.TouchEvent) => {
			const canvas = canvasRef.current
			if (!canvas) return { x: 0, y: 0 }

			const rect = canvas.getBoundingClientRect()
			let clientX: number, clientY: number

			if ('touches' in e) {
				clientX = e.touches[0].clientX
				clientY = e.touches[0].clientY
			} else {
				clientX = e.clientX
				clientY = e.clientY
			}

			return {
				x: (clientX - rect.left) * canvasScale.x,
				y: (clientY - rect.top) * canvasScale.y,
			}
		},
		[canvasScale]
	)

	const getTextAtPosition = useCallback(
		(x: number, y: number) => {
			for (let i = texts.length - 1; i >= 0; i--) {
				const text = texts[i]
				const left = text.x - text.width / 2
				const right = text.x + text.width / 2
				const top = text.y - text.height / 2
				const bottom = text.y + text.height / 2

				if (
					x >= left &&
					x <= right &&
					y >= top &&
					y <= bottom
				) {
					return text
				}
			}
			return null
		},
		[texts]
	)

	const handleWrapperMouseDown = useCallback(
		(e: React.MouseEvent) => {
			const target = e.target as HTMLElement

			// Check resize handle
			if (target.classList.contains('resize-handle')) {
				e.stopPropagation()
				e.preventDefault()
				setIsResizing(true)
				setResizeHandle(target.dataset.handle || null)
				const textBox = target.closest(
					'.text-box-overlay'
				) as HTMLElement
				if (textBox) {
					const textId = parseInt(
						textBox.dataset.textId || '0'
					)
					const text = texts.find((t) => t.id === textId)
					if (text) {
						setSelectedTextId(text.id)
					}
				}
				return
			}

			// Check text box overlay
			const textBox = target.closest(
				'.text-box-overlay'
			) as HTMLElement
			if (textBox) {
				e.stopPropagation()
				const textId = parseInt(textBox.dataset.textId || '0')
				const text = texts.find((t) => t.id === textId)
				if (text) {
					setSelectedTextId(text.id)
					setIsDragging(true)
					const coords = getCanvasCoordinates(e)
					setDragOffset({
						x: coords.x - text.x,
						y: coords.y - text.y,
					})
				}
				return
			}

			// Check canvas click
			if (target === canvasRef.current) {
				const coords = getCanvasCoordinates(e)
				const text = getTextAtPosition(coords.x, coords.y)

				if (text) {
					setSelectedTextId(text.id)
					setIsDragging(true)
					setDragOffset({
						x: coords.x - text.x,
						y: coords.y - text.y,
					})
				} else {
					addText(coords.x, coords.y)
				}
			}
		},
		[texts, getCanvasCoordinates, getTextAtPosition, addText]
	)

	const handleWrapperMouseMove = useCallback(
		(e: React.MouseEvent) => {
			if (isResizing && selectedTextId && resizeHandle) {
				const selectedText = texts.find(
					(t) => t.id === selectedTextId
				)
				if (!selectedText) return

				const coords = getCanvasCoordinates(e)
				const left =
					selectedText.x - selectedText.width / 2
				const top =
					selectedText.y - selectedText.height / 2
				const right =
					selectedText.x + selectedText.width / 2
				const bottom =
					selectedText.y + selectedText.height / 2

				let newLeft = left
				let newTop = top
				let newRight = right
				let newBottom = bottom

				switch (resizeHandle) {
					case 'nw':
						newLeft = Math.min(coords.x, right - 50)
						newTop = Math.min(coords.y, bottom - 30)
						break
					case 'ne':
						newRight = Math.max(coords.x, left + 50)
						newTop = Math.min(coords.y, bottom - 30)
						break
					case 'sw':
						newLeft = Math.min(coords.x, right - 50)
						newBottom = Math.max(coords.y, top + 30)
						break
					case 'se':
						newRight = Math.max(coords.x, left + 50)
						newBottom = Math.max(coords.y, top + 30)
						break
				}

				const newWidth = newRight - newLeft
				const newHeight = newBottom - newTop
				const newX = (newLeft + newRight) / 2
				const newY = (newTop + newBottom) / 2

				updateText(selectedTextId, 'width', newWidth)
				updateText(selectedTextId, 'height', newHeight)
				updateText(selectedTextId, 'x', newX)
				updateText(selectedTextId, 'y', newY)
				updateText(
					selectedTextId,
					'font_size',
					calculateFontSize(newWidth, newHeight)
				)
			} else if (isDragging && selectedTextId) {
				const coords = getCanvasCoordinates(e)
				const selectedText = texts.find(
					(t) => t.id === selectedTextId
				)
				if (selectedText) {
					updateText(
						selectedTextId,
						'x',
						coords.x - dragOffset.x
					)
					updateText(
						selectedTextId,
						'y',
						coords.y - dragOffset.y
					)
				}
			}
		},
		[
			isResizing,
			isDragging,
			selectedTextId,
			resizeHandle,
			texts,
			getCanvasCoordinates,
			dragOffset,
			updateText,
			calculateFontSize,
		]
	)

	const handleWrapperMouseUp = useCallback(() => {
		setIsDragging(false)
		setIsResizing(false)
		setResizeHandle(null)
	}, [])

	const handleDocumentClick = useCallback(
		(e: MouseEvent) => {
			if (
				canvasWrapperRef.current &&
				!canvasWrapperRef.current.contains(e.target as Node) &&
				!(e.target as HTMLElement).closest(
					'.text-control-item'
				) &&
				!(e.target as HTMLElement).closest('.bottom-toolbar')
			) {
				setSelectedTextId(null)
			}
		},
		[]
	)

	useEffect(() => {
		document.addEventListener('click', handleDocumentClick)
		return () =>
			document.removeEventListener('click', handleDocumentClick)
	}, [handleDocumentClick])

	const downloadMeme = useCallback(() => {
		const canvas = canvasRef.current
		if (!canvas || !image || texts.length === 0) {
			alert(
				'Please add an image and at least one text element before downloading.'
			)
			return
		}

		canvas.toBlob((blob) => {
			if (!blob) return
			const url = URL.createObjectURL(blob)
			const a = document.createElement('a')
			a.href = url
			a.download = `meme-${Date.now()}.png`
			document.body.appendChild(a)
			a.click()
			document.body.removeChild(a)
			URL.revokeObjectURL(url)
		}, 'image/png')
	}, [image, texts])

	const handleSave = useCallback(async () => {
		const canvas = canvasRef.current
		if (
			!canvas ||
			!image ||
			texts.length === 0 ||
			!onSave
		) {
			alert(
				'Please add an image and at least one text element before saving.'
			)
			return
		}

		setSaving(true)
		try {
			canvas.toBlob(async (blob) => {
				if (!blob) {
					setSaving(false)
					return
				}
				// Convert blob to FormData for Server Action compatibility
				const formData = new FormData()
				formData.append('image', blob, 'meme.png')
				formData.append('texts', JSON.stringify(texts))
				formData.append('isPublic', String(isPublic))
				if (title) {
					formData.append('title', title)
				}
				await onSave(formData)
				setSaving(false)
			}, 'image/png')
		} catch (error) {
			console.error('Error saving meme:', error)
			setSaving(false)
		}
	}, [image, texts, isPublic, title, onSave])

	const selectedText = texts.find(
		(t) => t.id === selectedTextId
	)

	return (
		<div className="app-container">
			{/* Crop Dialog */}
			{showCropDialog && pendingImageFile && (
				<ImageCropDialog
					imageFile={pendingImageFile}
					onCropComplete={handleCropComplete}
					onCancel={handleCropCancel}
				/>
			)}

			{/* Sidebar */}
			<aside className="sidebar">
				<div className="sidebar-section">
					<h2 className="sidebar-title">Templates</h2>
					<div className="templates-grid">
						{templates.map((templatePath, index) => (
							<div
								key={index}
								className="template-item"
								onClick={() => selectTemplate(templatePath)}
							>
								<img
									src={templatePath}
									alt={`Template ${index + 1}`}
									loading="lazy"
								/>
							</div>
						))}
					</div>
				</div>

				<div className="sidebar-divider"></div>

				<div className="sidebar-section">
					<h2 className="sidebar-title">Upload</h2>
					<div className="upload-area">
						<input
							type="file"
							id="imageInput"
							accept="image/*"
							hidden
							onChange={(e) => {
								const file = e.target.files?.[0]
								if (file) handleImageSelect(file)
							}}
						/>
						<label htmlFor="imageInput" className="upload-label">
							<svg
								width="32"
								height="32"
								viewBox="0 0 24 24"
								fill="none"
								stroke="currentColor"
								strokeWidth="2"
							>
								<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
								<polyline points="17 8 12 3 7 8"></polyline>
								<line
									x1="12"
									y1="3"
									x2="12"
									y2="15"
								></line>
							</svg>
							<p>Upload Image</p>
							<p className="upload-hint">
								PNG, JPG, GIF, WEBP
							</p>
						</label>
					</div>
				</div>
			</aside>

			{/* Main Content */}
			<main className="main-content">
				{showCanvas && image ? (
					<div className="canvas-section">
						<div className="canvas-container">
							<div
								ref={canvasWrapperRef}
								className="canvas-wrapper"
								onMouseDown={handleWrapperMouseDown}
								onMouseMove={handleWrapperMouseMove}
								onMouseUp={handleWrapperMouseUp}
								onMouseLeave={handleWrapperMouseUp}
							>
								<MemeCanvas
									ref={canvasRef}
									image={image}
									texts={texts}
									onScaleUpdate={updateCanvasScale}
								/>
								<div
									ref={textBoxesOverlayRef}
									className="text-boxes-overlay"
								>
									{texts.map((text) => (
										<TextBoxOverlay
											key={text.id}
											text={text}
											canvasScale={canvasScale}
											isSelected={
												text.id === selectedTextId
											}
											onSelect={() =>
												setSelectedTextId(text.id)
											}
											onDelete={() =>
												removeText(text.id)
											}
										/>
									))}
								</div>
							</div>
						</div>
					</div>
				) : (
					<div className="empty-state">
						<h1>Meme Generator</h1>
						<p>
							Select a template or upload an image to get
							started
						</p>
					</div>
				)}
			</main>

			{/* Bottom Toolbar */}
			{showCanvas && (
				<div className="bottom-toolbar">
					<div className="toolbar-content">
						<div className="toolbar-section">
							<button
								onClick={() => addText()}
								className="btn btn-primary"
							>
								+ Add Text
							</button>
						</div>

						<div className="toolbar-section text-controls-list">
							{texts.map((text) => (
								<div
									key={text.id}
									className={`text-control-item ${
										text.id === selectedTextId
											? 'active'
											: ''
									}`}
									onClick={() =>
										setSelectedTextId(text.id)
									}
								>
									<div className="control-group">
										<input
											type="text"
											className="text-input"
											value={text.content}
											placeholder={`Text ${text.id}`}
											onChange={(e) =>
												updateText(
													text.id,
													'content',
													e.target.value
												)
											}
											onClick={(e) =>
												e.stopPropagation()
											}
										/>
									</div>
									<div className="control-group">
										<input
											type="color"
											className="color-input"
											value={text.color}
											onChange={(e) =>
												updateText(
													text.id,
													'color',
													e.target.value
												)
											}
											onClick={(e) =>
												e.stopPropagation()
											}
										/>
									</div>
									<button
										className="remove-text-btn"
										onClick={(e) => {
											e.stopPropagation()
											removeText(text.id)
										}}
										title="Remove text"
									>
										×
									</button>
								</div>
							))}
						</div>

						<div className="toolbar-section">
							{onSave && (
								<>
									<input
										type="text"
										placeholder="Title (optional)"
										value={title}
										onChange={(e) =>
											setTitle(e.target.value)
										}
										className="text-input"
										style={{ minWidth: '150px' }}
									/>
									<label className="flex items-center gap-2">
										<input
											type="checkbox"
											checked={isPublic}
											onChange={(e) =>
												setIsPublic(e.target.checked)
											}
										/>
										<span className="text-sm">Public</span>
									</label>
									<button
										onClick={handleSave}
										disabled={saving}
										className="btn btn-primary"
									>
										{saving ? 'Saving...' : 'Save'}
									</button>
								</>
							)}
							<button
								onClick={downloadMeme}
								className="btn btn-download"
							>
								Download
							</button>
						</div>
					</div>
				</div>
			)}
		</div>
	)
}

