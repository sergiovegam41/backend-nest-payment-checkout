import { IDataFactory } from '../interfaces/seeder.interface';
import { PRODUCT_TEMPLATES, ProductTemplate } from '../data';

export interface ProductData {
  id?: string;
  name: string;
  description?: string;
  price: number;
  sku: string;
  stock: number;
  isActive: boolean;
}

export class ProductFactory implements IDataFactory<ProductData> {

  create(overrides?: Partial<ProductData>): ProductData {
    const template = this.getRandomTemplate();
    const randomVariation = Math.random() * 200 - 100; // ±$100 variation
    
    return {
      name: template.name,
      description: template.description,
      price: Math.round((template.basePrice + randomVariation) * 100) / 100,
      sku: this.generateSKU(template.name),
      stock: Math.floor(Math.random() * 100) + 10, // 10-110 stock
      isActive: Math.random() > 0.1, // 90% active
      ...overrides
    };
  }

  createMany(count: number, overrides?: Partial<ProductData>): ProductData[] {
    return Array.from({ length: count }, () => this.create(overrides));
  }

  private getRandomTemplate(): ProductTemplate {
    return PRODUCT_TEMPLATES[
      Math.floor(Math.random() * PRODUCT_TEMPLATES.length)
    ];
  }

  private generateSKU(productName: string): string {
    const prefix = productName
      .split(' ')
      .map(word => word.substring(0, 3).toUpperCase())
      .join('-');
    
    const suffix = Math.random().toString(36).substring(2, 8).toUpperCase();
    
    return `${prefix}-${suffix}`;
  }
}