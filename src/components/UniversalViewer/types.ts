// Base Types
export type ViewMode = 'swatch' | 'image';
export type LayoutType = 'row' | 'grid' | 'custom';
export type ColorFormat = 'rgb' | 'hex' | 'gray';
export type ImageSize = 'thumb' | 'preview' | 'full';

// Color Types
export interface RGBColor {
  r: number;
  g: number;
  b: number;
}

export interface SwatchItem {
  id: string;
  hex: string;
  rgb: RGBColor;
  name?: string;
  group?: string;  // For palette/catalog organization
}

// Image Types
export interface ImageItem {
  id: string;
  url: string;
  thumb?: string;
  preview?: string;
  title?: string;
  metadata?: {
    width: number;
    height: number;
    format: string;
  };
}

// Grid Types
export interface GridDimensions {
  rows: number;
  columns: number;
  gap?: number;
  aspectRatio?: number;
}

export interface CustomGrid extends GridDimensions {
  name?: string;
  description?: string;
  totalItems: number;  // rows * columns
  scrollable?: boolean;
  allowOverflow?: boolean;
}

// Layout Configuration
export interface LayoutConfig {
  type: LayoutType;
  spacing: number;
  columns?: number;
  rows?: number;
  grid?: GridDimensions | CustomGrid;
  responsive: boolean;
  maxWidth?: number;
  itemSize?: {
    width: number;
    height: number;
    margin?: number;
    padding?: number;
  };
  containerStyle?: React.CSSProperties;
}

// Component Props Interfaces

export interface UniversalViewerProps {
  mode: ViewMode;
  items: (SwatchItem | ImageItem)[];
  layout: LayoutConfig;
  onSelect?: (item: SwatchItem | ImageItem) => void;
  onBulkSelect?: (items: (SwatchItem | ImageItem)[]) => void;
  className?: string;
  style?: React.CSSProperties;
}

export interface ViewerBaseProps extends UniversalViewerProps {
  children?: React.ReactNode;
}

export interface SwatchViewProps {
  items: SwatchItem[];
  layout: LayoutConfig;
  displayMode: 'single' | 'palette' | 'catalog';
  colorFormat: ColorFormat;
  interactive?: boolean;
  showLabels?: boolean;
  onSelect?: (swatch: SwatchItem) => void;
}

export interface ImageViewProps {
  items: ImageItem[];
  layout: LayoutConfig;
  size: ImageSize;
  controls?: {
    zoom?: boolean;
    pan?: boolean;
    reset?: boolean;
  };
  quality?: 'low' | 'medium' | 'high';
  lazy?: boolean;
  onSelect?: (image: ImageItem) => void;
}

// State Interfaces

export interface ViewerState {
  selectedItems: (SwatchItem | ImageItem)[];
  zoom: number;
  pan: {
    x: number;
    y: number;
  };
  layout: LayoutConfig;
}

// Event Handler Types

export type SelectHandler = (item: SwatchItem | ImageItem) => void;
export type BulkSelectHandler = (items: (SwatchItem | ImageItem)[]) => void;
export type ZoomHandler = (level: number) => void;
export type PanHandler = (x: number, y: number) => void;

// Palette Types

export interface Palette {
  id: string;
  name: string;
  colors: SwatchItem[];
  type: 'small' | 'medium' | 'large' | 'custom';
  grid?: CustomGrid;  // For custom layouts
  description?: string;
  tags?: string[];
  createdAt?: Date;
  updatedAt?: Date;
}

// Catalog Types

export interface Catalog {
  id: string;
  name: string;
  description?: string;
  colors: SwatchItem[];
  grid?: CustomGrid;  // For custom layouts like 2x16, 5x10, etc.
  groups?: {
    [key: string]: SwatchItem[];
  };
  metadata?: {
    source?: string;
    brand?: string;
    season?: string;
    tags?: string[];
  };
  createdAt?: Date;
  updatedAt?: Date;
}

// Essential Metadata Types
export interface CoreColorMetadata {
  hex: string;
  rgb: RGBColor;
  name?: string;
  family?: string;  // For color grouping
}

export interface CoreAssetMetadata {
  id: string;
  created: Date;
  modified: Date;
  owner: string;
  tags?: string[];
}

export interface CoreCatalogMetadata extends CoreAssetMetadata {
  type: 'catalog';
  colors: CoreColorMetadata[];
  family?: string;  // For catalog grouping
  version: string;
}

export interface CorePaletteMetadata extends CoreAssetMetadata {
  type: 'palette';
  colors: CoreColorMetadata[];
  parentCatalog?: string;  // Reference to source catalog
}

