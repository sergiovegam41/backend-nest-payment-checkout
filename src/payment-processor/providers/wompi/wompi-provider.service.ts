import { Injectable } from '@nestjs/common';
import { BasePaymentProvider } from '../../abstracts/base-payment-provider.abstract';
import { PaymentRequestDto, PaymentLinkResponseDto, PaymentStatusResponseDto } from '../../dto';
import { PaymentStatus, WompiStatus, WOMPI_STATUS_MAPPING } from '../../enums/payment-status.enum';
import { WompiConfigService } from './wompi-config.service';
import { SignatureService } from '../../services/signature.service';
import { 
  CardTokenRequest, 
  CardTokenResponse, 
  TransactionRequest, 
  TransactionResponse, 
  MerchantInfoResponse 
} from '../../interfaces';

interface WompiPaymentLinkRequest {
  name: string;
  description: string;
  single_use: boolean;
  collect_shipping: boolean;
  currency: string;
  amount_in_cents: number;
}

interface WompiPaymentLinkResponse {
  data: {
    id: string;
    created_at: string;
    amount_in_cents: number;
    currency: string;
    name: string;
    description: string;
    single_use: boolean;
    collect_shipping: boolean;
    redirect_url?: string;
  };
  meta: {
    
  };
}

interface WompiTransactionResponse {
  data: {
    id: string;
    amount_in_cents: number;
    reference: string;
    customer_email: string;
    currency: string;
    payment_method_type: string;
    payment_method: any;
    status: string;
    status_message: string;
    created_at: string;
    finalized_at: string;
    amount_refunded: number;
    payment_link_id: string;
  };
}

@Injectable()
export class WompiProviderService extends BasePaymentProvider {
  readonly name = 'Wompi';
  
  constructor(
    private readonly wompiConfig: WompiConfigService,
    private readonly signatureService: SignatureService
  ) {
    super(wompiConfig);
  }
  
