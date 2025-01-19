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
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16)
    } : { r: 0, g: 0, b: 0 };
  }

  // Convert RGB to HEX
  static rgbToHex(rgb: RGBColor): string {
    return '#' + [rgb.r, rgb.g, rgb.b]
      .map(x => x.toString(16).padStart(2, '0'))
      .join('');
  }

  // Convert RGB to HSL
  static rgbToHsl(rgb: RGBColor): HSLColor {
    const r = rgb.r / 255;
    const g = rgb.g / 255;
    const b = rgb.b / 255;

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
    return {
      h: (hsl.h + 180) % 360,
      s: hsl.s,
      l: hsl.l
    };
  }

  // Get split complements (150° and 210° from original)
  static getSplitComplements(hsl: HSLColor): [HSLColor, HSLColor] {
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

  // Enhanced nearest color finder
  static findNearest(target: RGBColor, catalog: Array<{ rgb: RGBColor; name: string; }>): NearestColorResult[] {
    // Convert colors to Lab color space for better perceptual matching
    const targetLab = this.rgbToLab(target);
    
    // Calculate distances and sort by closest
    const results = catalog.map(entry => {
      const entryLab = this.rgbToLab(entry.rgb);
      const distance = this.calculateDeltaE(targetLab, entryLab);
      
      return {
        color: entry.rgb,
        name: entry.name,
        distance,
        // Convert distance to confidence (closer = higher confidence)
        confidence: Math.max(0, Math.min(100, 100 - (distance * 2)))
      };
    }).sort((a, b) => a.distance - b.distance);

    // Return top 3 matches
    return results.slice(0, 3);
  }

  // Convert RGB to Lab color space for better matching
  private static rgbToLab(rgb: RGBColor): { l: number; a: number; b: number; } {
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
    const deltaL = lab2.l - lab1.l;
    const deltaA = lab2.a - lab1.a;
    const deltaB = lab2.b - lab1.b;

    // Simplified Delta E calculation
    return Math.sqrt(
      Math.pow(deltaL, 2) +
      Math.pow(deltaA, 2) +
      Math.pow(deltaB, 2)
    );
  }

  // Get all relationships for a color
  static getRelationships(hex: string, catalog: RGBColor[]): ColorRelationships {
    const rgb = this.hexToRgb(hex);
    const hsl = this.rgbToHsl(rgb);
    
    const opposite = this.getOpposite(hsl);
    const splitComplements = this.getSplitComplements(hsl);
    const triad = this.getTriad(hsl);
    
    // Find nearest catalog color if catalog provided
    const nearest = catalog.length > 0 ? 
      this.findNearest(rgb, catalog.map(color => ({ rgb: color, name: '' }))).[0].color : 
      undefined;

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
