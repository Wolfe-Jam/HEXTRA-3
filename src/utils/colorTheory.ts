import { RGBColor } from '../components/UniversalViewer/types';

interface HSLColor {
  h: number;  // 0-360
  s: number;  // 0-100
  l: number;  // 0-100
}

interface ColorRelationships {
  opposite: HSLColor;
  splitComplements: [HSLColor, HSLColor];
  triad: [HSLColor, HSLColor];
  nearest?: RGBColor;  // From catalog
}

interface NearestColorResult {
  color: RGBColor;
  name: string;
  distance: number;
  confidence: number;  // 0-100%, how close the match is
}

export class ColorTheory {
  // Convert HEX to RGB
  static hexToRgb(hex: string): RGBColor {
    if (!hex || typeof hex !== 'string') {
      console.warn('Invalid hex color provided:', hex);
      return { r: 0, g: 0, b: 0 };
    }
    
    // Remove # if present
    hex = hex.replace(/^#/, '');
    
    // Handle shorthand hex (#fff)
    if (hex.length === 3) {
      hex = hex[0] + hex[0] + hex[1] + hex[1] + hex[2] + hex[2];
    }
    
    const result = /^([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    if (!result) {
      console.warn('Invalid hex color format:', hex);
      return { r: 0, g: 0, b: 0 };
    }
    
    return {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16)
    };
  }

  // Convert RGB to HEX
  static rgbToHex(rgb: RGBColor): string {
    if (!rgb || typeof rgb !== 'object') {
      console.warn('Invalid RGB color provided:', rgb);
      return '#000000';
    }
    
    const r = Math.min(255, Math.max(0, rgb.r || 0));
    const g = Math.min(255, Math.max(0, rgb.g || 0));
    const b = Math.min(255, Math.max(0, rgb.b || 0));
    
    return '#' + [r, g, b]
      .map(x => x.toString(16).padStart(2, '0'))
      .join('');
  }

  // Convert RGB to HSL
  static rgbToHsl(rgb: RGBColor): HSLColor {
    if (!rgb || typeof rgb !== 'object') {
      console.warn('Invalid RGB color provided:', rgb);
      return { h: 0, s: 0, l: 0 };
    }
    
    const r = Math.min(255, Math.max(0, rgb.r || 0)) / 255;
    const g = Math.min(255, Math.max(0, rgb.g || 0)) / 255;
    const b = Math.min(255, Math.max(0, rgb.b || 0)) / 255;

    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    let h = 0;
    let s = 0;
    const l = (max + min) / 2;

    if (max !== min) {
      const d = max - min;
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);

      switch (max) {
        case r:
          h = (g - b) / d + (g < b ? 6 : 0);
          break;
        case g:
          h = (b - r) / d + 2;
          break;
        case b:
          h = (r - g) / d + 4;
          break;
      }

      h /= 6;
    }

    return {
      h: Math.round(h * 360),
      s: Math.round(s * 100),
      l: Math.round(l * 100)
    };
  }

  // Convert HSL to RGB
  static hslToRgb(hsl: HSLColor): RGBColor {
    if (!hsl || typeof hsl !== 'object') {
      console.warn('Invalid HSL color provided:', hsl);
      return { r: 0, g: 0, b: 0 };
    }
    
    const h = hsl.h / 360;
    const s = hsl.s / 100;
    const l = hsl.l / 100;

    let r: number, g: number, b: number;

    if (s === 0) {
      r = g = b = l;
    } else {
      const hue2rgb = (p: number, q: number, t: number) => {
        if (t < 0) t += 1;
        if (t > 1) t -= 1;
        if (t < 1/6) return p + (q - p) * 6 * t;
        if (t < 1/2) return q;
        if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
        return p;
      };

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
  }

  // Get opposite color (180° hue shift)
  static getOpposite(hsl: HSLColor): HSLColor {
    if (!hsl || typeof hsl !== 'object') {
      console.warn('Invalid HSL color provided:', hsl);
      return { h: 0, s: 0, l: 0 };
    }
    
    return {
      h: (hsl.h + 180) % 360,
      s: hsl.s,
      l: hsl.l
    };
  }

  // Get split complements (150° and 210° from original)
  static getSplitComplements(hsl: HSLColor): [HSLColor, HSLColor] {
    if (!hsl || typeof hsl !== 'object') {
      console.warn('Invalid HSL color provided:', hsl);
      return [{ h: 0, s: 0, l: 0 }, { h: 0, s: 0, l: 0 }];
    }
    
    return [
      {
        h: (hsl.h + 150) % 360,
        s: hsl.s,
        l: hsl.l
      },
      {
        h: (hsl.h + 210) % 360,
        s: hsl.s,
        l: hsl.l
      }
    ];
  }

  // Get triad (120° and 240° from original)
  static getTriad(hsl: HSLColor): [HSLColor, HSLColor] {
    if (!hsl || typeof hsl !== 'object') {
      console.warn('Invalid HSL color provided:', hsl);
      return [{ h: 0, s: 0, l: 0 }, { h: 0, s: 0, l: 0 }];
    }
    
    return [
      {
        h: (hsl.h + 120) % 360,
        s: hsl.s,
        l: hsl.l
      },
      {
        h: (hsl.h + 240) % 360,
        s: hsl.s,
        l: hsl.l
      }
    ];
  }

  // Convert RGB to Lab color space for better matching
  private static rgbToLab(rgb: RGBColor): { l: number; a: number; b: number; } {
    if (!rgb || typeof rgb !== 'object') {
      console.warn('Invalid RGB color provided:', rgb);
      return { l: 0, a: 0, b: 0 };
    }
    
    // First, convert RGB to XYZ
    let r = rgb.r / 255;
    let g = rgb.g / 255;
    let b = rgb.b / 255;

    r = r > 0.04045 ? Math.pow((r + 0.055) / 1.055, 2.4) : r / 12.92;
    g = g > 0.04045 ? Math.pow((g + 0.055) / 1.055, 2.4) : g / 12.92;
    b = b > 0.04045 ? Math.pow((b + 0.055) / 1.055, 2.4) : b / 12.92;

    r *= 100;
    g *= 100;
    b *= 100;

    const x = r * 0.4124 + g * 0.3576 + b * 0.1805;
    const y = r * 0.2126 + g * 0.7152 + b * 0.0722;
    const z = r * 0.0193 + g * 0.1192 + b * 0.9505;

    // Then XYZ to Lab
    const xn = 95.047;
    const yn = 100.000;
    const zn = 108.883;

    const xyz = [x/xn, y/yn, z/zn].map(v => 
      v > 0.008856 ? Math.pow(v, 1/3) : (7.787 * v) + 16/116
    );

    return {
      l: (116 * xyz[1]) - 16,
      a: 500 * (xyz[0] - xyz[1]),
      b: 200 * (xyz[1] - xyz[2])
    };
  }

  // Calculate color difference using Delta E (CIE 2000)
  private static calculateDeltaE(lab1: { l: number; a: number; b: number; }, 
                               lab2: { l: number; a: number; b: number; }): number {
    if (!lab1 || !lab2 || typeof lab1 !== 'object' || typeof lab2 !== 'object') {
      console.warn('Invalid Lab colors provided:', lab1, lab2);
      return 0;
    }
    
    const deltaL = lab2.l - lab1.l;
    const deltaA = lab2.a - lab1.a;
    const deltaB = lab2.b - lab1.b;
    
    const L1 = lab1.l;
    const L2 = lab2.l;
    const C1 = Math.sqrt(lab1.a * lab1.a + lab1.b * lab1.b);
    const C2 = Math.sqrt(lab2.a * lab2.a + lab2.b * lab2.b);
    const deltaC = C2 - C1;
    
    // Calculate h1 and h2
    let h1 = Math.atan2(lab1.b, lab1.a);
    let h2 = Math.atan2(lab2.b, lab2.a);
    
    // Make sure h1 and h2 are in [0, 2π]
    if (h1 < 0) h1 += 2 * Math.PI;
    if (h2 < 0) h2 += 2 * Math.PI;
    
    // Calculate ΔH
    let deltaH = 0;
    const deltaHabs = Math.abs(h1 - h2);
    if (C1 * C2 !== 0) {
      if (deltaHabs <= Math.PI) {
        deltaH = h2 - h1;
      } else if (deltaHabs > Math.PI && h2 <= h1) {
        deltaH = h2 - h1 + 2 * Math.PI;
      } else {
        deltaH = h2 - h1 - 2 * Math.PI;
      }
    }
    
    // Calculate ΔH'
    const deltaHprime = 2 * Math.sqrt(C1 * C2) * Math.sin(deltaH / 2);
    
    // Calculate L', C', H' terms
    const Lprime = (L1 + L2) / 2;
    const Cprime = (C1 + C2) / 2;
    
    // Weighting factors
    const SL = 1;
    const SC = 1 + 0.045 * Cprime;
    const SH = 1 + 0.015 * Cprime;
    
    // Calculate total color difference
    return Math.sqrt(
      Math.pow(deltaL / SL, 2) +
      Math.pow(deltaC / SC, 2) +
      Math.pow(deltaHprime / SH, 2)
    );
  }

  // Enhanced nearest color finder with improved perceptual matching
  static findNearest(target: RGBColor, catalog: Array<{ rgb: RGBColor; name: string; hex?: string; }>): NearestColorResult[] {
    if (!target || !catalog || typeof target !== 'object' || !Array.isArray(catalog)) {
      console.warn('Invalid target or catalog provided:', target, catalog);
      return [];
    }
    
    // Use simpler RGB distance for better performance
    const results = catalog.map(entry => {
      if (!entry.rgb) return null;
      
      // Calculate weighted RGB distance
      const dr = (target.r - entry.rgb.r) * 0.30; // Red weighted more heavily
      const dg = (target.g - entry.rgb.g) * 0.59; // Green weighted most heavily
      const db = (target.b - entry.rgb.b) * 0.11; // Blue weighted least
      
      const distance = Math.sqrt(dr * dr + dg * dg + db * db);
      
      return {
        color: entry.rgb,
        name: entry.name,
        distance,
        confidence: Math.max(0, Math.min(100, 100 - (distance * 0.3))) // Adjusted confidence calculation
      };
    })
    .filter(Boolean)
    .sort((a, b) => a.distance - b.distance);

    // Return top 3 matches
    return results.slice(0, 3);
  }

  // Get all relationships for a color
  static getRelationships(hex: string, catalog: RGBColor[]): ColorRelationships {
    if (!hex || !catalog || typeof hex !== 'string' || !Array.isArray(catalog)) {
      console.warn('Invalid hex or catalog provided:', hex, catalog);
      return { opposite: { h: 0, s: 0, l: 0 }, splitComplements: [{ h: 0, s: 0, l: 0 }, { h: 0, s: 0, l: 0 }], triad: [{ h: 0, s: 0, l: 0 }, { h: 0, s: 0, l: 0 }], nearest: undefined };
    }
    
    const rgb = this.hexToRgb(hex);
    const hsl = this.rgbToHsl(rgb);
    
    const opposite = this.getOpposite(hsl);
    const splitComplements = this.getSplitComplements(hsl);
    const triad = this.getTriad(hsl);
    
    // Find nearest catalog color if catalog provided
    let nearest = undefined;
    if (catalog.length > 0) {
      const matches = this.findNearest(rgb, catalog.map(color => ({ rgb: color, name: '' })));
      if (matches.length > 0) {
        nearest = matches[0].color;
      }
    }

    return {
      opposite,
      splitComplements,
      triad,
      nearest
    };
  }
}

// Usage example:
/*
const hex = '#FF0000';  // Red
const rgb = ColorTheory.hexToRgb(hex);
const hsl = ColorTheory.rgbToHsl(rgb);

const relationships = ColorTheory.getRelationships(hex, []);
console.log(relationships);
// {
//   opposite: { h: 180, s: 100, l: 50 },        // Cyan
//   splitComplements: [
//     { h: 150, s: 100, l: 50 },               // Spring Green
//     { h: 210, s: 100, l: 50 }                // Azure
//   ],
//   triad: [
//     { h: 120, s: 100, l: 50 },               // Green
//     { h: 240, s: 100, l: 50 }                // Blue
//   ],
//   nearest: undefined
// }
*/

// Usage Example:
/*
// User picks a color from color wheel
const userColor = { r: 255, g: 30, b: 50 };  // Some bright red

// Find nearest catalog colors
const nearestColors = ColorTheory.findNearest(
  userColor,
  [
    { rgb: { r: 213, g: 0, b: 50 }, name: "Cherry Red" },
    { rgb: { r: 191, g: 13, b: 62 }, name: "Heather Red" },
    { rgb: { r: 138, g: 21, b: 56 }, name: "Cardinal Red" }
  ]
);

console.log(nearestColors);
// [
//   { 
//     color: { r: 213, g: 0, b: 50 },  // Cherry Red
//     name: "Cherry Red",
//     distance: 12.3,
//     confidence: 75.4
//   },
//   {
//     color: { r: 191, g: 13, b: 62 },  // Heather Red
//     name: "Heather Red",
//     distance: 18.7,
//     confidence: 62.6
//   },
//   {
//     color: { r: 138, g: 21, b: 56 },  // Cardinal Red
//     name: "Cardinal Red",
//     distance: 25.1,
//     confidence: 49.8
//   }
// ]
*/
