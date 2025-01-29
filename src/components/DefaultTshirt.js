import React from 'react';
import Jimp from '../utils/jimp-init';

// Pre-optimized default t-shirt image
const DEFAULT_TSHIRT_URL = '/images/default-tshirt.webp';

export function createDefaultTshirt() {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    
    img.onload = () => {
      try {
        // Create a canvas to get pixel data
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0);
        
        // Get image data
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        
        // Create Jimp image from raw data
        const image = new Jimp({
          data: Buffer.from(imageData.data),
          width: imageData.width,
          height: imageData.height
        });
        
        resolve(image);
      } catch (error) {
        console.error('Error creating Jimp image:', error);
        reject(error);
      }
    };
    
    img.onerror = (error) => {
      console.error('Error loading image:', error);
      reject(error);
    };
    
    img.src = DEFAULT_TSHIRT_URL;
  });
}

export default function DefaultTshirt({ onLoad }) {
  React.useEffect(() => {
    createDefaultTshirt()
      .then(onLoad)
      .catch(error => {
        console.error('Failed to load default t-shirt:', error);
      });
  }, [onLoad]);
  
  return null; // This component doesn't render anything
}
