import { v4 as uuidv4 } from 'uuid';
import { 
  CoreImageMetadata, 
  CoreColorMetadata, 
  RGBColor 
} from '../types';

interface ProcessedImage {
  file: File;
  colors: string[];  // hex codes
  sourceImage: string;
  resultImage: string;
}

export class AutoMetadataProcessor {
  private generateId(): string {
    return uuidv4();
  }

  private hexToRgb(hex: string): RGBColor {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16)
    } : { r: 0, g: 0, b: 0 };
  }

  private async generateThumbnail(imageUrl: string): Promise<string> {
    // Basic thumbnail generation
    const img = new Image();
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    
    return new Promise((resolve) => {
      img.onload = () => {
        const MAX_SIZE = 200;
        const scale = MAX_SIZE / Math.max(img.width, img.height);
        canvas.width = img.width * scale;
        canvas.height = img.height * scale;
        
        ctx?.drawImage(img, 0, 0, canvas.width, canvas.height);
        resolve(canvas.toDataURL('image/jpeg', 0.7));
      };
      img.src = imageUrl;
    });
  }

  public async processImage(processedImage: ProcessedImage): Promise<CoreImageMetadata> {
    const thumbnail = await this.generateThumbnail(processedImage.resultImage);
    
    // Auto-generate color metadata
    const colors: CoreColorMetadata[] = processedImage.colors.map(hex => ({
      hex,
      rgb: this.hexToRgb(hex),
      family: 'auto-detected'  // Basic for now, can be enhanced later
    }));

    // Create basic metadata
    const metadata: CoreImageMetadata = {
      id: this.generateId(),
      type: 'image',
      created: new Date(),
      modified: new Date(),
      owner: 'current-user',  // Will be replaced with actual user ID
      colors,
      sourceFile: processedImage.sourceImage,
      processing: {
        method: 'recolor',
        timestamp: new Date()
      },
      preview: {
        thumbnail
      },
      tags: ['auto-processed']
    };

    // Store in local storage for persistence
    this.storeMetadata(metadata);

    return metadata;
  }

  private storeMetadata(metadata: CoreImageMetadata): void {
    // Get existing metadata array or initialize new one
    const stored = localStorage.getItem('hextra_processed_images');
    const existingMetadata: CoreImageMetadata[] = stored ? JSON.parse(stored) : [];

    // Add new metadata
    existingMetadata.push(metadata);

    // Keep only last 50 items for non-subscribers (can be configured)
    const MAX_ITEMS = 50;
    while (existingMetadata.length > MAX_ITEMS) {
      existingMetadata.shift();
    }

    // Save back to storage
    localStorage.setItem('hextra_processed_images', JSON.stringify(existingMetadata));
  }

  public getRecentImages(): CoreImageMetadata[] {
    const stored = localStorage.getItem('hextra_processed_images');
    return stored ? JSON.parse(stored) : [];
  }
}

// Usage example:
/*
const processor = new AutoMetadataProcessor();

// When image is processed:
const processedImage = {
  file: imageFile,
  colors: ['#FF0000', '#00FF00'],
  sourceImage: 'original.jpg',
  resultImage: 'processed.jpg'
};

const metadata = await processor.processImage(processedImage);

// Later, to retrieve:
const recentImages = processor.getRecentImages();
*/
