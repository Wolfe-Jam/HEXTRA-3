import { LUMINANCE_METHODS } from '../constants';

// Image processing utilities using Canvas API
export const processImage = async (imageUrl, color, luminanceMethod = 'average') => {
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
          // Calculate single luminance value for all channels
          const luminance = LUMINANCE_METHODS[luminanceMethod].calculate(red, green, blue);
          
          // Apply same luminance to each channel of target color
          data[i] = Math.round(rgb.r * luminance);
          data[i + 1] = Math.round(rgb.g * luminance);
          data[i + 2] = Math.round(rgb.b * luminance);
        }
      }
      
      // Put processed data back
      ctx.putImageData(imageData, 0, 0);
      
      // Get result as PNG data URL
      resolve(canvas.toDataURL('image/png'));
    };
    
    img.onerror = reject;
    img.src = imageUrl;
  });
};

// Convert hex color to RGB
export const hexToRgb = (hex) => {
  // Remove the hash if present
  hex = hex.replace('#', '');
  
  // Parse the hex values
  const r = parseInt(hex.substring(0, 2), 16);
  const g = parseInt(hex.substring(2, 4), 16);
  const b = parseInt(hex.substring(4, 6), 16);
  
  return { r, g, b };
};
