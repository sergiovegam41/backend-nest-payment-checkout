import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PaymentProcessorService } from './payment-processor.service';
import { PaymentProcessorController } from './payment-processor.controller';
import { PaymentProviderFactory } from './factories/payment-provider.factory';
import { WompiProviderService } from './providers/wompi/wompi-provider.service';
import { WompiConfigService } from './providers/wompi/wompi-config.service';
import { SignatureService } from './services/signature.service';

@Module({
  imports: [ConfigModule],
  controllers: [PaymentProcessorController],
  providers: [
    PaymentProcessorService,
    PaymentProviderFactory,
    WompiProviderService,
    WompiConfigService,
    SignatureService,
  ],
  exports: [PaymentProcessorService],
})
export class PaymentProcessorModule {}
