# HEXTRA-3 Requirements & Roadmap

## Must Haves (ASAP)
_Critical features needed for core functionality_

### Version 1.3 Core Updates
1. Color Selection Enhancement:
   - Greyscale Slider (HSV Value Control):
     * Layout:
       - Full width slider directly under RGB disc
       - Centered "Value: [N]" text above slider
     * Implementation:
       - MUI Slider component
       - Range: 0-255
       - Small size (16px thumb, 4px track)
       - Simple numeric display
       - Clean, minimal styling
     * Behavior: 
       - Updates value display in real-time
       - Simple value adjustment
       - No complex color conversions
     * Integration:
       - Maintains color selection integrity
       - Works in harmony with RGB disc
       - Preserves hue/saturation while adjusting value

2. Material Simulation Controls:
   - Matte Slider:
     * Range: 0-100%
     * Default: 80%
     * Sweet spot: 70-85%
     * Purpose: Reduces brightness/saturation for realistic fabric appearance
   
   - Texture Slider:
     * Range: 0-100% (internally mapped to lower values)
     * Sweet spot: 20-40% on slider
     * Internal mapping:
       - Noise: 0-15% maximum
       - Gaussian Blur: 0-10% maximum
     * Purpose: Simulates heathered fabric effect

   - Material Control Buttons:
     * [Matte] [Heather] [Magic]
     * Magic button: Auto-adjusts for print preview
     * Quick optimization for realistic fabric appearance

### Implementation Notes
- Texture effect uses subtle noise + light blur
- Focus on natural look without obvious processing
- Internal mapping ensures user-friendly ranges
- All effects preserve color integrity

## Must Haves (Important)
_Essential features for complete product_

## Nice to Haves (ASAP)
_Quick wins that enhance user experience_

## Nice to Haves (Important)
_Valuable additions for future versions_

---

Each feature will be evaluated based on:
- Implementation complexity
- JIMP capability availability
- User impact
- Development time
