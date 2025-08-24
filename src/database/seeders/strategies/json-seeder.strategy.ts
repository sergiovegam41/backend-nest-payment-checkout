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
      
      console.log(`✅ Created ${data.length} records for ${model} in ${fileName}`);
      return []; // JSON strategy doesn't return created records
    } catch (error) {
      console.error(`❌ Error creating JSON for ${model}:`, error);
      throw error;
    }
  }

  async truncate(model: string): Promise<void> {
    // For JSON strategy, truncate means creating empty file
    try {
      const fileName = `${model.toLowerCase()}.json`;
      const filePath = join(this.outputDir, fileName);
      
      writeFileSync(filePath, JSON.stringify([], null, 2));
      console.log(`🗑️  Truncated ${model} JSON file`);
    } catch (error) {
      console.error(`❌ Error truncating ${model} JSON:`, error);
      throw error;
    }
  }

  async disconnect(): Promise<void> {
    console.log('📁 JSON files saved to:', this.outputDir);
  }

  private ensureOutputDir(): void {
    try {
      mkdirSync(this.outputDir, { recursive: true });
    } catch (error) {
      // Directory might already exist, ignore error
    }
  }
}