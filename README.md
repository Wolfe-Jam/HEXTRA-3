# HEXTRA-3 Colorize | Visualize | Memerize

HEXTRA-3 is a React-based web application that allows users to apply colors to images while preserving shadows, highlights, and transparency.

## Features

- Apply colors to images while maintaining original luminance
- Preserve image transparency
- Real-time color selection with color wheel
- Support for custom image URLs
- Default HEXTRA master image included

## Technical Stack

- React 18
- Material-UI for UI components
- Jimp for image processing
- @uiw/react-color for color selection

## Setup

1. Install dependencies:
```bash
npm install
```

2. Start the development server:
```bash
npm start
```

The application will be available at `http://localhost:3000`

## Version History

### v1.1.0 - Complete UI redesign with modern aesthetics
- Complete UI redesign with modern aesthetics
- Added RGB color display
- Improved color wheel interaction
- Updated typography with Inter and League Spartan fonts
- Enhanced dark/light theme implementation
- Optimized layout and spacing

### v1.0.0 - Initial Release
- Basic color application functionality
- Transparency preservation
- Color wheel selection
- Default HEXTRA master image
- Image processing with luminance preservation

## Development Notes

The application uses custom webpack configuration through react-app-rewired to support Jimp in the browser environment. This includes polyfills for various Node.js core modules.
