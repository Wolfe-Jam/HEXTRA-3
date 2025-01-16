# HEXTRA-3 Core UI Components

## Color Control Bar
This is a core interface element that must never be modified in layout or functionality.

### Layout
```
[RGB: 123,123,123] [○] [Enter HEX code] [Apply Color]
```

### Components (left to right)
1. **RGB Display**
   - Format: "RGB: r,g,b"
   - Font: Inter, 0.875rem
   - Left padding: 40px

2. **Color Swatch**
   - Shape: Circle (borderRadius: 50%)
   - Size: 48x48px
   - Border: 1px solid rgba(0, 0, 0, 0.1)
   - Displays current selected color

3. **HEX Input**
   - Width: 150px
   - Height: 48px
   - Placeholder: "Enter HEX code"
   - Font: Inter, 0.875rem

4. **Apply Button**
   - Min width: 100px
   - Text: "Apply Color"
   - Font: Inter, no text transform
   - Border: 1px solid var(--border-color)

### Styling Rules
- All elements must remain in a single line
- Consistent gap (2 units) between elements
- Subtle borders and transitions
- Follows theme variables for colors

### Theme Integration
- Uses CSS variables for theming:
  - `--text-primary`
  - `--button-bg`
  - `--button-hover`
  - `--border-color`
  - `--disabled-bg`
  - `--disabled-text`

### Important Notes
- This layout is considered a core feature
- Elements must maintain their relative positions
- Spacing and alignment must remain consistent
- Any new features must be designed around this core layout, not by modifying it
