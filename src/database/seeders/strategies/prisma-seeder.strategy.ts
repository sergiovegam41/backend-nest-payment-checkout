import { PrismaClient } from '@prisma/client';
import { ISeederStrategy } from '../interfaces/seeder.interface';

export class PrismaSeederStrategy implements ISeederStrategy {
  private prisma: PrismaClient;

  constructor() {
    this.prisma = new PrismaClient();
  }

  async create<T>(model: string, data: T[]): Promise<any[]> {
    const modelDelegate = this.getModelDelegate(model);
    
    if (!modelDelegate) {
      throw new Error(`Model ${model} not found in Prisma client`);
    }

    try {
      // For UUID models, we need to create individually to get the IDs back
      if (model === 'product') {
        const createdRecords: any[] = [];
        for (const item of data) {
          const created = await modelDelegate.create({ data: item });
          createdRecords.push(created);
        }
        
        return createdRecords;
      } else {
        // Use createMany for other models
        await modelDelegate.createMany({
          data,
          skipDuplicates: true
        });
        
        return [];
      }
    } catch (error) {
      
      throw error;
    }
  }

  async truncate(model: string): Promise<void> {
    try {
      // Special handling for products - need to clean related data first
      if (model === 'product') {
        console.log('🧹 Cleaning related data before truncating products...');
        
        // Delete in order of foreign key dependencies
        await this.prisma.checkoutItem.deleteMany();
        console.log('   ✅ Cleaned checkout_items');
        
        await this.prisma.checkout.deleteMany();
        console.log('   ✅ Cleaned checkouts');
        
        await (this.prisma as any).productImage.deleteMany();
        console.log('   ✅ Cleaned product_images');
        
        await this.prisma.product.deleteMany();
        console.log('   ✅ Cleaned products');
        
        return;
      }
      
      // Regular truncation for other models
      const modelDelegate = this.getModelDelegate(model);
      
      if (!modelDelegate) {
        throw new Error(`Model ${model} not found in Prisma client`);
      }

      await modelDelegate.deleteMany();
      
    } catch (error) {
      console.error(`Error truncating model ${model}:`, error);
      throw error;
    }
  }

  async disconnect(): Promise<void> {
    await this.prisma.$disconnect();
    
  }

  private getModelDelegate(model: string): any {
    const modelMap: Record<string, any> = {
      'product': this.prisma.product,
      'productImage': (this.prisma as any).productImage,
      'checkout': this.prisma.checkout,
      'checkoutItem': this.prisma.checkoutItem,
      // Add more models as needed
    };

    return modelMap[model];
  }
}