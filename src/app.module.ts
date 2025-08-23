import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ProductModule } from './product/product.module';
import { PrismaModule } from './prisma/prisma.module';
import { HealthController } from './health/health.controller';
import { HealthService } from './health/health.service';
import { HealthResponseFactory } from './health/factories/health-response.factory';
import { DatabaseHealthStrategy } from './health/strategies/database-health.strategy';
import configuration from './config/configuration';
import { configValidationSchema } from './config/validation.schema';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
      validationSchema: configValidationSchema,
      validationOptions: {
        allowUnknown: true,
        abortEarly: false,
      },
    }),
    PrismaModule,
    ProductModule,
  ],
  controllers: [HealthController],
  providers: [
    HealthService,
    HealthResponseFactory,
    DatabaseHealthStrategy,
  ],
})
export class AppModule {}
