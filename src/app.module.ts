import { Module } from '@nestjs/common';
import { ProductModule } from './product/product.module';
import { PrismaModule } from './prisma/prisma.module';
import { HealthController } from './health/health.controller';
import { HealthService } from './health/health.service';

@Module({
  imports: [PrismaModule, ProductModule],
  controllers: [HealthController],
  providers: [HealthService],
})
export class AppModule {}
