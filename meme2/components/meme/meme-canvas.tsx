'use client'

import {
	useEffect,
	useRef,
	forwardRef,
	useImperativeHandle,
} from 'react'
import { TextObject } from './meme-editor'

interface MemeCanvasProps {
	image: HTMLImageElement
	texts: TextObject[]
	onScaleUpdate?: () => void
}

const MemeCanvas = forwardRef<HTMLCanvasElement, MemeCanvasProps>(
	({ image, texts, onScaleUpdate }, ref) => {
		const canvasRef = useRef<HTMLCanvasElement>(null)

		useImperativeHandle(
			ref,
			() => canvasRef.current as HTMLCanvasElement
		)

		function wrapText(
			ctx: CanvasRenderingContext2D,
			text: TextObject,
			maxWidth: number
		) {
			if (!text.content || text.content.trim() === '') {
				return ['']
			}

			const words = text.content.split(' ')
			const lines: string[] = []

			if (words.length === 0) {
				return ['']
			}

			let currentLine = words[0]
			ctx.font = `${text.font_size}px ${text.font_family}`

			const singleWordWidth = ctx.measureText(currentLine).width
			if (singleWordWidth > maxWidth && words.length === 1) {
				return [currentLine]
			}

			for (let i = 1; i < words.length; i++) {
				const word = words[i]
				const testLine = currentLine + ' ' + word
				const metrics = ctx.measureText(testLine)
				const testWidth = metrics.width

				if (testWidth > maxWidth && currentLine.length > 0) {
					lines.push(currentLine)
					currentLine = word
				} else {
					currentLine = testLine
				}
			}
			lines.push(currentLine)

			return lines
		}

		function drawText(
			ctx: CanvasRenderingContext2D,
			text: TextObject
		) {
			ctx.font = `${text.font_size}px ${text.font_family}`
			ctx.textAlign = 'center'
			ctx.textBaseline = 'middle'

			const maxWidth = text.width * 0.9
			const lines = wrapText(ctx, text, maxWidth)
			const lineHeight = text.font_size * 1.2
			const totalHeight = lines.length * lineHeight

			let y = text.y - totalHeight / 2 + lineHeight / 2

			ctx.strokeStyle = 'black'
			ctx.lineWidth = Math.max(5, text.font_size / 8)
			ctx.lineJoin = 'round'
			ctx.miterLimit = 2

			ctx.fillStyle = text.color || '#ffffff'

			lines.forEach((line) => {
				ctx.strokeText(line, text.x, y)
				ctx.fillText(line, text.x, y)
				y += lineHeight
			})
		}

		useEffect(() => {
			const canvas = canvasRef.current
			if (!canvas || !image) return

			const ctx = canvas.getContext('2d')
			if (!ctx) return

			ctx.clearRect(0, 0, canvas.width, canvas.height)
			ctx.drawImage(image, 0, 0, canvas.width, canvas.height)

			texts.forEach((text) => {
				drawText(ctx, text)
			})

			if (onScaleUpdate) {
				onScaleUpdate()
			}
		}, [image, texts, onScaleUpdate])

		return <canvas ref={canvasRef} id="memeCanvas" />
	}
)

MemeCanvas.displayName = 'MemeCanvas'

export default MemeCanvas

