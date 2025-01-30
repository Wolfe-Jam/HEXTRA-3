import Jimp from 'jimp';

// Cache for processed images
const processedImageCache = new Map();

// Convert hex color to RGB with caching
const rgbCache = new Map();
export const hexToRgb = (hex) => {
  if (rgbCache.has(hex)) {
    return rgbCache.get(hex);
  }
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  const rgb = result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16)
  } : null;
  rgbCache.set(hex, rgb);
  return rgb;
};

// Process image with color
export const processImage = async (imageUrl, color) => {
  const cacheKey = `${imageUrl}-${color}`;
  
  // Check cache first
  if (processedImageCache.has(cacheKey)) {
    return processedImageCache.get(cacheKey);
  }
  
  try {
    const image = await Jimp.read(imageUrl);
    const { r, g, b } = hexToRgb(color);
    
    // Pre-calculate division
    const inv255 = 1 / 255;
    
    // Use Uint8Array for better performance
    const { data } = image.bitmap;
    const buffer = new Uint8Array(data.buffer);
    
    for (let i = 0; i < buffer.length; i += 4) {
      // Fast grayscale calculation
      const gray = (buffer[i] + buffer[i + 1] + buffer[i + 2]) * inv255 * 0.333333;
      
      // Direct buffer manipulation
      buffer[i] = r * gray;
      buffer[i + 1] = g * gray;
      buffer[i + 2] = b * gray;
    }
    
    // Convert to base64
    const base64 = await image.getBase64Async(Jimp.MIME_PNG);
    
    // Cache the result
    processedImageCache.set(cacheKey, base64);
    
    // Limit cache size to prevent memory issues
    if (processedImageCache.size > 50) {
      const firstKey = processedImageCache.keys().next().value;
      processedImageCache.delete(firstKey);
    }
    
    return base64;
  } catch (error) {
    console.error('Error processing image:', error);
    throw error;
  }
};
