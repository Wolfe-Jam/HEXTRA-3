import React, { useEffect } from 'react';

// Pre-optimized default t-shirt image 
const DEFAULT_TSHIRT_URL = '/images/default-tshirt.webp';

export default function DefaultTshirt({ onLoad }) {
  useEffect(() => {
    // Create a new image to test loading
    const img = new Image();
    
    img.onload = () => {
      console.log('Default t-shirt image loaded successfully');
      // Pass the URL to the parent component
      onLoad(DEFAULT_TSHIRT_URL);
    };
    
    img.onerror = (error) => {
      console.error('Error loading default t-shirt image:', error);
      // Try a fallback approach - direct fetch
      fetch(DEFAULT_TSHIRT_URL)
        .then(response => {
          if (response.ok) {
            console.log('Default t-shirt loaded via fetch');
            onLoad(DEFAULT_TSHIRT_URL);
          } else {
            throw new Error(`Failed to fetch image: ${response.status}`);
          }
        })
        .catch(err => {
          console.error('Complete failure loading default t-shirt:', err);
        });
    };
    
    // Set the source to trigger loading
    img.src = DEFAULT_TSHIRT_URL;
  }, [onLoad]);
  
  return null;
}
