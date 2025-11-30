# Meme Generator Implementation Plan

## Overview

Create a complete meme generator application in the `Meme/` folder with HTML, CSS, and JavaScript files. The app will use HTML5 Canvas to render images with text overlays and enable download functionality.

## Files to Create

### 1. `Meme/index.html`

- Main HTML structure with:
- File input for image selection
- Canvas element for meme preview
- Controls panel for text management (add/remove text boxes)
- Text input fields with size controls
- Download button
- Drag-and-drop support for text positioning

### 2. `Meme/styles.css`

- Modern, clean UI styling
- Responsive layout for mobile and desktop
- Styling for controls, buttons, and canvas container
- Visual feedback for interactive elements

### 3. `Meme/script.js`

- Image upload handling (file input and drag-and-drop)
- Canvas rendering with image and text overlays
- Text management system:
- Add/remove text boxes dynamically
- Store text properties (content, position, size, id)
- Text rendering with white fill and black stroke (border)
- Text positioning (draggable or input-based)
- Font size controls (slider or input)
- Download functionality (convert canvas to image and trigger download)

## Key Features Implementation

### Image Selection

- File input accepts image formats (jpg, png, gif, webp)
- Display selected image on canvas
- Handle image loading and error states

### Text Overlays

- Each text box has:
- Unique ID for tracking
- Text content input
- Font size control (range slider, e.g., 20-100px)
- Position (x, y coordinates)
- Draggable positioning on canvas
- Render text with:
- White fill color (`fillStyle = 'white'`)
- Black stroke/border (`strokeStyle = 'black'`, `lineWidth = 3-5px`)
- Impact or Arial Black font (typical meme font)

### Canvas Rendering

- Draw image first
- Draw all text overlays on top
- Update canvas on any change (text content, size, position)
- Maintain aspect ratio and proper scaling

### Download

- Convert canvas to blob/image
- Trigger download with appropriate filename
- Support PNG format for transparency

## Technical Approach

- Use HTML5 Canvas API for rendering
- Vanilla JavaScript (no external dependencies)
- Event-driven architecture for updates
- Store text objects in array for management
- Use `fillText()` and `strokeText()` for text rendering with border effect

## User Flow

1. User selects/uploads an image
2. Image displays on canvas
3. User clicks "Add Text" to create a text box
4. User enters text and adjusts size
5. User drags text to position it
6. User can add multiple text boxes
7. User clicks "Download" to save the meme

