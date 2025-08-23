import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

export interface HealthCheckStrategy {
  check(): Promise<{ isHealthy: boolean; error?: string }>;
}

@Injectable()
export class DatabaseHealthStrategy implements HealthCheckStrategy {
  constructor(private readonly prisma: PrismaService) {}

  async check(): Promise<{ isHealthy: boolean; error?: string }> {
    try {
      await this.prisma.$queryRaw`SELECT 1`;
      return { isHealthy: true };
    } catch (error) {
      return { 
        isHealthy: false, 
        error: error.message 
      };
    }
  }
}