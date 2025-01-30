import { RGBColor } from '../components/UniversalViewer/types';

interface ColorDistance {
  color: RGBColor;
  distance: number;
}

export const hexToRgb = (hex: string): RGBColor | null => {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  if (!result) {
    return null;
  }
  return {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16)
  };
};

export const rgbToHex = (r: number, g: number, b: number): string => {
  return '#' + [r, g, b].map(x => {
    const hex = x.toString(16);
    return hex.length === 1 ? '0' + hex : hex;
  }).join('');
};

export const calculateLuminance = (r: number, g: number, b: number): number => {
  // Convert RGB to relative luminance using the formula from WCAG 2.0
  const [rr, gg, bb] = [r, g, b].map(c => {
    c = c / 255;
    return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * rr + 0.7152 * gg + 0.0722 * bb;
};

export const getContrastRatio = (color1: RGBColor, color2: RGBColor): number => {
  const l1 = calculateLuminance(color1.r, color1.g, color1.b);
  const l2 = calculateLuminance(color2.r, color2.g, color2.b);
  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);
  return (lighter + 0.05) / (darker + 0.05);
};

export const getTextColor = (backgroundColor: RGBColor): string => {
  const white = { r: 255, g: 255, b: 255 };
  const black = { r: 0, g: 0, b: 0 };
  
  const whiteContrast = getContrastRatio(backgroundColor, white);
  const blackContrast = getContrastRatio(backgroundColor, black);
  
  return whiteContrast > blackContrast ? '#FFFFFF' : '#000000';
};

export const adjustBrightness = (color: RGBColor, factor: number): RGBColor => {
  return {
    r: Math.min(255, Math.max(0, Math.round(color.r * factor))),
    g: Math.min(255, Math.max(0, Math.round(color.g * factor))),
    b: Math.min(255, Math.max(0, Math.round(color.b * factor)))
  };
};

export const getComplementaryColor = (color: RGBColor): RGBColor => {
  return {
    r: 255 - color.r,
    g: 255 - color.g,
    b: 255 - color.b
  };
};

export const getAnalogousColors = (color: RGBColor, angle: number = 30): RGBColor[] => {
  const hsl = rgbToHsl(color.r, color.g, color.b);
  
  return [
    hslToRgb(hsl.h - angle, hsl.s, hsl.l),
    color,
    hslToRgb(hsl.h + angle, hsl.s, hsl.l)
  ];
};

export const findNearestColors = (target: RGBColor, colors: RGBColor[]): ColorDistance[] => {
  return colors
    .map(color => ({
      color,
      distance: Math.sqrt(
        Math.pow(target.r - color.r, 2) +
        Math.pow(target.g - color.g, 2) +
        Math.pow(target.b - color.b, 2)
      )
    }))
    .sort((a, b) => a.distance - b.distance);
};

// Helper functions for color space conversions
const rgbToHsl = (r: number, g: number, b: number): { h: number; s: number; l: number } => {
  r /= 255;
  g /= 255;
  b /= 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0, s = 0, l = (max + min) / 2;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);

    switch (max) {
      case r: h = (g - b) / d + (g < b ? 6 : 0); break;
      case g: h = (b - r) / d + 2; break;
      case b: h = (r - g) / d + 4; break;
    }

    h /= 6;
  }

  return { h: h * 360, s, l };
};

const hslToRgb = (h: number, s: number, l: number): RGBColor => {
  h = h % 360;
  if (h < 0) h += 360;
  h /= 360;

  const hue2rgb = (p: number, q: number, t: number): number => {
    if (t < 0) t += 1;
    if (t > 1) t -= 1;
    if (t < 1/6) return p + (q - p) * 6 * t;
    if (t < 1/2) return q;
    if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
    return p;
  };

  let r: number, g: number, b: number;

  if (s === 0) {
    r = g = b = l;
  } else {
    const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    const p = 2 * l - q;

    r = hue2rgb(p, q, h + 1/3);
    g = hue2rgb(p, q, h);
    b = hue2rgb(p, q, h - 1/3);
  }

  return {
    r: Math.round(r * 255),
    g: Math.round(g * 255),
    b: Math.round(b * 255)
  };
};
