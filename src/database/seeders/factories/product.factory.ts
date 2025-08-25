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
    // Smaller variation to ensure minimum Wompi requirements (1500 pesos = $1.5 USD minimum)
    const randomVariation = Math.random() * 100 - 50; // ±$50 variation (smaller)
    const finalPrice = Math.max(template.basePrice + randomVariation, 1.5); // Minimum $1.5 USD
    
    return {
      name: template.name,
      description: template.description,
      price: Math.round(finalPrice * 100) / 100,
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