  async createPaymentLink(paymentRequest: PaymentRequestDto): Promise<PaymentLinkResponseDto> {
    try {
      console.log('🎯 WompiProvider - Starting payment link creation');
      console.log('🎯 WompiProvider - Payment request:', JSON.stringify(paymentRequest, null, 2));
      
      this.validatePaymentRequest(paymentRequest);
      console.log('✅ WompiProvider - Payment request validation passed');
      
      const credentials = await this.getCredentials();
      const endpoint = this.getEndpoint(credentials.environment);
      console.log('🔐 WompiProvider - Using endpoint:', endpoint);
      console.log('🔐 WompiProvider - Environment:', credentials.environment);
      console.log('🔐 WompiProvider - Private key (first 20 chars):', credentials.private_key?.substring(0, 20) + '...');
      
      const paymentData: WompiPaymentLinkRequest = {
        name: paymentRequest.name || 'Pago de tu compra en nuestra tienda',
        description: paymentRequest.description || 'Pago de productos en nuestra tienda online',
        single_use: paymentRequest.single_use ?? true,
        collect_shipping: paymentRequest.collect_shipping ?? false,
        currency: paymentRequest.currency || 'COP',
        amount_in_cents: paymentRequest.amount_in_cents
      };
      console.log('📦 WompiProvider - Payment data to send:', JSON.stringify(paymentData, null, 2));
      
      const response = await this.sendCreateRequest(endpoint, credentials.private_key, paymentData);
      console.log('📡 WompiProvider - API response:', JSON.stringify(response, null, 2));
      
      if (response.success && response.data?.id) {
        const checkoutBaseUrl = this.wompiConfig.getCheckoutUrl(credentials.environment);
        const paymentUrl = `${checkoutBaseUrl}${response.data.id}`;
        console.log('✅ WompiProvider - Payment link created successfully:', paymentUrl);
        return new PaymentLinkResponseDto(true, response.data.id, paymentUrl);
      }
      
      console.log('❌ WompiProvider - Failed to create payment link - Response details:', JSON.stringify(response, null, 2));
      const errorMessage = response.errorDetails || 'Failed to create payment link';
      return new PaymentLinkResponseDto(false, null, null, errorMessage);
      
    } catch (error) {
      console.error('💥 WompiProvider - Error in createPaymentLink:', error);
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
    paymentData: WompiPaymentLinkRequest
  ): Promise<{ success: boolean; data?: WompiPaymentLinkResponse['data']; errorDetails?: string }> {
    const url = `${endpoint}/payment_links`;
    console.log('🌐 WompiProvider - Making HTTP POST request to:', url);
    console.log('📨 WompiProvider - Request payload:', JSON.stringify(paymentData, null, 2));
    console.log('🔑 WompiProvider - Authorization header:', `Bearer ${privateKey.substring(0, 20)}...`);
    
    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${privateKey}`
        },
        body: JSON.stringify(paymentData)
      });
      
      console.log('📡 WompiProvider - HTTP Status:', response.status);
      console.log(response);
      
      console.log('📡 WompiProvider - Response headers:', Object.fromEntries(response.headers.entries()));
      
      const responseText = await response.text();
      console.log('📡 WompiProvider - Raw response text:', responseText);
      
      let result: any;
      try {
        result = JSON.parse(responseText);
        console.log('📡 WompiProvider - Parsed response:', JSON.stringify(result, null, 2));
      } catch (parseError) {
        console.error('❌ WompiProvider - Failed to parse response as JSON:', parseError);
        return {
          success: false,
          data: undefined,
          errorDetails: `Failed to parse response: ${responseText}`
        };
      }
      
      // Wompi returns 201 for successful payment link creation
      const isSuccess = response.status === 201;
      console.log('✅ WompiProvider - Request success:', isSuccess);
      
      if (!isSuccess) {
        const errorDetails = result?.error || result?.message || `HTTP ${response.status}: ${responseText}`;
        console.error('❌ WompiProvider - API Error:', errorDetails);
        return {
          success: false,
          data: undefined,
          errorDetails: errorDetails
        };
      }
      
      return {
        success: isSuccess,
        data: result.data
      };
      
    } catch (networkError) {
      console.error('💥 WompiProvider - Network error:', networkError);
      return {
        success: false,
        data: undefined,
        errorDetails: `Network error: ${networkError.message}`
      };
    }
  }
  
  private async sendCheckRequest(
    endpoint: string, 
    privateKey: string, 
    paymentId: string
  ): Promise<{ success: boolean; data?: WompiTransactionResponse['data'] }> {
    
    const response = await fetch(`${endpoint}/transactions/${paymentId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${privateKey}`
      }
    });
    
    const responseText = await response.text();
    
    let result: WompiTransactionResponse;
    try {
      result = JSON.parse(responseText);
    } catch (parseError) {
      return { success: false };
    }
    
    return {
      success: response.status === 200,
      data: result.data
    };
  }

  // ========================================
  // NEW TRANSACTION METHODS
  // ========================================

  /**
   * Tokenize card data to get a secure token
   */
  async tokenizeCard(cardData: CardTokenRequest): Promise<{ success: boolean; data?: CardTokenResponse; error_message?: string }> {
    try {
      console.log('🔒 WompiProvider - Starting card tokenization...');
      const credentials = await this.getCredentials();
      const endpoint = this.getEndpoint(credentials.environment);
      const url = `${endpoint}/tokens/cards`;
      
      console.log('🌐 WompiProvider - Tokenization URL:', url);
      console.log('🔑 WompiProvider - Using public key:', credentials.public_key?.substring(0, 20) + '...');
      console.log('📨 WompiProvider - Card data:', { 
        ...cardData, 
        number: cardData.number.substring(0, 4) + '***' + cardData.number.slice(-4),
        cvc: '***' 
      });
      
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${credentials.public_key}`
        },
        body: JSON.stringify(cardData)
      });

      console.log('📡 WompiProvider - Tokenization HTTP Status:', response.status);
      console.log('📡 WompiProvider - Response headers:', Object.fromEntries(response.headers.entries()));

      const responseText = await response.text();
      console.log('📡 WompiProvider - Raw tokenization response:', responseText);

      let result: any;
      try {
        result = JSON.parse(responseText);
        console.log('📡 WompiProvider - Parsed tokenization response:', JSON.stringify(result, null, 2));
      } catch (parseError) {
        console.error('❌ WompiProvider - Failed to parse tokenization response as JSON:', parseError);
        return {
          success: false,
          error_message: `Failed to parse tokenization response: ${responseText}`
        };
      }

      if (response.status === 201 && result.status === 'CREATED') {
        console.log('✅ WompiProvider - Card tokenization successful');
        return { success: true, data: result };
      }

