import { useState, useEffect } from 'react';
import { CoreImageMetadata } from '../types';

export const useProcessHistory = () => {
  const [recentImages, setRecentImages] = useState<CoreImageMetadata[]>([]);

  // Load history on mount
  useEffect(() => {
    const stored = localStorage.getItem('hextra_processed_images');
    if (stored) {
      setRecentImages(JSON.parse(stored));
    }
  }, []);

  // Subscribe to storage changes
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'hextra_processed_images' && e.newValue) {
        setRecentImages(JSON.parse(e.newValue));
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  return {
    recentImages,
    hasHistory: recentImages.length > 0,
    clearHistory: () => {
      localStorage.removeItem('hextra_processed_images');
      setRecentImages([]);
    }
  };
};

// Usage example:
/*
const MyComponent = () => {
  const { recentImages, hasHistory, clearHistory } = useProcessHistory();

  return (
    <div>
      {hasHistory && (
        <div>
          <h3>Recent Processed Images</h3>
          {recentImages.map(img => (
            <div key={img.id}>
              <img src={img.preview?.thumbnail} alt="Processed" />
              <span>Created: {img.created.toLocaleDateString()}</span>
            </div>
          ))}
          <button onClick={clearHistory}>Clear History</button>
        </div>
      )}
    </div>
  );
};
*/
