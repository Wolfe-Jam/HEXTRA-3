import { create } from 'zustand';

// Color conversion utilities
const hexToRgb = (hex) => {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16)
  } : null;
};

const rgbToHsl = ({ r, g, b }) => {
  r /= 255;
  g /= 255;
  b /= 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0;
  let s = 0;
  const l = (max + min) / 2;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r: h = (g - b) / d + (g < b ? 6 : 0); break;
      case g: h = (b - r) / d + 2; break;
      case b: h = (r - g) / d + 4; break;
      default: break;
    }
    h /= 6;
  }

  return {
    h: Math.round(h * 360),
    s: Math.round(s * 100),
    l: Math.round(l * 100)
  };
};

// Validation functions
const isValidHex = (hex) => {
  return /^#[0-9A-F]{6}$/i.test(hex);
};

const normalizeHex = (hex) => {
  const cleaned = hex.toUpperCase().replace(/[^0-9A-F]/g, '');
  return `#${cleaned.padStart(6, '0')}`;
};

// Default color (Royal Blue)
const DEFAULT_COLOR = '#307FE2';

// Create the store with validation
const useColorStore = create((set) => ({
  currentColor: DEFAULT_COLOR,
  
  updateColorState: (hex) => {
    try {
      // Input validation
      if (typeof hex !== 'string') {
        console.warn('Invalid hex value type:', typeof hex);
        return;
      }

      // Normalize and validate hex
      const normalizedHex = normalizeHex(hex);
      if (!isValidHex(normalizedHex)) {
        console.warn('Invalid hex format:', hex);
        return;
      }

      // Validate RGB conversion
      const rgb = hexToRgb(normalizedHex);
      if (!rgb) {
        console.warn('Failed to convert hex to RGB:', normalizedHex);
        return;
      }

      // Update state with validated color
      set({ currentColor: normalizedHex });
    } catch (error) {
      console.error('Error updating color state:', error);
    }
  }
}));

export { hexToRgb, rgbToHsl, isValidHex };
export default useColorStore;
