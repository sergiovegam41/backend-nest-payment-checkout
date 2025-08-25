import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { PaymentProcessorService } from '../../payment-processor/payment-processor.service';
import { CheckoutCalculatorService } from './checkout-calculator.service';
import { CheckoutValidatorService } from './checkout-validator.service';
import { CreateCheckoutDto, CreateCheckoutWithCardDto, CheckoutResponseDto, CheckoutItemDto, WompiWebhookDto } from '../dto';
import { Checkout, CheckoutStatus } from '@prisma/client';
import { CardTokenRequest, TransactionRequest } from '../../payment-processor/interfaces';

@Injectable()
export class ProductCheckoutService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly paymentProcessor: PaymentProcessorService,
    private readonly calculator: CheckoutCalculatorService,
    private readonly validator: CheckoutValidatorService
  ) {}

  async createCheckout(createCheckoutDto: CreateCheckoutDto): Promise<CheckoutResponseDto> {
    const { product_ids, quantities } = createCheckoutDto;

    try {
      console.log('🛒 Starting checkout creation:', { product_ids, quantities });

      // 1. Normalize quantities array
      const normalizedQuantities = this.normalizeQuantities(product_ids, quantities);
      console.log('📊 Normalized quantities:', normalizedQuantities);

      // 2. Validate products exist and are active
      console.log('✅ Validating products...');
      await this.validator.validateProducts(product_ids);

      // 3. Validate quantities
      console.log('🔢 Validating quantities...');
      await this.validator.validateQuantities(normalizedQuantities);

      // 4. Validate stock availability
      console.log('📦 Validating stock...');
      await this.validator.validateStock(product_ids, normalizedQuantities);

      // 5. Get product details for response
      console.log('🔍 Getting product details...');
      const products = await this.getProductDetails(product_ids);
      console.log('📋 Found products:', products.map(p => ({ id: p.id, name: p.name, price: p.price })));

      // 6. Calculate pricing
      console.log('💰 Calculating pricing...');
      const subtotal = await this.calculator.calculateSubtotal(product_ids, normalizedQuantities);
      const taxes = await this.calculator.calculateTaxes(subtotal);
      const total = Math.round(subtotal + taxes); // Convert to integer cents
      console.log('💵 Pricing calculated:', { subtotal, taxes, total, totalRounded: total });

      // 7. Save checkout to database first
      console.log('💾 Saving checkout to database...');
      const checkout = await this.prisma.checkout.create({
        data: {
          total,
          subtotal,
          taxes,
          currency: 'COP',
          status: CheckoutStatus.PENDING,
          items: {
            create: products.map((product, index) => ({
              productId: product.id,
              quantity: normalizedQuantities[index],
              unitPrice: Math.round(product.price.toNumber()),
              totalPrice: Math.round(product.price.toNumber() * normalizedQuantities[index])
            }))
          }
        },
        include: {
          items: {
            include: {
              product: true
            }
          }
        }
      });
      console.log('✅ Checkout saved to database:', checkout.id);

      // 8. Create payment link with checkout reference
      console.log('🔗 Creating payment link...');
      const paymentLink = await this.paymentProcessor.createPaymentLink({
        amount_in_cents: total,
        currency: 'COP',
        name: 'Product Purchase',
        description: `Purchase of ${product_ids.length} product(s) - Checkout: ${checkout.id}`,
        single_use: true,
        collect_shipping: false
      });
      console.log('🔗 Payment link response:', paymentLink);

      if (!paymentLink.success || !paymentLink.payment_url) {
        // If payment link fails, delete the checkout
        await this.prisma.checkout.delete({ where: { id: checkout.id } });
        throw new BadRequestException('Failed to create payment link');
      }

      // 9. Update checkout with payment info
      await this.prisma.checkout.update({
        where: { id: checkout.id },
        data: {
          paymentUrl: paymentLink.payment_url,
          providerPaymentId: paymentLink.payment_id
        }
      });

      // 10. Build response (convert from cents back to pesos for display)
      const items: CheckoutItemDto[] = checkout.items.map(item => ({
        product_id: item.productId,
        name: item.product.name,
        unit_price: Math.round(item.unitPrice / 100), // Convert cents back to pesos for display
        quantity: item.quantity,
        total_price: Math.round(item.totalPrice / 100) // Convert cents back to pesos for display
      }));

      return {
        checkout_id: checkout.id,
        items,
        subtotal: Math.round(subtotal / 100), // Convert to pesos for display
        taxes: Math.round(taxes / 100), // Convert to pesos for display  
        total: Math.round(total / 100), // Convert to pesos for display
        payment_url: paymentLink.payment_url,
        currency: 'COP'
      };

    } catch (error) {
      console.error('🚨 Checkout creation failed:', error);
      
      // Provide more specific error messages
      if (error.code === 'P2002') {
        throw new BadRequestException('Duplicate checkout creation attempt');
      }
      
      if (error.code === 'P2025') {
        throw new BadRequestException('One or more products not found');
      }
      
      if (error.message?.includes('payment link')) {
        throw new BadRequestException(`Payment link creation failed: ${error.message}`);
      }
      
      if (error.message?.includes('validation')) {
        throw new BadRequestException(`Validation error: ${error.message}`);
      }
      
      // Include full error details for debugging
      throw new BadRequestException(`Checkout failed: ${error.message} (Code: ${error.code || 'UNKNOWN'})`);
    }
  }

  async createCheckoutWithCard(createCheckoutDto: CreateCheckoutWithCardDto): Promise<CheckoutResponseDto> {
    const { product_ids, quantities, customer_email, card_data } = createCheckoutDto;

    try {
      console.log('💳 Starting card-based checkout creation:', { product_ids, quantities, customer_email });

      // 1. Normalize quantities array
      const normalizedQuantities = this.normalizeQuantities(product_ids, quantities);
      console.log('📊 Normalized quantities:', normalizedQuantities);

      // 2. Validate products exist and are active
      console.log('✅ Validating products...');
      await this.validator.validateProducts(product_ids);

      // 3. Validate quantities
      console.log('🔢 Validating quantities...');
      await this.validator.validateQuantities(normalizedQuantities);

      // 4. Validate stock availability
      console.log('📦 Validating stock...');
      await this.validator.validateStock(product_ids, normalizedQuantities);

      // 5. Get product details for response
      console.log('🔍 Getting product details...');
      const products = await this.getProductDetails(product_ids);
      console.log('📋 Found products:', products.map(p => ({ id: p.id, name: p.name, price: p.price })));

      // 6. Calculate pricing
      console.log('💰 Calculating pricing...');
      const subtotal = await this.calculator.calculateSubtotal(product_ids, normalizedQuantities);
      const taxes = await this.calculator.calculateTaxes(subtotal);
      const total = Math.round(subtotal + taxes); // Convert to integer cents
      console.log('💵 Pricing calculated:', { subtotal, taxes, total, totalRounded: total });

      // 7. Save checkout to database first
      console.log('💾 Saving checkout to database...');
      const checkout = await this.prisma.checkout.create({
        data: {
          total,
          subtotal,
          taxes,
          currency: 'COP',
          status: CheckoutStatus.PENDING,
          items: {
            create: products.map((product, index) => ({
              productId: product.id,
              quantity: normalizedQuantities[index],
              unitPrice: Math.round(product.price.toNumber()),
              totalPrice: Math.round(product.price.toNumber() * normalizedQuantities[index])
            }))
          }
        },
        include: {
          items: {
            include: {
              product: true
            }
          }
        }
      });
      console.log('✅ Checkout saved to database:', checkout.id);

      // 8. Process direct transaction
      console.log('💳 Processing direct transaction...');
      
      // 8.1. Get merchant info for acceptance token
      console.log('🏢 Getting merchant info...');
      const provider = this.paymentProcessor.getProvider();
      const merchantInfo = await provider.getMerchantInfo();
      
      if (!merchantInfo.success || !merchantInfo.data) {
        throw new BadRequestException('Failed to get merchant information');
      }
      
      // 8.2. Tokenize card data
      console.log('🔒 Tokenizing card data...');
      const cardTokenRequest: CardTokenRequest = {
        number: card_data.number,
        exp_month: card_data.exp_month,
        exp_year: card_data.exp_year.length > 2 ? card_data.exp_year.slice(-2) : card_data.exp_year, // Convert 2025 -> 25
        cvc: card_data.cvc,
        card_holder: card_data.card_holder
      };
      
      const tokenResult = await provider.tokenizeCard(cardTokenRequest);
      
      if (!tokenResult.success || !tokenResult.data) {
        throw new BadRequestException(`Card tokenization failed: ${tokenResult.error_message}`);
      }
      
      console.log('✅ Card tokenized successfully:', tokenResult.data.data.id);
      
      // 8.3. Generate signature
      console.log('🔐 Generating transaction signature...');
      const signature = await provider.generateSignature(checkout.id, total, 'COP');
      
      // 8.4. Create transaction
      console.log('💳 Creating direct transaction...');
      const transactionRequest: TransactionRequest = {
        amount_in_cents: total,
        currency: 'COP',
        customer_email: customer_email,
        reference: checkout.id,
        payment_method: {
          type: 'CARD',
          token: tokenResult.data.data.id,
          installments: 1
        },
        acceptance_token: merchantInfo.data.data.presigned_acceptance.acceptance_token,
        signature: signature
      };
      
      const transactionResult = await provider.createTransaction(transactionRequest);
      
      if (!transactionResult.success || !transactionResult.data) {
        // If transaction fails, delete the checkout
        await this.prisma.checkout.delete({ where: { id: checkout.id } });
        throw new BadRequestException(`Transaction failed: ${transactionResult.error_message}`);
      }
      
      console.log('✅ Transaction created successfully:', transactionResult.data.data.id);
      
      // 9. Update checkout with transaction info
      await this.prisma.checkout.update({
        where: { id: checkout.id },
        data: {
          providerPaymentId: transactionResult.data.data.id,
          status: transactionResult.data.data.status === 'APPROVED' ? CheckoutStatus.PAID : CheckoutStatus.PENDING
        }
      });

      // 10. Build response (convert from cents back to pesos for display)
      const items: CheckoutItemDto[] = checkout.items.map(item => ({
        product_id: item.productId,
        name: item.product.name,
        unit_price: Math.round(item.unitPrice / 100), // Convert cents back to pesos for display
        quantity: item.quantity,
        total_price: Math.round(item.totalPrice / 100) // Convert cents back to pesos for display
      }));

      return {
        checkout_id: checkout.id,
        items,
        subtotal: Math.round(subtotal / 100), // Convert to pesos for display
        taxes: Math.round(taxes / 100), // Convert to pesos for display  
        total: Math.round(total / 100), // Convert to pesos for display
        currency: 'COP',
        transaction_id: transactionResult.data.data.id,
        transaction_status: transactionResult.data.data.status,
        payment_method_info: {
          type: 'CARD',
          last_four: card_data.number.slice(-4),
          card_holder: card_data.card_holder
        }
      };

    } catch (error) {
      console.error('🚨 Card-based checkout creation failed:', error);
      
      // Provide more specific error messages
      if (error.message?.includes('tokenization')) {
        throw new BadRequestException(`Card tokenization failed: ${error.message}`);
      }
      
      if (error.message?.includes('transaction')) {
        throw new BadRequestException(`Transaction processing failed: ${error.message}`);
      }
      
      if (error.message?.includes('merchant')) {
        throw new BadRequestException(`Merchant info retrieval failed: ${error.message}`);
      }
      
      if (error.code === 'P2002') {
        throw new BadRequestException('Duplicate checkout creation attempt');
      }
      
      if (error.code === 'P2025') {
        throw new BadRequestException('One or more products not found');
      }
      
      if (error.message?.includes('validation')) {
        throw new BadRequestException(`Validation error: ${error.message}`);
      }
      
      // Include full error details for debugging
      throw new BadRequestException(`Card-based checkout failed: ${error.message} (Code: ${error.code || 'UNKNOWN'})`);
    }
  }

  async getCheckoutStatus(checkoutId: string) {
    const checkout = await this.prisma.checkout.findUnique({
      where: { id: checkoutId },
      include: {
        items: {
          include: {
            product: {
              select: {
                id: true,
                name: true
              }
            }
          }
        }
      }
    });

    if (!checkout) {
      throw new BadRequestException(`Checkout with ID ${checkoutId} not found`);
    }

    return {
      checkout_id: checkout.id,
      status: checkout.status,
      total: checkout.total,
      subtotal: checkout.subtotal,
      taxes: checkout.taxes,
      currency: checkout.currency,
      payment_url: checkout.paymentUrl || undefined,
      provider_payment_id: checkout.providerPaymentId || undefined,
      created_at: checkout.createdAt.toISOString(),
      updated_at: checkout.updatedAt.toISOString(),
      paid_at: checkout.paidAt?.toISOString(),
      items: checkout.items.map(item => ({
        product_id: item.productId,
        product_name: item.product.name,
        quantity: item.quantity,
        unit_price: item.unitPrice,
        total_price: item.totalPrice
      }))
    };
  }

  async handleWompiWebhook(webhook: WompiWebhookDto): Promise<{ success: boolean; message: string }> {
    try {
      const { event, data } = webhook;
      const transaction = data.transaction;

      // Only handle transaction events
      if (!event.startsWith('transaction.')) {
        return { success: true, message: 'Event ignored (not a transaction event)' };
      }

      // Find checkout by reference (should be our checkout ID)
      const checkout = await this.prisma.checkout.findFirst({
        where: {
          id: transaction.reference
        }
      });

      if (!checkout) {
        // Could be a reference format issue, try with provider payment ID
        const checkoutByProviderId = await this.prisma.checkout.findFirst({
          where: {
            providerPaymentId: transaction.id
          }
        });

        if (!checkoutByProviderId) {
          return { success: false, message: `Checkout not found for reference: ${transaction.reference}` };
        }

        return this.updateCheckoutStatus(checkoutByProviderId, transaction);
      }

      return this.updateCheckoutStatus(checkout, transaction);

    } catch (error) {
      return { success: false, message: `Webhook processing failed: ${error.message}` };
    }
  }

  private async updateCheckoutStatus(checkout: Checkout, transaction: any): Promise<{ success: boolean; message: string }> {
    let newStatus: CheckoutStatus;

    // Map Wompi status to our checkout status
    switch (transaction.status.toUpperCase()) {
      case 'APPROVED':
        newStatus = CheckoutStatus.PAID;
        break;
      case 'DECLINED':
      case 'ERROR':
        newStatus = CheckoutStatus.FAILED;
        break;
      case 'VOIDED':
        newStatus = CheckoutStatus.CANCELLED;
        break;
      case 'PENDING':
        newStatus = CheckoutStatus.PENDING;
        break;
      default:
        // Don't update if status is unknown
        return { success: true, message: `Unknown status: ${transaction.status}` };
    }

    // Only update if status actually changed
    if (checkout.status === newStatus) {
      return { success: true, message: 'Status already up to date' };
    }

    const updateData: any = {
      status: newStatus,
      updatedAt: new Date()
    };

    // If payment was approved, set paid timestamp
    if (newStatus === CheckoutStatus.PAID) {
      updateData.paidAt = new Date();
    }

    // Update provider payment ID if we don't have it
    if (!checkout.providerPaymentId && transaction.id) {
      updateData.providerPaymentId = transaction.id;
    }

    await this.prisma.checkout.update({
      where: { id: checkout.id },
      data: updateData
    });

    return { 
      success: true, 
      message: `Checkout ${checkout.id} status updated from ${checkout.status} to ${newStatus}` 
    };
  }

  private normalizeQuantities(productIds: string[], quantities?: number[]): number[] {
    if (!quantities) {
      return new Array(productIds.length).fill(1);
    }

    if (quantities.length !== productIds.length) {
      throw new BadRequestException('Quantities array must have same length as product_ids array');
    }

    return quantities;
  }

  private async getProductDetails(productIds: string[]) {
    return await this.prisma.product.findMany({
      where: {
        id: { in: productIds }
      },
      select: {
        id: true,
        name: true,
        price: true,
        stock: true
      },
      orderBy: {
        name: 'asc'
      }
    });
  }
}