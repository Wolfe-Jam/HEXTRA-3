// Image processing utilities using Canvas API
export const processImage = async (imageUrl, color) => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    
    img.onload = () => {
      // Create canvas
      const canvas = document.createElement('canvas');
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext('2d');
      
      // Draw original image
      ctx.drawImage(img, 0, 0);
      
      // Get image data
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const data = imageData.data;
      
      // Convert color to RGB
      const rgb = hexToRgb(color);
      
      // Process each pixel
      for (let i = 0; i < data.length; i += 4) {
        const red = data[i];
        const green = data[i + 1];
        const blue = data[i + 2];
        const alpha = data[i + 3];
        
        if (alpha > 0) {
          // Calculate luminance (grayscale)
          const luminance = (red + green + blue) / 3 / 255;
          
          // Apply color
          data[i] = Math.round(rgb.r * luminance);
          data[i + 1] = Math.round(rgb.g * luminance);
          data[i + 2] = Math.round(rgb.b * luminance);
        }
      }
      
      // Put processed data back
      ctx.putImageData(imageData, 0, 0);
      
      // Get result as data URL
      resolve(canvas.toDataURL('image/png'));
    };
    
    img.onerror = reject;
    img.src = imageUrl;
  });
};

// Convert hex color to RGB
export const hexToRgb = (hex) => {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16)
  } : null;
};
