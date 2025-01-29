import React from 'react';

// Pre-optimized default t-shirt image
const DEFAULT_TSHIRT_URL = '/images/default-tshirt.webp';

export function loadDefaultImage() {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    
    img.onload = () => {
      // Create a canvas to get data URL
      const canvas = document.createElement('canvas');
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0);
      
      // Get data URL
      const dataUrl = canvas.toDataURL('image/png');
      resolve(dataUrl);
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
    loadDefaultImage()
      .then(dataUrl => {
        // Create a fake File object that matches what the app expects
        fetch(dataUrl)
          .then(res => res.blob())
          .then(blob => {
            const file = new File([blob], 'default-tshirt.png', { type: 'image/png' });
            onLoad(file, dataUrl);
          })
          .catch(error => {
            console.error('Error creating file:', error);
          });
      })
      .catch(error => {
        console.error('Failed to load default t-shirt:', error);
      });
  }, [onLoad]);
  
  return null; // This component doesn't render anything
}
