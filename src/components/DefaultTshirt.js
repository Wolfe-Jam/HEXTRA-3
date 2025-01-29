import React from 'react';

// Pre-optimized default t-shirt image
const DEFAULT_TSHIRT_URL = '/images/default-tshirt.webp';

export default function DefaultTshirt({ onLoad }) {
  React.useEffect(() => {
    const img = new Image();
    img.onload = () => {
      onLoad(DEFAULT_TSHIRT_URL);
    };
    img.onerror = (error) => {
      console.error('Error loading default t-shirt:', error);
    };
    img.src = DEFAULT_TSHIRT_URL;
  }, [onLoad]);
  
  return null;
}
