# HEXTRA-3 Architecture

## Overview
HEXTRA-3 is a professional-grade color manipulation suite designed around three core pillars:
- **COLORIZE**: Advanced color selection and manipulation
- **VISUALIZE**: Real-time image processing and preview
- **MESMERIZE**: Production-scale asset generation and workflow automation

## Application Structure

### Section Layout
1. **Section A - COLORIZE**
   - Color wheel interface
   - Hex code input
   - Preset color management
   - Color analysis tools
   - RGB and Grayscale swatches

2. **Section B - VISUALIZE**
   - Image workspace
   - Real-time preview
   - Test image toggle
   - Enhancement controls
   - Luminance method selection

3. **Section G - MESMERIZE**
   - Universal Viewer System
   - Batch processing pipeline
   - Color catalog management
   - Asset generation system

### Core Components
- `App.js`: Main application logic and state management
- `Banner.js`: Header component with theme toggle
- `GlowComponents/`: UI component family
  - `GlowButton.js`: Enhanced button with glow effects
  - `GlowTextButton.js`: Text-based button with glow
  - `GlowToggleGroup.js`: Group of toggleable options
  - `GlowSwitch.js`: Toggle switch component
- `UniversalViewer/`: Unified display system
  - `ViewerBase.js`: Core viewer functionality
  - `SwatchView.js`: Color swatch rendering
  - `ImageView.js`: Product image rendering
  - `ViewLayouts.js`: Row and grid layouts

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
- MESMERIZE States
  - View mode (blind/view)
  - Current palette/catalog
  - Batch processing status
  - Results cache

### Color Management System
1. **Swatches**
   - RGB Swatch with HEX display
   - Grayscale Swatch
   - Interactive color selection

2. **Palettes**
   - Small sets (2-5 colors)
   - Medium sets (6, 12 colors)
   - Large sets (16 colors)
   - Row-based display format

3. **Catalogs**
   - 64000 Catalog (64 pre-loaded colors)
   - Brand-specific catalogs
   - Grid-based display format
   - Search and filter capabilities

### Processing Modes
1. **Blind Mode**
   - Direct processing pipeline
   - Minimal UI interaction
   - Immediate HEXTRAS generation
   - Batch optimization

2. **View Mode**
   - Interactive palette management
   - Catalog browsing and selection
   - Preview capabilities
   - Export options

### Storage Architecture
1. **Phase 1: Local Storage**
   - Palette persistence
   - Recent operations
   - User preferences
   - Session management

2. **Phase 2: Cloud Storage**
   - Subscriber accounts
   - Palette/Catalog sync
   - Processing history
   - Asset management

### Output System
1. **File Formats**
   - HEXTRAS zip archives
   - CSV exports (palettes/catalogs)
   - Individual processed images
   - Batch results

2. **View Options**
   - Thumbnail grid
   - Small/Medium previews
   - Full-size display
   - Zoom and pan interface

### Dependencies
- **Frontend**
  - @mui/material (UI framework)
  - @uiw/react-color (Color selection)
  - Jimp (Image processing)

- **Future Backend**
  - Node.js
  - Express.js
  - Cloud services (AWS/Google)

## Technical Specifications
- **Frontend**: React
- **Language**: JavaScript
- **Styling**: Material-UI + Custom CSS
- **Image Processing**: Browser-based (moving to server)
- **Deployment**: Vercel
- **Version Control**: Git/GitHub

## Development Roadmap
1. **Current (v1.2.7)**
   - Complete COLORIZE and VISUALIZE features
   - Client-side processing
   - Single image workflow

2. **Next (v1.3.0)**
   - Initial MESMERIZE implementation
   - Universal Viewer component
   - Basic palette management
   - Local storage integration

3. **Future (v1.4.0+)**
   - Cloud storage system
   - Advanced catalog features
   - Subscriber management
   - Production scaling
   - API integrations
