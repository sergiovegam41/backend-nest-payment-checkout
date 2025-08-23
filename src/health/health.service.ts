import { Injectable } from '@nestjs/common';
import { HealthResponse, DatabaseHealthResponse } from './interfaces/health-response.interface';
import { HealthResponseFactory } from './factories/health-response.factory';
import { DatabaseHealthStrategy } from './strategies/database-health.strategy';
import { DATABASE_STATUS } from './constants/health.constants';

@Injectable()
export class HealthService {
  constructor(
    private readonly databaseHealthStrategy: DatabaseHealthStrategy,
    private readonly healthResponseFactory: HealthResponseFactory,
  ) {}

  async checkHealth(): Promise<HealthResponse> {
    const databaseCheck = await this.databaseHealthStrategy.check();
    
    if (databaseCheck.isHealthy) {
      return this.healthResponseFactory.createSuccessResponse(DATABASE_STATUS.CONNECTED);
    }
    
    return this.healthResponseFactory.createErrorResponse(
      databaseCheck.error || 'Unknown database error',
      DATABASE_STATUS.DISCONNECTED
    );
  }

  async checkDatabase(): Promise<DatabaseHealthResponse> {
    const result = await this.databaseHealthStrategy.check();
    
    return {
      status: result.isHealthy ? DATABASE_STATUS.CONNECTED : DATABASE_STATUS.DISCONNECTED,
      error: result.error,
    };
  }
}