export interface CoreImageMetadata extends CoreAssetMetadata {
  type: 'image';
  colors: CoreColorMetadata[];
  sourceFile: string;
  processing: {
    method: string;
    timestamp: Date;
  };
  preview?: {
    thumbnail: string;
  };
}

// Future expansion fields commented for reference
/*
Future Fields:
- HSL color values
- Digital watermarks
- QR codes
- Copyright details
- Usage rights
- Advanced relationships
*/

// Metadata Types
export interface ColorMetadata {
  hex: string;
  rgb: RGBColor;
  hsl?: {
    h: number;
    s: number;
    l: number;
  };
  name?: string;
  family?: string;
  tags?: string[];
}

export interface AssetMetadata {
  id: string;
  created: Date;
  modified: Date;
  owner: string;
  digitalWatermark?: string;
  copyright?: {
    holder: string;
    year: number;
    rights: string;
  };
  usage?: {
    license: string;
    restrictions?: string[];
    allowedUses?: string[];
  };
  qrCode?: {
    data: string;
    version: string;
  };
}

export interface CatalogMetadata extends AssetMetadata {
  type: 'catalog';
  colors: ColorMetadata[];
  family?: string;
  relationships?: {
    parent?: string;
    children?: string[];
    related?: string[];
  };
  version: string;
}

export interface PaletteMetadata extends AssetMetadata {
  type: 'palette';
  colors: ColorMetadata[];
  parentCatalog?: string;
  derivedFrom?: string[];
  usage?: {
    project?: string;
    brand?: string;
    season?: string;
  };
}

export interface ImageMetadata extends AssetMetadata {
  type: 'image';
  colors: ColorMetadata[];
  sourceFile: string;
  processing: {
    method: string;
    parameters: Record<string, any>;
    timestamp: Date;
  };
  preview?: {
    thumbnail: string;
    medium: string;
    large: string;
  };
}

// Display Configuration

export interface DisplayConfig {
  showHeaders?: boolean;
  showLabels?: boolean;
  showGrid?: boolean;
  showBorders?: boolean;
  highlightSelection?: boolean;
  animation?: {
    type: 'fade' | 'slide' | 'zoom' | 'none';
    duration: number;
  };
  theme?: {
    background?: string;
    text?: string;
    border?: string;
    highlight?: string;
  };
}

// Examples of usage:

/*
// Single Color Swatch
const swatch: SwatchItem = {
  id: '1',
  hex: '#FF0000',
  rgb: { r: 255, g: 0, b: 0 },
  name: 'Bright Red'
};

// Small Palette
const palette: Palette = {
  id: 'basic-5',
  name: 'Basic 5',
  colors: [
    { id: '1', hex: '#FF0000', rgb: { r: 255, g: 0, b: 0 } },
    { id: '2', hex: '#00FF00', rgb: { r: 0, g: 255, b: 0 } },
    { id: '3', hex: '#0000FF', rgb: { r: 0, g: 0, b: 255 } },
    { id: '4', hex: '#FFFF00', rgb: { r: 255, g: 255, b: 0 } },
    { id: '5', hex: '#FF00FF', rgb: { r: 255, g: 0, b: 255 } }
  ],
  type: 'small'
};

// Product Image
const image: ImageItem = {
  id: 'tshirt-1',
  url: '/images/full/tshirt-1.jpg',
  thumb: '/images/thumbs/tshirt-1.jpg',
  preview: '/images/previews/tshirt-1.jpg',
  title: 'Red T-Shirt',
  metadata: {
    width: 1200,
    height: 800,
    format: 'jpg'
  }
};

// Custom 2x16 Grid Catalog
const customCatalog: Catalog = {
  id: 'custom-32',
  name: 'Custom 32 Colors',
  colors: [], // 32 SwatchItems
  grid: {
    rows: 2,
    columns: 16,
    gap: 8,
    totalItems: 32,
    scrollable: true
  }
};

// 5x10 Grid Layout
const fiftyCatalog: Catalog = {
  id: 'fifty-colors',
  name: '50 Color Grid',
  colors: [], // 50 SwatchItems
  grid: {
    rows: 5,
    columns: 10,
    gap: 12,
    totalItems: 50,
    aspectRatio: 1
  }
};

// Classic 64 Grid (8x8)
const classic64: Catalog = {
  id: '6400',
  name: '6400 Catalog',
  colors: [], // 64 SwatchItems
  grid: {
    rows: 8,
    columns: 8,
    gap: 10,
    totalItems: 64
  },
  metadata: {
    source: 'Standard',
    brand: 'HEXTRA'
  }
};
*/
