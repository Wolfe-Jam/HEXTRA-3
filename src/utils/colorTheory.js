// Color theory utilities
export class ColorTheory {
  // Convert HEX to RGB
  static hexToRgb(hex) {
    hex = hex.replace('#', '');
    return {
      r: parseInt(hex.substring(0, 2), 16),
      g: parseInt(hex.substring(2, 4), 16),
      b: parseInt(hex.substring(4, 6), 16)
    };
  }

  // Convert RGB to HEX
  static rgbToHex(rgb) {
    const toHex = (n) => {
      const hex = Math.max(0, Math.min(255, n)).toString(16);
      return hex.length === 1 ? '0' + hex : hex;
    };
    return `#${toHex(rgb.r)}${toHex(rgb.g)}${toHex(rgb.b)}`;
  }

  // Convert RGB to HSL
  static rgbToHsl(rgb) {
    const r = rgb.r / 255;
    const g = rgb.g / 255;
    const b = rgb.b / 255;

    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    let h, s, l = (max + min) / 2;

    if (max === min) {
      h = s = 0;
    } else {
      const d = max - min;
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
      switch (max) {
        case r: h = (g - b) / d + (g < b ? 6 : 0); break;
        case g: h = (b - r) / d + 2; break;
        case b: h = (r - g) / d + 4; break;
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
  static hslToRgb(hsl) {
    const h = hsl.h / 360;
    const s = hsl.s / 100;
    const l = hsl.l / 100;

    let r, g, b;

    if (s === 0) {
      r = g = b = l;
    } else {
      const hue2rgb = (p, q, t) => {
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

  // Get opposite color (180° rotation)
  static getOpposite(hsl) {
    return {
      h: (hsl.h + 180) % 360,
      s: hsl.s,
      l: hsl.l
    };
  }

  // Get split complementary colors (150° and 210° from original)
  static getSplitComplements(hsl) {
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

  // Get triad colors (120° and 240° from original)
  static getTriad(hsl) {
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

  // Find nearest colors in catalog
  static findNearest(target, catalog) {
    // Convert target to Lab color space for better matching
    const targetLab = this.rgbToLab(target);
    
    // Calculate distances and sort by closest
    const results = catalog.map(entry => {
      const entryLab = this.rgbToLab(entry.rgb);
      const distance = this.calculateDeltaE(targetLab, entryLab);
      
      return {
        ...entry,
        distance,
        // Convert distance to confidence (closer = higher confidence)
        confidence: Math.max(0, Math.min(100, 100 - (distance * 2)))
      };
    }).sort((a, b) => a.distance - b.distance);

    // Return top 3 matches
    return results.slice(0, 3);
  }

  // Convert RGB to Lab color space for better matching
  static rgbToLab(rgb) {
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

  // Calculate color difference using Delta E
  static calculateDeltaE(lab1, lab2) {
    const deltaL = lab2.l - lab1.l;
    const deltaA = lab2.a - lab1.a;
    const deltaB = lab2.b - lab1.b;

    return Math.sqrt(
      Math.pow(deltaL, 2) +
      Math.pow(deltaA, 2) +
      Math.pow(deltaB, 2)
    );
  }

  // Get all relationships for a color
  static getRelationships(hex, catalog = []) {
    const rgb = this.hexToRgb(hex);
    const hsl = this.rgbToHsl(rgb);

    return {
      opposite: this.getOpposite(hsl),
      splitComplements: this.getSplitComplements(hsl),
      triad: this.getTriad(hsl)
    };
  }
}
