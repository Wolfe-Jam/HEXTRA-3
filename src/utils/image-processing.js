import { LUMINANCE_METHODS } from '../constants/luminance';
import Jimp from 'jimp';

// Process image with color
export const processImage = async (imageUrl, color, luminanceMethod = 'NATURAL') => {
  if (!imageUrl) return null;
  
  try {
    // Load image data
    const response = await fetch(imageUrl);
    const blob = await response.blob();
    const buffer = await blob.arrayBuffer();
    
    // Create Jimp image
    const jimpImage = await Jimp.read(Buffer.from(buffer));
    
    // Process image with color
    jimpImage.scan(0, 0, jimpImage.bitmap.width, jimpImage.bitmap.height, function(x, y, idx) {
      const red = this.bitmap.data[idx + 0];
      const green = this.bitmap.data[idx + 1];
      const blue = this.bitmap.data[idx + 2];
      const alpha = this.bitmap.data[idx + 3];
      
      if (alpha > 0) {
        // Calculate single luminance value for all channels
        const luminance = LUMINANCE_METHODS[luminanceMethod].calculate(red, green, blue);
        const rgb = hexToRgb(color);
        
        // Apply same luminance to each channel of target color
        this.bitmap.data[idx + 0] = Math.round(rgb.r * luminance);
        this.bitmap.data[idx + 1] = Math.round(rgb.g * luminance);
        this.bitmap.data[idx + 2] = Math.round(rgb.b * luminance);
      }
    });

    // Get base64 URL
    return new Promise((resolve, reject) => {
      jimpImage.getBase64(Jimp.MIME_PNG, (err, base64) => {
        if (err) reject(err);
        else resolve(base64);
      });
    });
  } catch (error) {
    console.error('Error processing image:', error);
    throw error;
  }
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
