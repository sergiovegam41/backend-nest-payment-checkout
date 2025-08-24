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
    

    // Clean existing data
    await strategy.truncate('productImage');
    await strategy.truncate('product');

    // Generate and create products individually to get their IDs
    const productData = this.generateProducts(20);
    const createdProducts = await strategy.create('product', productData);

    // Generate images for each created product
    const allImages: ProductImageData[] = [];
    
    for (const product of createdProducts) {
      const images = this.imageFactory.createForProduct(product.id);
      allImages.push(...images);
    }

    await strategy.create('productImage', allImages);

    
    
    
  }

  getName(): string {
    return 'ProductSeeder';
  }

  private generateProducts(count: number): ProductData[] {
    const products: ProductData[] = [];

    for (let i = 0; i < count; i++) {
      const product = this.productFactory.create();
      products.push(product);
    }

    return products;
  }
}