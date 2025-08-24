export interface ISeederStrategy {
  create<T>(model: string, data: T[]): Promise<any[]>;
  truncate(model: string): Promise<void>;
  disconnect(): Promise<void>;
}

export interface IDataFactory<T> {
  create(overrides?: Partial<T>): T;
  createMany(count: number, overrides?: Partial<T>): T[];
}

export interface ISeeder {
  run(strategy: ISeederStrategy): Promise<void>;
  getName(): string;
}