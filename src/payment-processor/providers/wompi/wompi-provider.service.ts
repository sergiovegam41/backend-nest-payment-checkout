import { Injectable } from '@nestjs/common';
import { BasePaymentProvider } from '../../abstracts/base-payment-provider.abstract';
import { PaymentRequestDto, PaymentLinkResponseDto, PaymentStatusResponseDto } from '../../dto';
import { PaymentStatus, WompiStatus, WOMPI_STATUS_MAPPING } from '../../enums/payment-status.enum';
import { WompiConfigService } from './wompi-config.service';

interface WompiPaymentData {
  name: string;
  description: string;
  single_use: boolean;
  collect_shipping: boolean;
  currency: string;
  amount_in_cents: number;
}

interface WompiResponse {
  data: {
    id: string;
    status?: string;
  };
}

@Injectable()
export class WompiProviderService extends BasePaymentProvider {
  readonly name = 'Wompi';
  
  constructor(config: WompiConfigService) {
    super(config);
  }
  
  async createPaymentLink(paymentRequest: PaymentRequestDto): Promise<PaymentLinkResponseDto> {
    try {
      this.validatePaymentRequest(paymentRequest);
      
      const credentials = await this.getCredentials();
      const endpoint = this.getEndpoint(credentials.environment);
      
      const paymentData: WompiPaymentData = {
        name: paymentRequest.name || 'Payment for your purchase in our store',
        description: paymentRequest.description || 'Payment for products in our online store',
        single_use: paymentRequest.single_use ?? true,
        collect_shipping: paymentRequest.collect_shipping ?? false,
        currency: paymentRequest.currency || 'COP',
        amount_in_cents: paymentRequest.amount_in_cents
      };
      
      const response = await this.sendCreateRequest(endpoint, credentials.private_key, paymentData);
      
      if (response.success && response.data?.id) {
        const paymentUrl = `https://checkout.wompi.co/l/${response.data.id}`;
        return new PaymentLinkResponseDto(true, response.data.id, paymentUrl);
      }
      
      return new PaymentLinkResponseDto(false, null, null, 'Failed to create payment link');
      
    } catch (error) {
      return this.handleError(error, 'createPaymentLink') as PaymentLinkResponseDto;
    }
  }
  
  async checkPaymentStatus(paymentId: string): Promise<PaymentStatusResponseDto> {
    try {
      const credentials = await this.getCredentials();
      const endpoint = this.getEndpoint(credentials.environment);
      
      const response = await this.sendCheckRequest(endpoint, credentials.private_key, paymentId);
      
      if (response.success && response.data?.status) {
        const mappedStatus = this.mapProviderStatusToGeneric(response.data.status);
        return new PaymentStatusResponseDto(
          true,
          mappedStatus,
          paymentId,
          JSON.stringify(response.data)
        );
      }
      
      return new PaymentStatusResponseDto(false, PaymentStatus.ERROR, paymentId, '');
      
    } catch (error) {
      return this.handleError(error, 'checkPaymentStatus') as PaymentStatusResponseDto;
    }
  }
  
  protected mapProviderStatusToGeneric(providerStatus: string): PaymentStatus {
    const wompiStatus = providerStatus.toUpperCase() as WompiStatus;
    return WOMPI_STATUS_MAPPING[wompiStatus] || PaymentStatus.ERROR;
  }
  
  private async sendCreateRequest(
    endpoint: string, 
    privateKey: string, 
    paymentData: WompiPaymentData
  ): Promise<{ success: boolean; data?: WompiResponse['data'] }> {
    const response = await fetch(`${endpoint}/payment_links`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${privateKey}`
      },
      body: JSON.stringify(paymentData)
    });
    
    const result = await response.json() as WompiResponse;
    
    return {
      success: response.status === 201,
      data: result.data
    };
  }
  
  private async sendCheckRequest(
    endpoint: string, 
    privateKey: string, 
    paymentId: string
  ): Promise<{ success: boolean; data?: WompiResponse['data'] }> {
    const response = await fetch(`${endpoint}/transactions/${paymentId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${privateKey}`
      }
    });
    
    const result = await response.json() as WompiResponse;
    
    return {
      success: response.status === 200,
      data: result.data
    };
  }
}