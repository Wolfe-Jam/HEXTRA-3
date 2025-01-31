# HEXTRA Color System

## Overview
The HEXTRA color system provides multiple intuitive ways to select and apply colors to images while maintaining high performance through selective processing.

## Color Selection Methods

### 1. Color Wheel
- Interactive color wheel for visual color selection
- Real-time preview in Round Color Swatch
- Auto-applies color on mouse release (MouseUp event)
- Provides immediate visual feedback without processing main image

### 2. HEX Input
- Direct HEX code entry (#RRGGBB format)
- Apply with ENTER key
- Google-style dropdown with auto-apply
- Validates input format

### 3. Apply Button
- Manual application of selected color
- Useful for precise control
- Visual confirmation of intent

## Performance Optimizations

### Preview System
- Round Color Swatch acts as rapid preview
- Updates instantly during color selection
- No main image processing during preview
- Ensures smooth user experience

### Image Processing
- Processes main image only on committed color changes
- Uses efficient luminance calculation
- Single luminance value applied to all RGB channels
- Preserves image details and shading

## Implementation Details

### Color Application Process
1. Calculate single luminance value from RGB channels
2. Apply same luminance to each channel of target color
3. Update image data efficiently
4. Convert to base64 for display

### State Management
- Tracks current color selection
- Maintains original image data
- Separates preview from applied state
- Handles image loading states

## Best Practices
1. Always validate color input format
2. Use efficient preview mechanisms
3. Process main image only when necessary
4. Provide immediate user feedback
5. Support multiple input methods

## Future Considerations
- Color history/favorites
- Advanced color combinations
- Additional color spaces (RGB, HSL)
