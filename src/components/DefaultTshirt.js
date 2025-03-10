import React, { useEffect } from 'react';

// Pre-optimized default t-shirt image 
const DEFAULT_TSHIRT_URL = '/images/default-tshirt.webp';

// Check if we're in a browser environment
const isBrowser = typeof window !== 'undefined' && typeof document !== 'undefined';

export default function DefaultTshirt({ onLoad }) {
  useEffect(() => {
    // Skip in non-browser environments (SSR/build)
    if (!isBrowser) {
      console.log('DefaultTshirt: Skipping image load in non-browser environment');
      // Still need to call onLoad with the URL to prevent UI from waiting
      onLoad(DEFAULT_TSHIRT_URL);
      return;
    }
    
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
