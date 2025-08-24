import { Module } from '@nestjs/common';
import { PaymentProcessorService } from './payment-processor.service';
import { PaymentProcessorController } from './payment-processor.controller';

@Module({
  controllers: [PaymentProcessorController],
  providers: [PaymentProcessorService],
})
export class PaymentProcessorModule {}