      console.error('❌ WompiProvider - Card tokenization failed:', result);
      return { 
        success: false, 
        error_message: result.error?.message || result.message || `HTTP ${response.status}: ${responseText}` 
      };

    } catch (error) {
      console.error('💥 WompiProvider - Network error in card tokenization:', error);
      return { 
        success: false, 
        error_message: `Card tokenization failed: ${error.message}` 
      };
    }
  }

  /**
   * Get merchant information including acceptance token
   */
  async getMerchantInfo(): Promise<{ success: boolean; data?: MerchantInfoResponse; error_message?: string }> {
    try {
      const credentials = await this.getCredentials();
      if (!credentials.public_key) {
        throw new Error('Public key is required for merchant info');
      }
      const merchantEndpoint = this.wompiConfig.getMerchantEndpoint(credentials.public_key, credentials.environment);
      
      const response = await fetch(merchantEndpoint, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${credentials.public_key}`
        }
      });

      const responseText = await response.text();
      const result = JSON.parse(responseText);

      if (response.status === 200) {
        return { success: true, data: result };
      }

      return { 
        success: false, 
        error_message: result.error?.message || 'Failed to get merchant info' 
      };

    } catch (error) {
      return { 
        success: false, 
        error_message: `Merchant info failed: ${error.message}` 
      };
    }
  }

  /**
   * Create direct transaction (charge card)
   */
  async createTransaction(transactionData: TransactionRequest): Promise<{ success: boolean; data?: TransactionResponse; error_message?: string }> {
    try {
      console.log('💳 WompiProvider - Starting transaction creation...');
      const credentials = await this.getCredentials();
      const endpoint = this.getEndpoint(credentials.environment);
      const url = `${endpoint}/transactions`;
      
      console.log('🌐 WompiProvider - Transaction URL:', url);
      console.log('🔑 WompiProvider - Using private key:', credentials.private_key?.substring(0, 20) + '...');
      console.log('📨 WompiProvider - Transaction data:', JSON.stringify(transactionData, null, 2));
      
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${credentials.private_key}`
        },
        body: JSON.stringify(transactionData)
      });

      console.log('📡 WompiProvider - Transaction HTTP Status:', response.status);
      console.log('📡 WompiProvider - Response headers:', Object.fromEntries(response.headers.entries()));

      const responseText = await response.text();
      console.log('📡 WompiProvider - Raw transaction response:', responseText);

      let result: any;
      try {
        result = JSON.parse(responseText);
        console.log('📡 WompiProvider - Parsed transaction response:', JSON.stringify(result, null, 2));
      } catch (parseError) {
        console.error('❌ WompiProvider - Failed to parse transaction response as JSON:', parseError);
        return {
          success: false,
          error_message: `Failed to parse transaction response: ${responseText}`
        };
      }

      if (response.status === 201) {
        console.log('✅ WompiProvider - Transaction creation successful');
        return { success: true, data: result };
      }

      console.error('❌ WompiProvider - Transaction creation failed:', result);
      return { 
        success: false, 
        error_message: result.error?.message || result.message || `HTTP ${response.status}: ${JSON.stringify(result)}` 
      };

    } catch (error) {
      console.error('💥 WompiProvider - Network error in transaction creation:', error);
      return { 
        success: false, 
        error_message: `Transaction failed: ${error.message}` 
      };
    }
  }

  /**
   * Generate signature for transaction
   */
  async generateSignature(reference: string, amountInCents: number, currency: string): Promise<string> {
    try {
      const credentials = await this.getCredentials();
      if (!credentials.integrity_key) {
        throw new Error('Integrity key is required for signature generation');
      }
      return this.signatureService.generateWompiSignature(reference, amountInCents, currency, credentials.integrity_key);
    } catch (error) {
      console.error('Failed to generate signature:', error);
      return '';
    }
  }

  /**
   * Get transaction status by ID
   * GET https://api-sandbox.co.uat.wompi.dev/v1/transactions/{transaction_id}
   */
  async getTransactionStatus(transactionId: string): Promise<{ success: boolean; data?: any; error_message?: string }> {
    try {
      console.log('🔍 WompiProvider - Checking transaction status for ID:', transactionId);
      const credentials = await this.getCredentials();
      const endpoint = this.getEndpoint(credentials.environment);
      const url = `${endpoint}/transactions/${transactionId}`;
      
      console.log('🌐 WompiProvider - Transaction status URL:', url);
      
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${credentials.private_key}`
        }
      });

      console.log('📡 WompiProvider - Transaction status HTTP Status:', response.status);
      
      const responseText = await response.text();
      console.log('📡 WompiProvider - Raw transaction status response:', responseText);

      let result: any;
      try {
        result = JSON.parse(responseText);
        console.log('📡 WompiProvider - Parsed transaction status:', JSON.stringify(result, null, 2));
      } catch (parseError) {
        console.error('❌ WompiProvider - Failed to parse transaction status response:', parseError);
        return {
          success: false,
          error_message: `Failed to parse transaction status: ${responseText}`
        };
      }

      if (response.status === 200) {
        console.log('✅ WompiProvider - Transaction status retrieved successfully');
        return { success: true, data: result };
      }

      console.error('❌ WompiProvider - Failed to get transaction status:', result);
      return { 
        success: false, 
        error_message: result.error?.message || `HTTP ${response.status}: ${JSON.stringify(result)}` 
      };

    } catch (error) {
      console.error('💥 WompiProvider - Network error checking transaction status:', error);
      return { 
        success: false, 
        error_message: `Transaction status check failed: ${error.message}` 
      };
    }
  }
}