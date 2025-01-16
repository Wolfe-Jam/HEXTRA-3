# HEXTRA-3 Interface Layout

## 1. Banner
The application header banner spans the full width of the interface.
- Height: 64px
- Background: Uses theme gradient
- Contains:
  - Left: HEXTRA-3 logo/text
  - Right: Theme toggle button
- Consistent elevation shadow
- Fixed position, always visible

## 2. RGB Color Disc
Primary color selection interface centered below banner.
- Size: 240x240px
- Circular HSL color selection
- Centered in container
- Maintains aspect ratio
- Shows selected color with draggable indicator
- No text labels (clean interface)

## 3. HEX Input Bar
Single-line control bar for precise color management.
```
[RGB: 123,123,123] [○] [Enter HEX code] [Apply Color]
```
- Fixed layout, left-to-right:
  1. RGB text display (Inter font, 0.875rem)
  2. Round color swatch (48x48px, subtle border)
  3. HEX input field (150px width)
  4. Apply button (minimum 100px width)
- 40px left padding
- Consistent 2-unit gaps between elements
- All elements vertically centered

## 4. Load Bar
Image source control bar.
```
[Enter image URL] [Load URL] OR [Load Image]
```
- Full-width URL input
- Consistent button styling
- "OR" separator with proper spacing
- File input hidden behind "Load Image" button
- Matches HEX Input Bar height/styling

## 5. Main Image Window
Central image display area with integrated download.
- Maintains aspect ratio
- Centered in container
- Responsive scaling
- Download button:
  - Position: Top-right corner
  - Icon: Download arrow
  - Appears when image is loaded
  - Consistent hover effects

## 6. Image Adjustments
Control panel for image processing.
- Slider controls:
  - Luminance method selection
  - Matte effect
  - Texture overlay
- Consistent spacing
- Clear labeling
- Real-time preview updates

### Global Style Rules
- Consistent use of theme variables
- Uniform spacing system
- Responsive layout considerations
- Subtle transitions and animations
- Clear visual hierarchy

### Critical Notes
- Core layouts must not be modified
- Maintain consistent spacing
- Preserve vertical rhythm
- Keep interface clean and minimal
- All new features must work within this structure
