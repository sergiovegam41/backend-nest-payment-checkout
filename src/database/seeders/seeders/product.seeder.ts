import { ISeeder, ISeederStrategy } from '../interfaces/seeder.interface';
import { ProductFactory, ProductData } from '../factories/product.factory';
import { ProductImageFactory, ProductImageData } from '../factories/product-image.factory';

export class ProductSeeder implements ISeeder {
  private productFactory: ProductFactory;
  private imageFactory: ProductImageFactory;

  constructor() {
    this.productFactory = new ProductFactory();
    this.imageFactory = new ProductImageFactory();
  }

  async run(strategy: ISeederStrategy): Promise<void> {
    console.log('🌱 Running Product Seeder...');

    // Clean existing data
    await strategy.truncate('productImage');
    await strategy.truncate('product');

    // Generate products
    const products = this.generateProducts(20); // Create 20 products
    await strategy.create('product', products);

    // Generate images for each product
    const allImages: ProductImageData[] = [];
    
    for (const product of products) {
      // Use factory's built-in random count logic (2-5 images)
      const images = this.imageFactory.createForProduct(product.id!);
      allImages.push(...images);
    }

    await strategy.create('productImage', allImages);

    console.log('✅ Product seeding completed');
    console.log(`   - ${products.length} products created`);
    console.log(`   - ${allImages.length} images created`);
  }

  getName(): string {
    return 'ProductSeeder';
  }

  private generateProducts(count: number): ProductData[] {
    const products: ProductData[] = [];

    for (let i = 0; i < count; i++) {
      const product = this.productFactory.create({
        id: `prod_${Date.now()}_${i}` // Simple ID for demo
      });
      
      products.push(product);
    }

    return products;
  }
}