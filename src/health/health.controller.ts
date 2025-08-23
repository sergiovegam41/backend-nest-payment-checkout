import { Controller, Get } from '@nestjs/common';
import { HealthService } from './health.service';
import { HealthResponse, DatabaseHealthResponse } from './interfaces/health-response.interface';

@Controller('health')
export class HealthController {
  constructor(private readonly healthService: HealthService) {}

  @Get()
  async check(): Promise<HealthResponse> {
    return this.healthService.checkHealth();
  }

  @Get('database')
  async checkDatabase(): Promise<DatabaseHealthResponse> {
    return this.healthService.checkDatabase();
  }
}