import Jimp from 'jimp';

// Convert hex color to RGB
export const hexToRgb = (hex) => {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16)
  } : null;
};

// Process image with color
export const processImage = async (imageUrl, color) => {
  try {
    const image = await Jimp.read(imageUrl);
    const { r, g, b } = hexToRgb(color);
    
    image.scan(0, 0, image.bitmap.width, image.bitmap.height, function(x, y, idx) {
      // Get the average of RGB values to determine grayscale value
      const gray = (this.bitmap.data[idx] + this.bitmap.data[idx + 1] + this.bitmap.data[idx + 2]) / 3;
      
      // Apply the color while preserving luminance
      this.bitmap.data[idx] = Math.round(r * (gray / 255));
      this.bitmap.data[idx + 1] = Math.round(g * (gray / 255));
      this.bitmap.data[idx + 2] = Math.round(b * (gray / 255));
    });
    
    // Convert to base64
    const base64 = await image.getBase64Async(Jimp.MIME_PNG);
    return base64;
  } catch (error) {
    console.error('Error processing image:', error);
    throw error;
  }
};
