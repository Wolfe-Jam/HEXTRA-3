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
    if (!result) {
      return { r: 0, g: 0, b: 0 };
    }
    return {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16)
    };
  }

  private async generateThumbnail(imageUrl: string): Promise<string> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      
      if (!ctx) {
        reject(new Error('Failed to get canvas context'));
        return;
      }

      img.onload = () => {
        const MAX_SIZE = 200;
        const scale = MAX_SIZE / Math.max(img.width, img.height);
        canvas.width = img.width * scale;
        canvas.height = img.height * scale;
        
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        resolve(canvas.toDataURL('image/jpeg', 0.7));
      };

      img.onerror = () => {
        reject(new Error('Failed to load image'));
      };

      img.src = imageUrl;
    });
  }

  public async processImage(processedImage: ProcessedImage): Promise<CoreImageMetadata> {
    const thumbnail = await this.generateThumbnail(processedImage.resultImage);
    
    const colors: CoreColorMetadata[] = processedImage.colors.map(hex => ({
      hex,
      rgb: this.hexToRgb(hex),
      name: '',  // Could be enhanced with color naming logic
      tags: []
    }));

    const metadata: CoreImageMetadata = {
      id: this.generateId(),
      type: 'image',
      colors,
      sourceFile: processedImage.file.name,
      created: new Date(),
      processing: {
        method: 'auto',
        timestamp: new Date()
      },
      preview: {
        thumbnail
      }
    };

    return metadata;
  }
}
