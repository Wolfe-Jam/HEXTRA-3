// Bridge between HEXTRA and Voidbox using Canvas

export class CanvasBridge {
  constructor(canvasElement) {
    this.canvas = canvasElement;
    this.ctx = canvasElement.getContext('2d');
  }

  // HEXTRA → Voidbox
  async sendToVoidbox(options = {}) {
    // Get current canvas state
    const imageData = this.canvas.toDataURL('image/png');
    
    // Send to Voidbox with alpha channel preserved
    const response = await fetch('/api/bridge/to-voidbox', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        image: imageData,
        preserveAlpha: true,
        ...options
      })
    });

    return response.json();
  }

  // Voidbox → HEXTRA
  async receiveFromVoidbox(voidboxImage) {
    // Load Voidbox image into new Image object
    const img = new Image();
    img.src = voidboxImage.url;
    
    await new Promise(resolve => {
      img.onload = () => {
        // Resize canvas if needed
        this.canvas.width = img.width;
        this.canvas.height = img.height;
        
        // Draw with alpha preservation
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.ctx.drawImage(img, 0, 0);
        
        resolve();
      };
    });

    // Return canvas data for HEXTRA processing
    return this.ctx.getImageData(0, 0, this.canvas.width, this.canvas.height);
  }

  // Composite HEXTRA + Voidbox
  async composite(hextraLayer, voidboxLayer) {
    // Clear canvas
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    
    // Draw Voidbox layer (e.g., ZBG with alpha)
    if (voidboxLayer) {
      this.ctx.drawImage(voidboxLayer, 0, 0);
    }
    
    // Composite HEXTRA layer with blend mode
    if (hextraLayer) {
      this.ctx.globalCompositeOperation = 'source-over';
      this.ctx.drawImage(hextraLayer, 0, 0);
    }

    return this.canvas.toDataURL('image/png');
  }

  // Get current canvas state for either system
  getImageData(format = 'png') {
    return this.canvas.toDataURL(`image/${format}`);
  }
}
