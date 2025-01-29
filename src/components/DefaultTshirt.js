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
        
        // Convert to data URL
        const dataUrl = canvas.toDataURL('image/png');
        
        // Use Jimp.read with the data URL
        Jimp.read(dataUrl)
          .then(image => {
            resolve(image);
          })
          .catch(error => {
            console.error('Error reading image with Jimp:', error);
            reject(error);
          });
      } catch (error) {
        console.error('Error creating canvas:', error);
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
