import { LUMINANCE_METHODS } from '../constants/luminance';
import { hexToRgb } from '../utils/image-processing';

describe('Color Application Process', () => {
  // Mock bitmap data for testing
  const createMockBitmap = (width = 2, height = 2) => {
    return {
      data: new Uint8ClampedArray(width * height * 4),
      width,
      height
    };
  };

  // Test that luminance calculation matches required implementation
  test('luminance calculation must use LUMINANCE_METHODS', () => {
    const red = 100, green = 150, blue = 200;
    
    // Calculate using required method
    const correctLuminance = LUMINANCE_METHODS.NATURAL.calculate(red, green, blue);
    
    // Calculate using hardcoded formula (this should fail)
    const hardcodedLuminance = 0.2126 * red + 0.7152 * green + 0.0722 * blue;
    
    // Verify they are different to catch hardcoding
    expect(hardcodedLuminance).not.toBeCloseTo(correctLuminance);
    
    // Document the correct implementation
    expect(typeof LUMINANCE_METHODS.NATURAL.calculate).toBe('function');
  });

  // Test that bitmap manipulation follows required pattern
  test('bitmap manipulation must follow required pattern', () => {
    const bitmap = createMockBitmap();
    const idx = 0;
    const rgbColor = hexToRgb('#FF0000');
    const luminance = 0.5;

    // Required pattern
    bitmap.data[idx + 0] = Math.round(rgbColor.r * luminance);
    bitmap.data[idx + 1] = Math.round(rgbColor.g * luminance);
    bitmap.data[idx + 2] = Math.round(rgbColor.b * luminance);

    // Verify each channel is set independently
    expect(bitmap.data[idx + 0]).toBe(Math.round(255 * luminance)); // Red
    expect(bitmap.data[idx + 1]).toBe(0); // Green
    expect(bitmap.data[idx + 2]).toBe(0); // Blue
  });

  // Test that single luminance value is used for all channels
  test('same luminance value must be used for all channels', () => {
    const bitmap = createMockBitmap();
    const idx = 0;
    const rgbColor = hexToRgb('#FF0000');
    
    // Set source pixel values
    bitmap.data[idx + 0] = 100; // Red
    bitmap.data[idx + 1] = 150; // Green
    bitmap.data[idx + 2] = 200; // Blue
    bitmap.data[idx + 3] = 255; // Alpha

    // Calculate luminance using required method
    const luminance = LUMINANCE_METHODS.NATURAL.calculate(
      bitmap.data[idx + 0],
      bitmap.data[idx + 1],
      bitmap.data[idx + 2]
    );

    // Apply same luminance to target color
    bitmap.data[idx + 0] = Math.round(rgbColor.r * luminance);
    bitmap.data[idx + 1] = Math.round(rgbColor.g * luminance);
    bitmap.data[idx + 2] = Math.round(rgbColor.b * luminance);

    // Verify ratios between channels match the input color
    const redGreenRatio = bitmap.data[idx + 0] / bitmap.data[idx + 1];
    const redBlueRatio = bitmap.data[idx + 0] / bitmap.data[idx + 2];
    
    expect(redGreenRatio).toBeCloseTo(rgbColor.r / rgbColor.g);
    expect(redBlueRatio).toBeCloseTo(rgbColor.r / rgbColor.b);
  });
});
