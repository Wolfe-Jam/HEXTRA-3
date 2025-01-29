// Import UMD build
import 'jimp/dist/jimp.min.js';

// Access Jimp from window after script loads
const getJimp = () => window.Jimp;

// Absolute minimum test
export const testJimp = async (imageUrl) => {
  try {
    console.log('Starting Jimp test');
    console.log('Jimp available:', !!getJimp());
    return imageUrl; // Just return original for now
  } catch (error) {
    console.error('Jimp test error:', error);
    return null;
  }
};

// Minimal color replacement
export const replaceColor = async (imageUrl, targetColor) => {
  try {
    console.log('Starting color replacement');
    console.log('Jimp available:', !!getJimp());
    return imageUrl; // Just return original for now
  } catch (error) {
    console.error('Color replacement error:', error);
    return null;
  }
};
