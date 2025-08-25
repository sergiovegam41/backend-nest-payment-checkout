import { Module } from '@nestjs/common';
import { ProductCheckoutController } from './product-checkout.controller';
import { ProductCheckoutService, CheckoutCalculatorService, CheckoutValidatorService } from './services';
import { PaymentProcessorModule } from '../payment-processor/payment-processor.module';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [
    PrismaModule,
    PaymentProcessorModule
  ],
  controllers: [ProductCheckoutController],
  providers: [
    ProductCheckoutService,
    CheckoutCalculatorService,
    CheckoutValidatorService
  ],
  exports: [ProductCheckoutService]
})
export class ProductCheckoutModule {}