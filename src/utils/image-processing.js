import Jimp from 'jimp';

// Luminance calculation methods
export const LUMINANCE_METHODS = {
  NATURAL: {
    calculate: (r, g, b) => {
      return (r * 0.299 + g * 0.587 + b * 0.114) / 255;
    }
  }
};

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
    
    // Create clean copy of original image
    const imageData = {
      width: image.bitmap.width,
      height: image.bitmap.height,
      bitmap: {
        data: new Uint8ClampedArray(image.bitmap.data),
        width: image.bitmap.width,
        height: image.bitmap.height
      }
    };
    
    // Process each pixel
    for (let idx = 0; idx < imageData.bitmap.data.length; idx += 4) {
      const red = imageData.bitmap.data[idx];
      const green = imageData.bitmap.data[idx + 1];
      const blue = imageData.bitmap.data[idx + 2];
      const alpha = imageData.bitmap.data[idx + 3];
      
      if (alpha > 0) {
        // Calculate NATURAL luminance
        const luminance = LUMINANCE_METHODS.NATURAL.calculate(red, green, blue);
        
        // Apply same luminance to each channel
        imageData.bitmap.data[idx] = Math.round(r * luminance);
        imageData.bitmap.data[idx + 1] = Math.round(g * luminance);
        imageData.bitmap.data[idx + 2] = Math.round(b * luminance);
      }
    }
    
    // Update image with processed data
    image.bitmap.data = Buffer.from(imageData.bitmap.data);
    
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
