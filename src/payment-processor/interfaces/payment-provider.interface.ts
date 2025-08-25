import { PaymentRequestDto, PaymentLinkResponseDto, PaymentStatusResponseDto } from '../dto';

export interface IPaymentProvider {
  readonly name: string;
  
  createPaymentLink(paymentRequest: PaymentRequestDto): Promise<PaymentLinkResponseDto>;
  
  checkPaymentStatus(paymentId: string): Promise<PaymentStatusResponseDto>;
  
  validateWebhook?(payload: any): boolean;
}

export interface IPaymentCredentials {
  private_key: string;
  public_key?: string;
  environment: 'sandbox' | 'production';
}

export interface IPaymentConfig {
  getCredentials(): Promise<IPaymentCredentials>;
  getEndpoint(environment: 'sandbox' | 'production'): string;
}