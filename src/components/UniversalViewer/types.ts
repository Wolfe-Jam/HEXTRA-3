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
  width: number;
  height: number;
  margin?: number;
  padding?: number;
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

export interface ViewerBaseProps {
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
  grid?: CustomGrid;
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
  grid?: CustomGrid;
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
  family?: string;
  tags?: string[];
}

export interface CoreAssetMetadata {
  id: string;
  created: Date;
  modified: Date;
  owner: string;
  tags?: string[];
}

export interface CoreCatalogMetadata {
  type: 'catalog';
  colors: CoreColorMetadata[];
  family?: string;
  version: string;
}

export interface CorePaletteMetadata {
  type: 'palette';
  colors: CoreColorMetadata[];
  parentCatalog?: string;
}

export interface CoreImageMetadata {
  id: string;
  type: 'image';
  colors: CoreColorMetadata[];
  sourceFile: string;
  created: Date;
  processing: {
    method: string;
    timestamp: Date;
  };
  preview?: {
    thumbnail: string;
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
