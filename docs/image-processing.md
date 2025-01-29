# HEXTRA Image Processing

## Core Dependencies
```json
{
  "jimp": "0.22.10",        // Image processing library
  "buffer": "6.0.3",        // Required for Jimp in browser
  "process": "0.11.10",     // Required for Jimp in browser
  "stream-browserify": "3.0.0"  // Required for Jimp in browser
}
```

## Luminance Methods

### Natural (ITU-R BT.709)
Optimized for human perception of brightness
```javascript
luminance = 0.2126 * R + 0.7152 * G + 0.0722 * B
```

### Balanced (NTSC/PAL)
Standard video colorspace weights
```javascript
luminance = 0.299 * R + 0.587 * G + 0.114 * B
```

### Vibrant
Enhanced saturation with contrast boost
```javascript
luminance = (R + G + B) / 3  // Base average
luminance = Math.pow(luminance, 0.85)  // Contrast boost
```

## Browser Setup Requirements

### Polyfills
Required globals for Jimp in browser:
```javascript
window.Buffer = Buffer;
window.process = process;
```

### Webpack Configuration
```javascript
resolve: {
  fallback: {
    "stream": require.resolve("stream-browserify"),
    "buffer": require.resolve("buffer/"),
    "path": require.resolve("path-browserify"),
    "process": require.resolve("process/browser")
  }
}
```

### Memory Management
```javascript
Jimp.configure({
  disableWebWorkers: true,  // Required for browser
  maxMemoryUsageInMB: 512  // Prevent memory issues
});
```

## Image Processing Pipeline

1. **Load Image**
   ```javascript
   const image = await Jimp.read(buffer);
   ```

2. **Process Pixels**
   ```javascript
   image.scan(0, 0, width, height, function(x, y, idx) {
     // Get original pixel values
     const red = this.bitmap.data[idx + 0];
     const green = this.bitmap.data[idx + 1];
     const blue = this.bitmap.data[idx + 2];
     const alpha = this.bitmap.data[idx + 3];

     // Calculate luminance
     const luminance = LUMINANCE_METHODS[method].calculate(
       red, green, blue
     );

     // Apply new color
     this.bitmap.data[idx + 0] = Math.round(targetColor.r * luminance);
     this.bitmap.data[idx + 1] = Math.round(targetColor.g * luminance);
     this.bitmap.data[idx + 2] = Math.round(targetColor.b * luminance);
     this.bitmap.data[idx + 3] = alpha;  // Preserve transparency
   });
   ```

3. **Export Result**
   ```javascript
   const base64 = await image.getBase64Async(Jimp.MIME_PNG);
   ```

## Error Handling

```javascript
try {
  const image = await Jimp.read(buffer);
  // Process image...
} catch (error) {
  if (error instanceof Jimp.ImageLoadError) {
    console.error('Failed to load image:', error);
  } else {
    console.error('Error processing image:', error);
  }
  throw error;
}
```

## Performance Considerations

1. **Memory Usage**
   - Pre-allocate buffers when possible
   - Release references after processing
   - Monitor heap usage

2. **Processing Time**
   - Consider using WebWorkers for large images
   - Implement progress indicators
   - Cache processed results

3. **Browser Compatibility**
   - Test across major browsers
   - Verify polyfill effectiveness
   - Monitor memory usage

## Quality Assurance

1. **Color Accuracy**
   - Verify luminance preservation
   - Check color consistency
   - Test edge cases

2. **Image Quality**
   - No artifacts or banding
   - Sharp edges maintained
   - Proper alpha handling

3. **Performance Metrics**
   - Load time < 200ms
   - Processing time < 500ms
   - Memory usage < 512MB
