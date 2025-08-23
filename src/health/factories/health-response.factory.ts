import { Injectable } from '@nestjs/common';
import { HealthResponse } from '../interfaces/health-response.interface';
import { HEALTH_STATUS, DATABASE_STATUS, DEFAULT_VALUES } from '../constants/health.constants';

@Injectable()
export class HealthResponseFactory {
  
  createSuccessResponse(databaseStatus: typeof DATABASE_STATUS.CONNECTED | typeof DATABASE_STATUS.DISCONNECTED): HealthResponse {
    return this.buildBaseResponse(HEALTH_STATUS.OK, databaseStatus);
  }

  createErrorResponse(error: string, databaseStatus: typeof DATABASE_STATUS.CONNECTED | typeof DATABASE_STATUS.DISCONNECTED = DATABASE_STATUS.DISCONNECTED): HealthResponse {
    return {
      ...this.buildBaseResponse(HEALTH_STATUS.ERROR, databaseStatus),
      error,
    };
  }

  private buildBaseResponse(status: typeof HEALTH_STATUS.OK | typeof HEALTH_STATUS.ERROR, databaseStatus: typeof DATABASE_STATUS.CONNECTED | typeof DATABASE_STATUS.DISCONNECTED): HealthResponse {
    return {
      status,
      timestamp: new Date().toISOString(),
      database: databaseStatus,
      uptime: process.uptime(),
      environment: process.env.NODE_ENV || DEFAULT_VALUES.ENVIRONMENT,
      url: process.env.APP_URL || DEFAULT_VALUES.APP_URL,
    };
  }
}