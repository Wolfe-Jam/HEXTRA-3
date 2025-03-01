import JimpModule from 'jimp';
import { Buffer } from 'buffer';

// Handle different import formats
const Jimp = JimpModule.default || JimpModule;

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
  
  console.log(`Processing image with color: ${color}`);
  
  // Check cache first
  if (processedImageCache.has(cacheKey)) {
    console.log(`Using cached image for ${color}`);
    return processedImageCache.get(cacheKey);
  }
  
  try {
    console.log('Reading image from URL...');
    
    // For relative paths, we need to convert to absolute
    let absoluteUrl = imageUrl;
    if (imageUrl.startsWith('/')) {
      absoluteUrl = window.location.origin + imageUrl;
    }
    
    // Use fetch API to get the image data first
    const response = await fetch(absoluteUrl);
    if (!response.ok) {
      throw new Error(`Failed to fetch image: ${response.status} ${response.statusText}`);
    }
    
    const blob = await response.blob();
    const arrayBuffer = await blob.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    
    // Use a simpler approach - create Image element with blob
    const imgBlob = URL.createObjectURL(blob);
    const img = new Image();
    
    // Load image from blob URL
    await new Promise((resolve, reject) => {
      img.onload = resolve;
      img.onerror = reject;
      img.src = imgBlob;
    });
    
    // Create canvas to process the image
    const canvas = document.createElement('canvas');
    canvas.width = img.width;
    canvas.height = img.height;
    const ctx = canvas.getContext('2d');
    
    // Draw original image
    ctx.drawImage(img, 0, 0);
    
    // Get image data
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    
    // Get the RGB values from the color
    const rgbData = hexToRgb(color);
    if (!rgbData) {
      throw new Error(`Invalid color format: ${color}`);
    }
    
    const { r, g, b } = rgbData;
    console.log(`Color RGB: ${r}, ${g}, ${b}`);
    
    // Process each pixel with color
    for (let idx = 0; idx < imageData.data.length; idx += 4) {
      const red = imageData.data[idx];
      const green = imageData.data[idx + 1];
      const blue = imageData.data[idx + 2];
      const alpha = imageData.data[idx + 3];
      
      if (alpha > 0) {
        // Calculate NATURAL luminance
        const luminance = LUMINANCE_METHODS.NATURAL.calculate(red, green, blue);
        
        // Apply same luminance to each channel
        imageData.data[idx] = Math.round(r * luminance);
        imageData.data[idx + 1] = Math.round(g * luminance);
        imageData.data[idx + 2] = Math.round(b * luminance);
      }
    }
    
    // Put processed image data back to canvas
    ctx.putImageData(imageData, 0, 0);
    
    // Convert canvas to data URL
    const processedDataUrl = canvas.toDataURL('image/png');
    
    // Clean up blob URL
    URL.revokeObjectURL(imgBlob);
    
    // Cache the result
    processedImageCache.set(cacheKey, processedDataUrl);
    
    // Limit cache size to prevent memory issues
    if (processedImageCache.size > 50) {
      const firstKey = processedImageCache.keys().next().value;
      processedImageCache.delete(firstKey);
    }
    
    return processedDataUrl;
  } catch (error) {
    console.error('Error processing image:', error);
    throw error;
  }
};
