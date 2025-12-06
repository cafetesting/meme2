'use client'

import { TextObject } from './meme-editor'

interface TextBoxOverlayProps {
	text: TextObject
	canvasScale: { x: number; y: number }
	isSelected: boolean
	onSelect: () => void
	onDelete: () => void
}

export default function TextBoxOverlay({
	text,
	canvasScale,
	isSelected,
	onSelect,
	onDelete,
}: TextBoxOverlayProps) {
	const edgePadding = 0.5

	const left = (text.x - text.width / 2) / canvasScale.x - edgePadding
	const top = (text.y - text.height / 2) / canvasScale.y - edgePadding
	const width = text.width / canvasScale.x + edgePadding * 2
	const height = text.height / canvasScale.y + edgePadding * 2

	return (
		<div
			className={`text-box-overlay ${isSelected ? 'selected' : ''}`}
			data-text-id={text.id}
			style={{
				left: `${left}px`,
				top: `${top}px`,
				width: `${width}px`,
				height: `${height}px`,
			}}
			onClick={(e) => {
				e.stopPropagation()
				onSelect()
			}}
		>
			{['nw', 'ne', 'sw', 'se'].map((handle) => (
				<div
					key={handle}
					className={`resize-handle resize-handle-${handle}`}
					data-handle={handle}
				/>
			))}
			<button
				className="text-box-delete"
				onClick={(e) => {
					e.stopPropagation()
					e.preventDefault()
					onDelete()
				}}
			>
				×
			</button>
		</div>
	)
}

