import { ISeeder, ISeederStrategy } from './interfaces/seeder.interface';
import { PrismaSeederStrategy } from './strategies/prisma-seeder.strategy';
import { JsonSeederStrategy } from './strategies/json-seeder.strategy';
import { ProductSeeder } from './seeders/product.seeder';

export type SeederStrategyType = 'prisma' | 'json';

export class SeedService {
  private strategies: Map<SeederStrategyType, ISeederStrategy>;
  private seeders: ISeeder[];

  constructor() {
    this.strategies = new Map();
    this.seeders = [];
    this.initializeStrategies();
    this.initializeSeeders();
  }

  async run(strategyType: SeederStrategyType = 'prisma'): Promise<void> {
    const strategy = this.strategies.get(strategyType);
    
    if (!strategy) {
      throw new Error(`Strategy ${strategyType} not found`);
    }

    
    
    

    const startTime = Date.now();

    try {
      for (const seeder of this.seeders) {
        
        await seeder.run(strategy);
      }

      const duration = Date.now() - startTime;
      
      
      
    } catch (error) {
      console.error('\n❌ Seeding failed:', error);
      throw error;
    } finally {
      await strategy.disconnect();
    }
  }

  async runSpecific(seederNames: string[], strategyType: SeederStrategyType = 'prisma'): Promise<void> {
    const strategy = this.strategies.get(strategyType);
    
    if (!strategy) {
      throw new Error(`Strategy ${strategyType} not found`);
    }

    const selectedSeeders = this.seeders.filter(seeder => 
      seederNames.includes(seeder.getName())
    );

    if (selectedSeeders.length === 0) {
      throw new Error(`No seeders found matching: ${seederNames.join(', ')}`);
    }

    
    

    try {
      for (const seeder of selectedSeeders) {
        
        await seeder.run(strategy);
      }

      
    } catch (error) {
      console.error('\n❌ Seeding failed:', error);
      throw error;
    } finally {
      await strategy.disconnect();
    }
  }

  getAvailableSeeders(): string[] {
    return this.seeders.map(seeder => seeder.getName());
  }

  getAvailableStrategies(): SeederStrategyType[] {
    return Array.from(this.strategies.keys());
  }

  private initializeStrategies(): void {
    this.strategies.set('prisma', new PrismaSeederStrategy());
    this.strategies.set('json', new JsonSeederStrategy());
  }

  private initializeSeeders(): void {
    // Register all seeders here
    this.seeders = [
      new ProductSeeder(),
      // Add more seeders as needed:
      // new UserSeeder(),
      // new CategorySeeder(),
    ];
  }
}