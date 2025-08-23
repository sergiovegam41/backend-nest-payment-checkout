import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class HealthService {
  constructor(private readonly prisma: PrismaService) {}

  async checkHealth() {
    try {
      // Check database connection
      await this.prisma.$queryRaw`SELECT 1`;
      
      return {
        status: 'ok',
        timestamp: new Date().toISOString(),
        database: 'connected',
        uptime: process.uptime(),
        environment: process.env.NODE_ENV || 'development',
        url: process.env.APP_URL || 'http://localhost:3000',
      };
    } catch (error) {
      return {
        status: 'error',
        timestamp: new Date().toISOString(),
        database: 'disconnected',
        uptime: process.uptime(),
        environment: process.env.NODE_ENV || 'development',
        url: process.env.APP_URL || 'http://localhost:3000',
        error: error.message,
      };
    }
  }

  async checkDatabase() {
    try {
      await this.prisma.$queryRaw`SELECT 1`;
      return { status: 'connected' };
    } catch (error) {
      return { 
        status: 'disconnected', 
        error: error.message 
      };
    }
  }
}