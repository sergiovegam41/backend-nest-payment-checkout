import { PrismaClient } from '@prisma/client';
import { ISeederStrategy } from '../interfaces/seeder.interface';

export class PrismaSeederStrategy implements ISeederStrategy {
  private prisma: PrismaClient;

  constructor() {
    this.prisma = new PrismaClient();
  }

  async create<T>(model: string, data: T[]): Promise<void> {
    const modelDelegate = this.getModelDelegate(model);
    
    if (!modelDelegate) {
      throw new Error(`Model ${model} not found in Prisma client`);
    }

    // Use createMany for better performance
    try {
      await modelDelegate.createMany({
        data,
        skipDuplicates: true
      });
      
      console.log(`✅ Created ${data.length} records for ${model}`);
    } catch (error) {
      console.error(`❌ Error creating ${model}:`, error);
      throw error;
    }
  }

  async truncate(model: string): Promise<void> {
    const modelDelegate = this.getModelDelegate(model);
    
    if (!modelDelegate) {
      throw new Error(`Model ${model} not found in Prisma client`);
    }

    try {
      await modelDelegate.deleteMany();
      console.log(`🗑️  Truncated ${model} table`);
    } catch (error) {
      console.error(`❌ Error truncating ${model}:`, error);
      throw error;
    }
  }

  async disconnect(): Promise<void> {
    await this.prisma.$disconnect();
    console.log('🔌 Disconnected from database');
  }

  private getModelDelegate(model: string): any {
    const modelMap: Record<string, any> = {
      'product': this.prisma.product,
      'productImage': (this.prisma as any).productImage,
      // Add more models as needed
    };

    return modelMap[model];
  }
}