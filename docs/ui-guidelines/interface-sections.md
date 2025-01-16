# HEXTRA-3 Interface Sections

## Section Layout
The interface is divided into distinct sections, each with a specific purpose and layout rules.
Each section is separated by invisible margins that maintain visual hierarchy.

```
┌──────────────────────────────────┐
│             SECTION A            │ ← Banner
└──────────────────────────────────┘

┌──────────────────────────────────┐
│             SECTION B            │ ← RGB Color Disc
└──────────────────────────────────┘

┌──────────────────────────────────┐
│             SECTION C            │ ← Grayscale Display Bar
└──────────────────────────────────┘

┌──────────────────────────────────┐
│             SECTION D            │ ← HEX Input Bar
└──────────────────────────────────┘

┌──────────────────────────────────┐
│             SECTION E            │ ← Load Bar
└──────────────────────────────────┘

┌──────────────────────────────────┐
│             SECTION F            │ ← Main Image Window
└──────────────────────────────────┘

┌──────────────────────────────────┐
│             SECTION G            │ ← Image Adjustments
└──────────────────────────────────┘
```

## Section Definitions

### Section A: Banner
- Full-width application header
- Fixed height: 64px
- Always visible, fixed position
- Contains app identity and theme controls

### Section B: RGB Color Disc
- Centered color selection interface
- Fixed size: 240x240px
- Primary color selection tool
- Clean, label-free design

### Section C: Grayscale Display Bar
- Width matches RGB Color Disc (240px)
- Centered below disc
- Components:
  - Black to white gradient bar
  - Position indicator showing current value
  - "GRAY Value: 123" display (0-255 range)
- Consistent spacing with sections above/below

### Section D: HEX Input Bar
- Single-line control interface
- Fixed layout: `[RGB: r,g,b] [○] [Input] [Apply]`
- 40px left padding
- Critical: Layout must not change

### Section E: Load Bar
- Image source controls
- Full-width URL input with action buttons
- Consistent height with Section D
- Maintains "OR" separator position

### Section F: Main Image Window
- Primary content display
- Responsive dimensions
- Integrated download button
- Maintains aspect ratio

### Section G: Image Adjustments
- Control panel for image processing
- Consistent slider layouts
- Clear visual grouping
- Real-time effect preview

## Core Components

### IconTextField
Our standard text input component that supports both start and end icons. Used throughout the application for consistent input styling and behavior.

Key features:
- Start icon for input type indication (e.g., link icon for URLs)
- Optional reset button with glow effect
- Consistent height (48px) and font styling
- Themed colors and glow effects matching our design system

Common uses in our sections:
- Section B: HEX color input with reset
- Section D: URL input with link icon and reset
- Future use: Search inputs, email inputs, etc.

[View full IconTextField documentation](./components/IconTextField.md)

## Section Spacing
- Each section is separated by consistent margins
- Margins can be:
  - Invisible (current default)
  - Visible dividers (optional enhancement)
  - Themed separators (future consideration)
- Standard margin: 24px (can be adjusted globally)

## Important Rules
1. Sections must remain in order (A→G)
2. Each section maintains internal layout
3. Spacing between sections is consistent
4. New features must respect section boundaries
5. Sections can be collapsed but not reordered

## Theme Integration
- Each section respects global theme variables
- Section backgrounds can be distinct
- Separators can be themed independently
- Consistent spacing across themes
