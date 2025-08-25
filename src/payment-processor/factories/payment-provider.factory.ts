import { Injectable, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { IPaymentProvider } from '../interfaces/payment-provider.interface';
import { WompiProviderService } from '../providers/wompi/wompi-provider.service';

export enum SupportedProviders {
  WOMPI = 'wompi',
  // STRIPE = 'stripe',  // Easily extensible
  // PAYPAL = 'paypal',  // Future providers
}

@Injectable()
export class PaymentProviderFactory {
  constructor(
    private readonly configService: ConfigService,
    private readonly wompiProvider: WompiProviderService,
    // private readonly stripeProvider: StripeProviderService, // Future
  ) {}
  
  getProvider(providerName: string): IPaymentProvider {
    const normalizedName = providerName.toLowerCase();
    
    switch (normalizedName) {
      case SupportedProviders.WOMPI:
        return this.wompiProvider;
      
      // case SupportedProviders.STRIPE:
      //   return this.stripeProvider;
      
      default:
        throw new BadRequestException(`Unsupported payment provider: ${providerName}`);
    }
  }
  
  getAvailableProviders(): string[] {
    return Object.values(SupportedProviders);
  }
  
  getDefaultProvider(): IPaymentProvider {
    const defaultProviderName = this.configService.get<string>('PAYMENT_PROVIDER') || 'wompi';
    return this.getProvider(defaultProviderName);
  }
}