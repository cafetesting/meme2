// Meme Generator Application
class MemeGenerator {
    constructor() {
        this.canvas = document.getElementById('memeCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.imageInput = document.getElementById('imageInput');
        this.uploadArea = document.getElementById('uploadArea');
        this.canvasSection = document.getElementById('canvasSection');
        this.controlsSection = document.getElementById('controlsSection');
        this.emptyState = document.getElementById('emptyState');
        this.addTextBtn = document.getElementById('addTextBtn');
        this.downloadBtn = document.getElementById('downloadBtn');
        this.textControlsList = document.getElementById('textControlsList');
        this.templatesGrid = document.getElementById('templatesGrid');
        this.canvasWrapper = document.getElementById('canvasWrapper');
        this.textBoxesOverlay = document.getElementById('textBoxesOverlay');
        
        this.image = null;
        this.texts = [];
        this.nextTextId = 1;
        this.selectedText = null;
        this.selectedTextBoxElement = null;
        this.isDragging = false;
        this.isResizing = false;
        this.resizeHandle = null;
        this.dragOffset = { x: 0, y: 0 };
        this.canvasScale = { x: 1, y: 1 };
        
        // Template images from Asset folder
        this.templates = [
            'Asset/Drake-Hotline-Bling.jpg',
            'Asset/meme-1764487632008.png'
        ];
        
        this.init();
    }
    
    init() {
        // Load templates
        this.loadTemplates();
        
        // File input change event
        this.imageInput.addEventListener('change', (e) => this.handleImageSelect(e));
        
        // Upload area click
        this.uploadArea.addEventListener('click', () => this.imageInput.click());
        
        // Drag and drop events
        this.uploadArea.addEventListener('dragover', (e) => this.handleDragOver(e));
        this.uploadArea.addEventListener('dragleave', (e) => this.handleDragLeave(e));
        this.uploadArea.addEventListener('drop', (e) => this.handleDrop(e));
        
        // Add text button (still works as before)
        this.addTextBtn.addEventListener('click', () => this.addTextAtCenter());
        
        // Download button
        this.downloadBtn.addEventListener('click', () => this.downloadMeme());
        
        // Canvas wrapper click events for creating text boxes
        this.canvasWrapper.addEventListener('mousedown', (e) => this.handleWrapperMouseDown(e));
        this.canvasWrapper.addEventListener('mousemove', (e) => this.handleWrapperMouseMove(e));
        this.canvasWrapper.addEventListener('mouseup', () => this.handleWrapperMouseUp());
        this.canvasWrapper.addEventListener('mouseleave', () => this.handleWrapperMouseUp());
        
        // Canvas touch events for mobile
        this.canvasWrapper.addEventListener('touchstart', (e) => this.handleWrapperTouchStart(e));
        this.canvasWrapper.addEventListener('touchmove', (e) => this.handleWrapperTouchMove(e));
        this.canvasWrapper.addEventListener('touchend', () => this.handleWrapperTouchEnd());
        
        // Click outside to deselect
        document.addEventListener('click', (e) => this.handleDocumentClick(e));
        
        // Update canvas scale on window resize
        window.addEventListener('resize', () => {
            if (this.image) {
                this.updateCanvasScale();
                this.updateAllTextBoxOverlays();
            }
        });
    }
    
    loadTemplates() {
        this.templates.forEach((templatePath, index) => {
            const templateItem = document.createElement('div');
            templateItem.className = 'template-item';
            templateItem.dataset.templateIndex = index;
            
            const img = document.createElement('img');
            img.src = templatePath;
            img.alt = `Template ${index + 1}`;
            img.loading = 'lazy';
            
            // Handle image load error
            img.onerror = () => {
                templateItem.style.display = 'none';
            };
            
            templateItem.appendChild(img);
            templateItem.addEventListener('click', () => this.selectTemplate(templatePath));
            
            this.templatesGrid.appendChild(templateItem);
        });
    }
    
    selectTemplate(templatePath) {
        const img = new Image();
        img.onload = () => {
            this.image = img;
            this.setupCanvas();
            this.canvasSection.style.display = 'flex';
            this.controlsSection.style.display = 'block';
            this.emptyState.style.display = 'none';
            this.render();
        };
        img.onerror = () => {
            alert('Failed to load template image. Please try another template or upload your own image.');
        };
        img.src = templatePath;
    }
    
    handleImageSelect(e) {
        const file = e.target.files[0];
        if (file && file.type.startsWith('image/')) {
            this.loadImage(file);
        }
    }
    
    handleDragOver(e) {
        e.preventDefault();
        this.uploadArea.classList.add('dragover');
    }
    
    handleDragLeave(e) {
        e.preventDefault();
        this.uploadArea.classList.remove('dragover');
    }
    
    handleDrop(e) {
        e.preventDefault();
        this.uploadArea.classList.remove('dragover');
        
        const file = e.dataTransfer.files[0];
        if (file && file.type.startsWith('image/')) {
            this.loadImage(file);
        }
    }
    
    loadImage(file) {
        const reader = new FileReader();
        reader.onload = (e) => {
            const img = new Image();
            img.onload = () => {
                this.image = img;
                this.setupCanvas();
                this.canvasSection.style.display = 'flex';
                this.controlsSection.style.display = 'block';
                this.emptyState.style.display = 'none';
                this.render();
            };
            img.src = e.target.result;
        };
        reader.readAsDataURL(file);
    }
    
    setupCanvas() {
        // Set canvas size to match image, but limit max dimensions
        const maxWidth = 800;
        const maxHeight = 600;
        
        let width = this.image.width;
        let height = this.image.height;
        
        // Scale down if too large
        if (width > maxWidth || height > maxHeight) {
            const ratio = Math.min(maxWidth / width, maxHeight / height);
            width = width * ratio;
            height = height * ratio;
        }
        
        this.canvas.width = width;
        this.canvas.height = height;
        
        // Update canvas scale for overlay positioning
        setTimeout(() => {
            this.updateCanvasScale();
            this.updateAllTextBoxOverlays();
        }, 0);
    }
    
    updateCanvasScale() {
        const rect = this.canvas.getBoundingClientRect();
        if (rect.width > 0 && rect.height > 0) {
            this.canvasScale.x = this.canvas.width / rect.width;
            this.canvasScale.y = this.canvas.height / rect.height;
            
            // Update overlay container size to match canvas display size
            if (this.textBoxesOverlay) {
                this.textBoxesOverlay.style.width = `${rect.width}px`;
                this.textBoxesOverlay.style.height = `${rect.height}px`;
            }
        }
    }
    
    addText(x, y, width = 200, height = 80) {
        const textId = this.nextTextId++;
        const textObj = {
            id: textId,
            content: 'Your Text Here',
            x: x || this.canvas.width / 2,
            y: y || this.canvas.height / 2,
            width: width,
            height: height,
            fontSize: this.calculateFontSize(width, height),
            fontFamily: 'Impact, Arial Black, sans-serif',
            color: '#ffffff'
        };
        
        this.texts.push(textObj);
        this.createTextBoxOverlay(textObj);
        this.createTextControl(textObj);
        this.selectText(textObj);
        this.render();
    }
    
    addTextAtCenter() {
        this.addText(this.canvas.width / 2, this.canvas.height / 2);
    }
    
    calculateFontSize(width, height) {
        // Calculate font size based on text box dimensions
        const minDimension = Math.min(width, height);
        return Math.max(20, Math.min(100, minDimension * 0.3));
    }
    
    createTextBoxOverlay(textObj) {
        this.updateCanvasScale();
        const textBox = document.createElement('div');
        textBox.className = 'text-box-overlay';
        textBox.dataset.textId = textObj.id;
        
        // Add 0.5px padding/edge around the text (1px total width/height increase)
        const edgePadding = 0.5; // 0.5px padding in display pixels
        
        // Calculate position relative to canvas display size
        // Make overlay slightly larger to account for padding
        const left = (textObj.x - textObj.width / 2) / this.canvasScale.x - edgePadding;
        const top = (textObj.y - textObj.height / 2) / this.canvasScale.y - edgePadding;
        const width = textObj.width / this.canvasScale.x + (edgePadding * 2);
        const height = textObj.height / this.canvasScale.y + (edgePadding * 2);
        
        textBox.style.left = `${left}px`;
        textBox.style.top = `${top}px`;
        textBox.style.width = `${width}px`;
        textBox.style.height = `${height}px`;
        
        // Create delete button
        const deleteBtn = document.createElement('button');
        deleteBtn.className = 'text-box-delete';
        deleteBtn.innerHTML = '×';
        deleteBtn.onclick = (e) => {
            e.stopPropagation();
            e.preventDefault();
            this.removeText(textObj.id);
        };
        
        // Create resize handles (four corners)
        const handles = ['nw', 'ne', 'sw', 'se'];
        handles.forEach(handle => {
            const handleEl = document.createElement('div');
            handleEl.className = `resize-handle resize-handle-${handle}`;
            handleEl.dataset.handle = handle;
            textBox.appendChild(handleEl);
        });
        
        textBox.appendChild(deleteBtn);
        textBox.onclick = (e) => {
            e.stopPropagation();
            this.selectText(textObj);
        };
        
        this.textBoxesOverlay.appendChild(textBox);
    }
    
    updateTextBoxOverlay(textObj) {
        const textBox = this.textBoxesOverlay.querySelector(`[data-text-id="${textObj.id}"]`);
        if (!textBox) return;
        
        this.updateCanvasScale();
        // Add 0.5px padding/edge around the text (1px total width/height increase)
        const edgePadding = 0.5; // 0.5px padding in display pixels
        
        // Calculate position relative to canvas display size
        // Make overlay slightly larger to account for padding
        const left = (textObj.x - textObj.width / 2) / this.canvasScale.x - edgePadding;
        const top = (textObj.y - textObj.height / 2) / this.canvasScale.y - edgePadding;
        const width = textObj.width / this.canvasScale.x + (edgePadding * 2);
        const height = textObj.height / this.canvasScale.y + (edgePadding * 2);
        
        textBox.style.left = `${left}px`;
        textBox.style.top = `${top}px`;
        textBox.style.width = `${width}px`;
        textBox.style.height = `${height}px`;
    }
    
    updateAllTextBoxOverlays() {
        this.texts.forEach(text => {
            this.updateTextBoxOverlay(text);
        });
    }
    
    selectText(textObj) {
        // Deselect previous
        if (this.selectedTextBoxElement) {
            this.selectedTextBoxElement.classList.remove('selected');
        }
        
        this.selectedText = textObj;
        this.selectedTextBoxElement = this.textBoxesOverlay.querySelector(`[data-text-id="${textObj.id}"]`);
        if (this.selectedTextBoxElement) {
            this.selectedTextBoxElement.classList.add('selected');
        }
        
        // Highlight corresponding control
        const controlItem = document.querySelector(`[data-text-id="${textObj.id}"].text-control-item`);
        if (controlItem) {
            document.querySelectorAll('.text-control-item').forEach(item => {
                item.classList.remove('active');
            });
            controlItem.classList.add('active');
        }
    }
    
    deselectText() {
        if (this.selectedTextBoxElement) {
            this.selectedTextBoxElement.classList.remove('selected');
        }
        this.selectedText = null;
        this.selectedTextBoxElement = null;
        
        document.querySelectorAll('.text-control-item').forEach(item => {
            item.classList.remove('active');
        });
    }
    
    wrapText(text) {
        if (!text.content || text.content.trim() === '') {
            return [''];
        }
        
        const maxWidth = text.width * 0.9; // Use 90% of text box width
        
        // Split text into words
        const words = text.content.split(' ');
        const lines = [];
        
        if (words.length === 0) {
            return [''];
        }
        
        let currentLine = words[0];
        this.ctx.font = `${text.fontSize}px ${text.fontFamily}`;
        
        // Handle single word that's too long
        const singleWordWidth = this.ctx.measureText(currentLine).width;
        if (singleWordWidth > maxWidth && words.length === 1) {
            // For very long single words, we can't break them, so return as-is
            return [currentLine];
        }
        
        for (let i = 1; i < words.length; i++) {
            const word = words[i];
            const testLine = currentLine + ' ' + word;
            const metrics = this.ctx.measureText(testLine);
            const testWidth = metrics.width;
            
            if (testWidth > maxWidth && currentLine.length > 0) {
                lines.push(currentLine);
                currentLine = word;
            } else {
                currentLine = testLine;
            }
        }
        lines.push(currentLine);
        
        return lines;
    }
    
    createTextControl(textObj) {
        const controlItem = document.createElement('div');
        controlItem.className = 'text-control-item';
        controlItem.dataset.textId = textObj.id;
        
        controlItem.innerHTML = `
            <div class="control-group">
                <input type="text" class="text-input" data-field="content" value="${textObj.content}" 
                       placeholder="Text ${textObj.id}"
                       oninput="memeGenerator.updateText(${textObj.id}, 'content', this.value)">
            </div>
            <div class="control-group">
                <input type="color" class="color-input" value="${textObj.color}" 
                       onchange="memeGenerator.updateText(${textObj.id}, 'color', this.value)">
            </div>
            <button class="remove-text-btn" onclick="memeGenerator.removeText(${textObj.id})" title="Remove text">×</button>
        `;
        
        controlItem.onclick = () => this.selectText(textObj);
        
        this.textControlsList.appendChild(controlItem);
    }
    
    updateText(id, field, value) {
        const textObj = this.texts.find(t => t.id === id);
        if (textObj) {
            if (field === 'fontSize' || field === 'width' || field === 'height') {
                textObj[field] = parseInt(value);
            } else {
                textObj[field] = value;
            }
            
            // Auto-adjust font size when width/height changes
            if (field === 'width' || field === 'height') {
                textObj.fontSize = this.calculateFontSize(textObj.width, textObj.height);
            }
            
            this.updateTextBoxOverlay(textObj);
            this.render();
        }
    }
    
    removeText(id) {
        // Remove from texts array
        this.texts = this.texts.filter(t => t.id !== id);
        
        // Remove overlay
        const overlay = this.textBoxesOverlay.querySelector(`[data-text-id="${id}"]`);
        if (overlay) {
            overlay.remove();
        }
        
        // Remove control
        const controlItem = document.querySelector(`[data-text-id="${id}"].text-control-item`);
        if (controlItem) {
            controlItem.remove();
        }
        
        // Deselect if this was selected
        if (this.selectedText && this.selectedText.id === id) {
            this.deselectText();
        }
        
        this.render();
    }
    
    getCanvasCoordinates(e) {
        const rect = this.canvas.getBoundingClientRect();
        
        if (e.touches) {
            // Touch event
            return {
                x: (e.touches[0].clientX - rect.left) * this.canvasScale.x,
                y: (e.touches[0].clientY - rect.top) * this.canvasScale.y
            };
        } else {
            // Mouse event
            return {
                x: (e.clientX - rect.left) * this.canvasScale.x,
                y: (e.clientY - rect.top) * this.canvasScale.y
            };
        }
    }
    
    getTextAtPosition(x, y) {
        // Check texts in reverse order (top to bottom)
        for (let i = this.texts.length - 1; i >= 0; i--) {
            const text = this.texts[i];
            
            const left = text.x - text.width / 2;
            const right = text.x + text.width / 2;
            const top = text.y - text.height / 2;
            const bottom = text.y + text.height / 2;
            
            if (x >= left && x <= right && y >= top && y <= bottom) {
                return text;
            }
        }
        return null;
    }
    
    isResizeHandle(element) {
        return element && element.classList.contains('resize-handle');
    }
    
    handleWrapperMouseDown(e) {
        // Check if clicking on resize handle
        if (this.isResizeHandle(e.target)) {
            e.stopPropagation();
            e.preventDefault();
            this.isResizing = true;
            this.resizeHandle = e.target.dataset.handle;
            const textBox = e.target.closest('.text-box-overlay');
            if (textBox) {
                const textId = parseInt(textBox.dataset.textId);
                const text = this.texts.find(t => t.id === textId);
                if (text) {
                    this.selectText(text);
                    this.selectedText = text;
                }
            }
            return;
        }
        
        // Check if clicking on text box overlay
        const textBox = e.target.closest('.text-box-overlay');
        if (textBox) {
            e.stopPropagation();
            const textId = parseInt(textBox.dataset.textId);
            const text = this.texts.find(t => t.id === textId);
            if (text) {
                this.selectText(text);
                this.isDragging = true;
                const coords = this.getCanvasCoordinates(e);
                this.dragOffset = {
                    x: coords.x - text.x,
                    y: coords.y - text.y
                };
            }
            return;
        }
        
        // Check if clicking on canvas (not on text box)
        if (e.target === this.canvas) {
            const coords = this.getCanvasCoordinates(e);
            const text = this.getTextAtPosition(coords.x, coords.y);
            
            if (text) {
                this.selectText(text);
                this.isDragging = true;
                this.dragOffset = {
                    x: coords.x - text.x,
                    y: coords.y - text.y
                };
            } else {
                // Click on empty space - create new text box
                this.addText(coords.x, coords.y);
            }
        }
    }
    
    handleWrapperMouseMove(e) {
        if (this.isResizing && this.selectedText && this.resizeHandle) {
            const coords = this.getCanvasCoordinates(e);
            const left = this.selectedText.x - this.selectedText.width / 2;
            const top = this.selectedText.y - this.selectedText.height / 2;
            const right = this.selectedText.x + this.selectedText.width / 2;
            const bottom = this.selectedText.y + this.selectedText.height / 2;
            
            let newLeft = left;
            let newTop = top;
            let newRight = right;
            let newBottom = bottom;
            
            switch (this.resizeHandle) {
                case 'nw':
                    newLeft = Math.min(coords.x, right - 50);
                    newTop = Math.min(coords.y, bottom - 30);
                    break;
                case 'ne':
                    newRight = Math.max(coords.x, left + 50);
                    newTop = Math.min(coords.y, bottom - 30);
                    break;
                case 'sw':
                    newLeft = Math.min(coords.x, right - 50);
                    newBottom = Math.max(coords.y, top + 30);
                    break;
                case 'se':
                    newRight = Math.max(coords.x, left + 50);
                    newBottom = Math.max(coords.y, top + 30);
                    break;
            }
            
            const newWidth = newRight - newLeft;
            const newHeight = newBottom - newTop;
            const newX = (newLeft + newRight) / 2;
            const newY = (newTop + newBottom) / 2;
            
            this.selectedText.width = newWidth;
            this.selectedText.height = newHeight;
            this.selectedText.x = newX;
            this.selectedText.y = newY;
            this.selectedText.fontSize = this.calculateFontSize(newWidth, newHeight);
            
            this.updateTextBoxOverlay(this.selectedText);
            this.render();
        } else if (this.isDragging && this.selectedText) {
            const coords = this.getCanvasCoordinates(e);
            this.selectedText.x = coords.x - this.dragOffset.x;
            this.selectedText.y = coords.y - this.dragOffset.y;
            
            this.updateTextBoxOverlay(this.selectedText);
            this.render();
        }
    }
    
    handleWrapperMouseUp() {
        this.isDragging = false;
        this.isResizing = false;
        this.resizeHandle = null;
    }
    
    handleWrapperTouchStart(e) {
        e.preventDefault();
        // Similar logic to mouse down but for touch
        const textBox = e.target.closest('.text-box-overlay');
        if (textBox) {
            const textId = parseInt(textBox.dataset.textId);
            const text = this.texts.find(t => t.id === textId);
            if (text) {
                this.selectText(text);
                this.isDragging = true;
                const coords = this.getCanvasCoordinates(e);
                this.dragOffset = {
                    x: coords.x - text.x,
                    y: coords.y - text.y
                };
            }
        } else if (e.target === this.canvas) {
            const coords = this.getCanvasCoordinates(e);
            const text = this.getTextAtPosition(coords.x, coords.y);
            
            if (text) {
                this.selectText(text);
                this.isDragging = true;
                this.dragOffset = {
                    x: coords.x - text.x,
                    y: coords.y - text.y
                };
            } else {
                this.addText(coords.x, coords.y);
            }
        }
    }
    
    handleWrapperTouchMove(e) {
        e.preventDefault();
        if (this.isDragging && this.selectedText) {
            const coords = this.getCanvasCoordinates(e);
            this.selectedText.x = coords.x - this.dragOffset.x;
            this.selectedText.y = coords.y - this.dragOffset.y;
            
            this.updateTextBoxOverlay(this.selectedText);
            this.render();
        }
    }
    
    handleWrapperTouchEnd(e) {
        e.preventDefault();
        this.isDragging = false;
        this.isResizing = false;
        this.resizeHandle = null;
    }
    
    handleDocumentClick(e) {
        // Deselect if clicking outside canvas wrapper
        if (!this.canvasWrapper.contains(e.target) && 
            !e.target.closest('.text-control-item') &&
            !e.target.closest('.bottom-toolbar')) {
            this.deselectText();
        }
    }
    
    render() {
        if (!this.image) return;
        
        // Clear canvas
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Draw image
        this.ctx.drawImage(this.image, 0, 0, this.canvas.width, this.canvas.height);
        
        // Draw all texts
        this.texts.forEach(text => {
            this.drawText(text);
        });
    }
    
    drawText(text) {
        this.ctx.font = `${text.fontSize}px ${text.fontFamily}`;
        this.ctx.textAlign = 'center';
        this.ctx.textBaseline = 'middle';
        
        // Wrap text into multiple lines
        const maxWidth = text.maxWidth || this.canvas.width * 0.9;
        const lines = this.wrapText(text, maxWidth);
        const lineHeight = text.fontSize * 1.2; // Line spacing
        const totalHeight = lines.length * lineHeight;
        
        // Starting Y position (centered)
        let y = text.y - (totalHeight / 2) + (lineHeight / 2);
        
        // Draw black stroke (border) - made thicker
        this.ctx.strokeStyle = 'black';
        this.ctx.lineWidth = Math.max(5, text.fontSize / 8);
        this.ctx.lineJoin = 'round';
        this.ctx.miterLimit = 2;
        
        // Draw fill with selected color
        this.ctx.fillStyle = text.color || '#ffffff';
        
        // Draw each line
        lines.forEach(line => {
            // Draw stroke
            this.ctx.strokeText(line, text.x, y);
            // Draw fill
            this.ctx.fillText(line, text.x, y);
            y += lineHeight;
        });
    }
    
    downloadMeme() {
        if (!this.image || this.texts.length === 0) {
            alert('Please add an image and at least one text element before downloading.');
            return;
        }
        
        // Create download link
        this.canvas.toBlob((blob) => {
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `meme-${Date.now()}.png`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
        }, 'image/png');
    }
}

// Initialize the meme generator when page loads
let memeGenerator;
window.addEventListener('DOMContentLoaded', () => {
    memeGenerator = new MemeGenerator();
});

