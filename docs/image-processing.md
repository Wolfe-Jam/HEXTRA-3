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

## Future Enhancement Roadmap

### Advanced Material Simulation
The core strength of HEXTRA is its ability to apply colors while preserving luminance and contrast relationships. Future versions will expand this capability with:

```javascript
// Advanced substrate simulation
const materialProperties = {
  substrate: {
    type: 'cotton',           // Material type
    weave: 'jersey',          // Specific variation
    absorption: 0.72,         // How much light is absorbed (0-1)
    scattering: 0.38,         // How much light is scattered (0-1)
    specular: 0.12,           // Specular highlight properties (0-1)
    reflectivity: 0.15,       // Surface reflectivity (0-1)
    threadDensity: 'medium',  // Texture density
    roughness: 0.65           // Surface roughness (0-1)
  }
};

// Apply material simulation to color transform
function applyMaterialProperties(rgb, luminance, material) {
  // Substrate absorption affects color saturation
  const saturationFactor = 1 - material.absorption * 0.5;
  
  // Calculate color with material properties
  return {
    r: Math.round(rgb.r * luminance * saturationFactor * (1 - material.absorption * 0.3)),
    g: Math.round(rgb.g * luminance * saturationFactor * (1 - material.absorption * 0.2)),
    b: Math.round(rgb.b * luminance * saturationFactor * (1 - material.absorption * 0.1)),
  };
}
```

### Environmental Lighting Models
Future versions will simulate how colors appear under different lighting conditions:

```javascript
const lightingEnvironments = {
  daylight: {
    temperature: 5600,       // Color temperature in Kelvin
    intensity: 1.0,          // Relative brightness
    direction: [0, -1, 0],   // Light direction vector
    ambient: 0.2,            // Ambient light level
    specularPower: 0.7       // Specular highlight intensity
  },
  office: {
    temperature: 4000,       // Fluorescent lighting
    intensity: 0.8,
    direction: [0, -1, 0],
    ambient: 0.3,
    specularPower: 0.4
  },
  storeDisplay: {
    temperature: 3200,       // Warmer display lighting
    intensity: 0.9,
    direction: [-0.5, -0.7, -0.5],
    ambient: 0.15,
    specularPower: 0.8
  }
};

// Apply lighting model to transformed colors
function simulateLighting(rgb, lighting) {
  // Convert color temperature to RGB influence
  const tempFactor = calculateTemperatureFactor(lighting.temperature);
  
  return {
    r: Math.min(255, Math.round(rgb.r * tempFactor.r * lighting.intensity)),
    g: Math.min(255, Math.round(rgb.g * tempFactor.g * lighting.intensity)),
    b: Math.min(255, Math.round(rgb.b * tempFactor.b * lighting.intensity))
  };
}
```

### Advanced Texture Adsorption
Future versions will model how different substrates interact with colors at a molecular level:

```javascript
const adsorptionModels = {
  cotton: {
    dyeAffinity: 0.85,        // How readily the material accepts dye
    adsorptionRate: 0.72,     // Rate of color adsorption
    layerDepth: 3,            // Visual depth of color layers
    penetration: 0.8,         // How deeply color penetrates
    fadeResistance: 0.6       // How well color resists fading
  },
  polyester: {
    dyeAffinity: 0.6,
    adsorptionRate: 0.5,
    layerDepth: 1,
    penetration: 0.4,
    fadeResistance: 0.9
  },
  paper: {
    dyeAffinity: 0.95,
    adsorptionRate: 0.9,
    layerDepth: 1,
    penetration: 0.7,
    fadeResistance: 0.3
  }
};

// Simulate how pigment adheres to and interacts with a substrate
function simulateAdsorption(rgb, substrate, concentration) {
  // Higher concentration increases color saturation but with diminishing returns
  const effectiveConcentration = 1 - Math.exp(-concentration * substrate.adsorptionRate);
  
  // Calculate how the substrate's properties affect color appearance
  return {
    r: Math.round(rgb.r * effectiveConcentration * substrate.dyeAffinity),
    g: Math.round(rgb.g * effectiveConcentration * substrate.dyeAffinity),
    b: Math.round(rgb.b * effectiveConcentration * substrate.dyeAffinity)
  };
}
```

These advanced capabilities will transform HEXTRA from a powerful visualization tool into a comprehensive color simulation platform for designers, manufacturers, and creators across multiple industries.

The enhanced processing will maintain the core magic of HEXTRA—applying hex colors while preserving luminance relationships—while adding sophisticated material simulations that accurately represent how colors will appear in real-world applications.
