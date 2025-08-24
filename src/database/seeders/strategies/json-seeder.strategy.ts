import { writeFileSync, mkdirSync } from 'fs';
import { join } from 'path';
import { ISeederStrategy } from '../interfaces/seeder.interface';

export class JsonSeederStrategy implements ISeederStrategy {
  private outputDir: string;

  constructor(outputDir: string = './seeds-output') {
    this.outputDir = outputDir;
    this.ensureOutputDir();
  }

  async create<T>(model: string, data: T[]): Promise<any[]> {
    try {
      const fileName = `${model.toLowerCase()}.json`;
      const filePath = join(this.outputDir, fileName);
      
      writeFileSync(filePath, JSON.stringify(data, null, 2));
      
      
      return []; // JSON strategy doesn't return created records
    } catch (error) {
      
      throw error;
    }
  }

  async truncate(model: string): Promise<void> {
    // For JSON strategy, truncate means creating empty file
    try {
      const fileName = `${model.toLowerCase()}.json`;
      const filePath = join(this.outputDir, fileName);
      
      writeFileSync(filePath, JSON.stringify([], null, 2));
      
    } catch (error) {
      
      throw error;
    }
  }

  async disconnect(): Promise<void> {
    
  }

  private ensureOutputDir(): void {
    try {
      mkdirSync(this.outputDir, { recursive: true });
    } catch (error) {
      // Directory might already exist, ignore error
    }
  }
}