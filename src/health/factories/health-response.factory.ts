import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { HealthResponse } from '../interfaces/health-response.interface';
import { HealthStatus, DatabaseStatus } from '../enums';

@Injectable()
export class HealthResponseFactory {
  constructor(private readonly configService: ConfigService) {}
  
  createSuccessResponse(databaseStatus: DatabaseStatus): HealthResponse {
    return this.buildBaseResponse(HealthStatus.OK, databaseStatus);
  }

  createErrorResponse(error: string, databaseStatus: DatabaseStatus = DatabaseStatus.DISCONNECTED): HealthResponse {
    return {
      ...this.buildBaseResponse(HealthStatus.ERROR, databaseStatus),
      error,
    };
  }

  private buildBaseResponse(status: HealthStatus, databaseStatus: DatabaseStatus): HealthResponse {
    const nodeEnv = this.configService.get('NODE_ENV');
    const url = this.configService.get('APP_URL');
    
    return {
      status,
      timestamp: new Date().toISOString(),
      database: databaseStatus,
      uptime: process.uptime(),
      environment: nodeEnv,
      url: url,
    };
  }
}