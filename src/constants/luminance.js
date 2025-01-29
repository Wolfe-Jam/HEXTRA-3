// Luminance calculation methods
export const LUMINANCE_METHODS = {
  NATURAL: {
    name: 'Natural',
    description: 'Perceived brightness based on human vision',
    calculate: (r, g, b) => (0.299 * r + 0.587 * g + 0.114 * b) / 255
  },
  AVERAGE: {
    name: 'Average',
    description: 'Simple RGB average',
    calculate: (r, g, b) => (r + g + b) / (3 * 255)
  },
  WEIGHTED: {
    name: 'Weighted',
    description: 'Weighted average favoring midtones',
    calculate: (r, g, b) => {
      const avg = (r + g + b) / 3;
      const weight = avg < 128 ? 0.8 : 1.2;
      return (avg * weight) / 255;
    }
  }
};
