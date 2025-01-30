import { useState, useEffect } from 'react';
import { CoreImageMetadata } from '../types';

export const useProcessHistory = () => {
  const [recentImages, setRecentImages] = useState<CoreImageMetadata[]>([]);

  // Load history on mount
  useEffect(() => {
    const stored = localStorage.getItem('hextra_processed_images');
    if (stored) {
      try {
        setRecentImages(JSON.parse(stored));
      } catch (error) {
        console.error('Failed to parse process history:', error);
        localStorage.removeItem('hextra_processed_images');
      }
    }
  }, []);

  // Subscribe to storage changes
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'hextra_processed_images' && e.newValue) {
        try {
          setRecentImages(JSON.parse(e.newValue));
        } catch (error) {
          console.error('Failed to parse process history from storage event:', error);
        }
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
