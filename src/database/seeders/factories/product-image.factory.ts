import { IDataFactory } from '../interfaces/seeder.interface';
import { ALT_TEXT_TEMPLATES, IMAGE_CONFIG, AltTextTemplate } from '../data';

export interface ProductImageData {
  id?: string;
  url: string;
  altText?: string;
  position: number;
  isMain: boolean;
  productId: string;
}

export class ProductImageFactory implements IDataFactory<ProductImageData> {

  create(overrides?: Partial<ProductImageData>): ProductImageData {
    const altTemplate = this.getRandomAltText();
    
    return {
      url: `${IMAGE_CONFIG.BASE_URL}/${IMAGE_CONFIG.DEFAULT_WIDTH}/${IMAGE_CONFIG.DEFAULT_HEIGHT}/`,
      altText: altTemplate,
      position: 0, // Will be overridden by seeder
      isMain: false, // Will be set by seeder
      productId: '', // Must be provided by seeder
      ...overrides
    };
  }

  createMany(count: number, overrides?: Partial<ProductImageData>): ProductImageData[] {
    return Array.from({ length: count }, (_, index) => 
      this.create({
        position: index,
        isMain: index === 0, // First image is main
        ...overrides
      })
    );
  }

  createForProduct(productId: string, imageCount?: number): ProductImageData[] {
    const count = imageCount || Math.floor(
      Math.random() * (IMAGE_CONFIG.MAX_IMAGES_PER_PRODUCT - IMAGE_CONFIG.MIN_IMAGES_PER_PRODUCT + 1)
    ) + IMAGE_CONFIG.MIN_IMAGES_PER_PRODUCT;
    
    return this.createMany(count, { productId });
  }

  private getRandomAltText(): AltTextTemplate {
    return ALT_TEXT_TEMPLATES[
      Math.floor(Math.random() * ALT_TEXT_TEMPLATES.length)
    ];
  }
}