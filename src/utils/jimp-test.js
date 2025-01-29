import Jimp from 'jimp';

// Basic Jimp example from docs
export const testJimp = async (imageUrl) => {
  try {
    // Read the image
    const image = await Jimp.read(imageUrl);
    
    console.log('Jimp version:', Jimp.VERSION);
    console.log('Image size:', image.bitmap.width, 'x', image.bitmap.height);

    // Basic operations from Jimp docs
    image
      .quality(85) // Set JPEG quality
      .greyscale() // Convert to greyscale
      .contrast(0.1); // Increase contrast
    
    // Get as base64
    return new Promise((resolve, reject) => {
      image.getBase64(Jimp.MIME_JPEG, (err, base64) => {
        if (err) reject(err);
        else resolve(base64);
      });
    });
  } catch (error) {
    console.error('Jimp test error:', error);
    return null;
  }
};

// Color replacement example from docs
export const replaceColor = async (imageUrl, targetColor) => {
  try {
    const image = await Jimp.read(imageUrl);
    
    // Docs example of color replacement
    image.scan(0, 0, image.bitmap.width, image.bitmap.height, function(x, y, idx) {
      // Get current pixel color
      const red = this.bitmap.data[idx + 0];
      const green = this.bitmap.data[idx + 1];
      const blue = this.bitmap.data[idx + 2];
      const alpha = this.bitmap.data[idx + 3];
      
      if (alpha > 0) { // Only process non-transparent pixels
        // Calculate brightness (from Jimp docs)
        const brightness = (0.2126 * red + 0.7152 * green + 0.0722 * blue) / 255;
        
        // Apply new color with same brightness
        this.bitmap.data[idx + 0] = Math.round(targetColor.r * brightness);
        this.bitmap.data[idx + 1] = Math.round(targetColor.g * brightness);
        this.bitmap.data[idx + 2] = Math.round(targetColor.b * brightness);
        // Alpha remains unchanged
      }
    });

    return new Promise((resolve, reject) => {
      image.getBase64(Jimp.MIME_PNG, (err, base64) => {
        if (err) reject(err);
        else resolve(base64);
      });
    });
  } catch (error) {
    console.error('Color replacement error:', error);
    return null;
  }
};
