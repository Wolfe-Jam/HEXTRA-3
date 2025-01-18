# HEXTRA-3 Architecture

## Overview
HEXTRA-3 is a client-side web application for professional-grade color manipulation, specifically designed for Print-on-Demand (POD) products.

## Frontend Architecture

### Core Components
- `App.js`: Main application logic and state management
- `Banner.js`: Header component with theme toggle
- `GlowComponents/`: UI component family
  - `GlowButton.js`: Enhanced button with glow effects
  - `GlowTextButton.js`: Text-based button with glow
  - `GlowToggleGroup.js`: Group of toggleable options
  - `GlowSwitch.js`: Toggle switch component

### State Management
Using React's local state management (useState):
- Image States
  - Working image
  - Processed image
  - Test image toggle
- Settings
  - Selected color
  - Luminance method
  - Enhancement toggle
- UI States
  - Theme (dark/light)
  - Error messages
  - Processing status

### Image Processing
Client-side processing using Jimp:
1. Image Input
   - File upload
   - URL import
2. Processing Pipeline
   - Conversion to Jimp object
   - Luminance calculation
   - Color application
   - URL generation for display

### Features
- Single Image Processing
  - File upload support
  - URL import capability
  - Real-time preview
- Color Management
  - Color wheel selection
  - Hex code input
  - Preset color palette
- Image Enhancement
  - Multiple luminance methods
    - Natural
    - Vibrant
    - Balanced
  - Enhancement toggle
  - Test image preview
- UI/UX
  - Dark/Light theme
  - Glow effect UI components
  - URL sharing system
  - Responsive design

### Dependencies
- **UI Framework**: @mui/material
- **Color Selection**: @uiw/react-color
- **Image Processing**: Jimp
- **Build/Deploy**: Vercel

## Technical Specifications
- **Framework**: React
- **Language**: JavaScript
- **Styling**: Material-UI + Custom CSS
- **Image Processing**: Browser-based
- **Deployment**: Vercel
- **Version Control**: Git/GitHub

## Current Limitations
- Single image processing only
- Browser-based processing
- No server-side operations
- No persistent storage
