import { Injectable, BadRequestException } from '@nestjs/common';
import { PaymentProviderFactory } from './factories/payment-provider.factory';
import { PaymentRequestDto, PaymentLinkResponseDto, PaymentStatusResponseDto } from './dto';
import type { IPaymentProvider } from './interfaces/payment-provider.interface';

@Injectable()
export class PaymentProcessorService {
  constructor(
    private readonly providerFactory: PaymentProviderFactory
  ) {}
  
  async createPaymentLink(
    paymentRequest: PaymentRequestDto
  ): Promise<PaymentLinkResponseDto> {
    try {
      console.log('💳 PaymentProcessor - Creating payment link with request:', paymentRequest);
      
      const provider = this.getDefaultProvider();
      console.log('🏭 PaymentProcessor - Using provider:', provider.name);
      
      const result = await provider.createPaymentLink(paymentRequest);
      console.log('📋 PaymentProcessor - Provider response:', result);
      
      return result;
    } catch (error) {
      console.error('❌ PaymentProcessor - Error creating payment link:', error);
      throw new BadRequestException(`Failed to create payment link: ${error.message}`);
    }
  }
  
  async checkPaymentStatus(
    paymentId: string,
    providerName?: string
  ): Promise<PaymentStatusResponseDto> {
    try {
      const provider = providerName ? this.getProviderByName(providerName) : this.getDefaultProvider();
      return await provider.checkPaymentStatus(paymentId);
    } catch (error) {
      throw new BadRequestException(`Failed to check payment status: ${error.message}`);
    }
  }
  
  
  getAvailableProviders(): string[] {
    return this.providerFactory.getAvailableProviders();
  }
  
  getProvider(providerName?: string): IPaymentProvider {
    return providerName ? this.getProviderByName(providerName) : this.getDefaultProvider();
  }
  
  private getDefaultProvider(): IPaymentProvider {
    return this.providerFactory.getDefaultProvider();
  }

  private getProviderByName(providerName: string): IPaymentProvider {
    return this.providerFactory.getProvider(providerName);
  }
}
