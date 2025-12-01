// Meme Generator Application
class MemeGenerator {
    constructor() {
        this.canvas = document.getElementById('memeCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.imageInput = document.getElementById('imageInput');
        this.uploadArea = document.getElementById('uploadArea');
        this.canvasSection = document.getElementById('canvasSection');
        this.controlsSection = document.getElementById('controlsSection');
        this.addTextBtn = document.getElementById('addTextBtn');
        this.downloadBtn = document.getElementById('downloadBtn');
        this.textControlsList = document.getElementById('textControlsList');
        this.templatesGrid = document.getElementById('templatesGrid');
        
        this.image = null;
        this.texts = [];
        this.nextTextId = 1;
        this.selectedText = null;
        this.isDragging = false;
        this.dragOffset = { x: 0, y: 0 };
        
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
        
        // Add text button
        this.addTextBtn.addEventListener('click', () => this.addText());
        
        // Download button
        this.downloadBtn.addEventListener('click', () => this.downloadMeme());
        
        // Canvas mouse events for dragging text
        this.canvas.addEventListener('mousedown', (e) => this.handleMouseDown(e));
        this.canvas.addEventListener('mousemove', (e) => this.handleMouseMove(e));
        this.canvas.addEventListener('mouseup', () => this.handleMouseUp());
        this.canvas.addEventListener('mouseleave', () => this.handleMouseUp());
        
        // Canvas touch events for mobile
        this.canvas.addEventListener('touchstart', (e) => this.handleTouchStart(e));
        this.canvas.addEventListener('touchmove', (e) => this.handleTouchMove(e));
        this.canvas.addEventListener('touchend', () => this.handleTouchEnd());
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
            this.canvasSection.style.display = 'block';
            this.controlsSection.style.display = 'block';
            this.render();
            
            // Scroll to canvas section
            this.canvasSection.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
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
                this.canvasSection.style.display = 'block';
                this.controlsSection.style.display = 'block';
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
    }
    
    addText() {
        const textId = this.nextTextId++;
        const textObj = {
            id: textId,
            content: 'Your Text Here',
            x: this.canvas.width / 2,
            y: this.canvas.height / 2,
            fontSize: 40,
            fontFamily: 'Impact, Arial Black, sans-serif',
            color: '#ffffff',
            maxWidth: this.canvas.width * 0.9 // Default to 90% of canvas width
        };
        
        this.texts.push(textObj);
        this.createTextControl(textObj);
        this.render();
    }
    
    wrapText(text, maxWidth) {
        if (!text.content || text.content.trim() === '') {
            return [''];
        }
        
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
            <div class="text-control-header">
                <h3>Text ${textObj.id}</h3>
                <button class="remove-text-btn" onclick="memeGenerator.removeText(${textObj.id})">Remove</button>
            </div>
            <div class="control-group">
                <label>Text Content</label>
                <input type="text" class="text-input" data-field="content" value="${textObj.content}" 
                       oninput="memeGenerator.updateText(${textObj.id}, 'content', this.value)">
            </div>
            <div class="control-group">
                <label>Font Size</label>
                <div class="size-control">
                    <input type="range" class="size-slider" min="20" max="100" value="${textObj.fontSize}" 
                           oninput="memeGenerator.updateText(${textObj.id}, 'fontSize', this.value); 
                                    this.nextElementSibling.textContent = this.value + 'px'">
                    <span class="size-value">${textObj.fontSize}px</span>
                </div>
            </div>
            <div class="control-group">
                <label>Text Color</label>
                <input type="color" class="color-input" value="${textObj.color}" 
                       onchange="memeGenerator.updateText(${textObj.id}, 'color', this.value)">
            </div>
            <div class="control-group">
                <label>Max Width (for line wrapping)</label>
                <div class="size-control">
                    <input type="range" class="size-slider" min="100" max="${Math.round(this.canvas.width * 0.95)}" value="${Math.round(textObj.maxWidth || this.canvas.width * 0.9)}" 
                           oninput="memeGenerator.updateText(${textObj.id}, 'maxWidth', this.value); 
                                    this.nextElementSibling.textContent = Math.round(this.value) + 'px'">
                    <span class="size-value">${Math.round(textObj.maxWidth || this.canvas.width * 0.9)}px</span>
                </div>
            </div>
            <div class="position-hint">💡 Click and drag text on canvas to position it. Text automatically wraps to fit width.</div>
        `;
        
        this.textControlsList.appendChild(controlItem);
    }
    
    updateText(id, field, value) {
        const textObj = this.texts.find(t => t.id === id);
        if (textObj) {
            if (field === 'fontSize' || field === 'maxWidth') {
                textObj[field] = parseInt(value);
            } else {
                textObj[field] = value;
            }
            this.render();
        }
    }
    
    removeText(id) {
        this.texts = this.texts.filter(t => t.id !== id);
        const controlItem = document.querySelector(`[data-text-id="${id}"]`);
        if (controlItem) {
            controlItem.remove();
        }
        this.render();
    }
    
    getTextAtPosition(x, y) {
        // Check texts in reverse order (top to bottom)
        for (let i = this.texts.length - 1; i >= 0; i--) {
            const text = this.texts[i];
            this.ctx.font = `${text.fontSize}px ${text.fontFamily}`;
            
            // Get wrapped lines
            const lines = this.wrapText(text, text.maxWidth || this.canvas.width * 0.9);
            const lineHeight = text.fontSize * 1.2; // Line spacing
            const totalHeight = lines.length * lineHeight;
            
            // Calculate bounding box for multi-line text
            let maxWidth = 0;
            lines.forEach(line => {
                const metrics = this.ctx.measureText(line);
                maxWidth = Math.max(maxWidth, metrics.width);
            });
            
            const left = text.x - maxWidth / 2;
            const right = text.x + maxWidth / 2;
            const top = text.y - totalHeight / 2;
            const bottom = text.y + totalHeight / 2;
            
            if (x >= left && x <= right && y >= top && y <= bottom) {
                return text;
            }
        }
        return null;
    }
    
    getCanvasCoordinates(e) {
        const rect = this.canvas.getBoundingClientRect();
        const scaleX = this.canvas.width / rect.width;
        const scaleY = this.canvas.height / rect.height;
        
        if (e.touches) {
            // Touch event
            return {
                x: (e.touches[0].clientX - rect.left) * scaleX,
                y: (e.touches[0].clientY - rect.top) * scaleY
            };
        } else {
            // Mouse event
            return {
                x: (e.clientX - rect.left) * scaleX,
                y: (e.clientY - rect.top) * scaleY
            };
        }
    }
    
    handleMouseDown(e) {
        const coords = this.getCanvasCoordinates(e);
        const text = this.getTextAtPosition(coords.x, coords.y);
        
        if (text) {
            this.selectedText = text;
            this.isDragging = true;
            this.dragOffset = {
                x: coords.x - text.x,
                y: coords.y - text.y
            };
            this.canvas.style.cursor = 'grabbing';
        }
    }
    
    handleMouseMove(e) {
        if (this.isDragging && this.selectedText) {
            const coords = this.getCanvasCoordinates(e);
            this.selectedText.x = coords.x - this.dragOffset.x;
            this.selectedText.y = coords.y - this.dragOffset.y;
            this.render();
        } else {
            // Check if hovering over text
            const coords = this.getCanvasCoordinates(e);
            const text = this.getTextAtPosition(coords.x, coords.y);
            this.canvas.style.cursor = text ? 'grab' : 'crosshair';
        }
    }
    
    handleMouseUp() {
        this.isDragging = false;
        this.selectedText = null;
        this.canvas.style.cursor = 'crosshair';
    }
    
    handleTouchStart(e) {
        e.preventDefault();
        const coords = this.getCanvasCoordinates(e);
        const text = this.getTextAtPosition(coords.x, coords.y);
        
        if (text) {
            this.selectedText = text;
            this.isDragging = true;
            this.dragOffset = {
                x: coords.x - text.x,
                y: coords.y - text.y
            };
        }
    }
    
    handleTouchMove(e) {
        e.preventDefault();
        if (this.isDragging && this.selectedText) {
            const coords = this.getCanvasCoordinates(e);
            this.selectedText.x = coords.x - this.dragOffset.x;
            this.selectedText.y = coords.y - this.dragOffset.y;
            this.render();
        }
    }
    
    handleTouchEnd(e) {
        e.preventDefault();
        this.isDragging = false;
        this.selectedText = null;
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

