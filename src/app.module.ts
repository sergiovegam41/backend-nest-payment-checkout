import { Module } from '@nestjs/common';
import { ProductModule } from './product/product.module';
import { PrismaModule } from './prisma/prisma.module';
import { HealthController } from './health/health.controller';
import { HealthService } from './health/health.service';
import { HealthResponseFactory } from './health/factories/health-response.factory';
import { DatabaseHealthStrategy } from './health/strategies/database-health.strategy';

@Module({
  imports: [PrismaModule, ProductModule],
  controllers: [HealthController],
  providers: [
    HealthService,
    HealthResponseFactory,
    DatabaseHealthStrategy,
  ],
})
export class AppModule {}
