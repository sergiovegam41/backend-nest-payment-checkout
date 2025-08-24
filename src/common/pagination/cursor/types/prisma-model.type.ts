export interface PrismaModel {
  id: string;
  createdAt: Date;
  updatedAt?: Date;
}

export type PrismaDelegate = {
  findMany: (args?: any) => Promise<any[]>;
  findUnique: (args: any) => Promise<any>;
  count?: (args?: any) => Promise<number>;
};