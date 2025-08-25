import { Injectable, BadRequestException, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { PaymentProcessorService } from '../../payment-processor/payment-processor.service';
import { CheckoutCalculatorService } from './checkout-calculator.service';
import { CheckoutValidatorService } from './checkout-validator.service';
import { CreateCheckoutWithCardDto, CheckoutResponseDto, CheckoutItemDto, CheckoutSimpleStatusDto, WompiWebhookDto } from '../dto';
import { Checkout, CheckoutStatus } from '@prisma/client';
import { CardTokenRequest } from '../../payment-processor/interfaces';

@Injectable()
export class ProductCheckoutService {
  private readonly logger = new Logger(ProductCheckoutService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly paymentProcessor: PaymentProcessorService,
    private readonly calculator: CheckoutCalculatorService,
    private readonly validator: CheckoutValidatorService
  ) {}

  // MÉTODO ELIMINADO: Solo usamos el flujo de pago con tarjeta

  // Renombrado a createCheckout - ahora es el único método principal
  async createCheckout(createCheckoutDto: CreateCheckoutWithCardDto): Promise<CheckoutResponseDto> {
    const { items: requestItems, customer_email, card_data } = createCheckoutDto;
    const product_ids = requestItems.map(item => item.id);
    const quantities = requestItems.map(item => item.quantity);

    this.logger.log('Starting checkout creation with card payment', {
      itemsCount: requestItems.length,
      customer_email
    });

    try {
      // 1. Extract product IDs and quantities from items
      this.logger.debug('Extracted product data', { product_ids, quantities });

      // 2. Validate products exist and are active
      this.logger.debug('Validating products...');
      await this.validator.validateProducts(product_ids);

      // 3. Validate quantities
      this.logger.debug('Validating quantities...');
      await this.validator.validateQuantities(quantities);

      // 4. Validate stock availability
      this.logger.debug('Validating stock...');
      await this.validator.validateStock(product_ids, quantities);

      // 5. Get product details for response
      this.logger.debug('Getting product details...');
      const products = await this.getProductDetails(product_ids);
      
      // 6. Calculate pricing
      this.logger.debug('Calculating pricing...');
      const subtotal = await this.calculator.calculateSubtotal(product_ids, quantities);
      const taxes = await this.calculator.calculateTaxes(subtotal);
      const rawTotal = subtotal + taxes;
      // CRÍTICO: Wompi no acepta centavos, redondear a pesos completos
      const total = Math.round(rawTotal / 100) * 100; // Redondear a pesos completos en centavos
      this.logger.debug('Pricing calculated', { subtotal, taxes, rawTotal, total });

      // 7. Save checkout to database first
      this.logger.debug('Saving checkout to database...');
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
              quantity: quantities[index],
              unitPrice: Math.round(product.price.toNumber()),
              totalPrice: Math.round(product.price.toNumber() * quantities[index])
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
      this.logger.log('Checkout saved to database', { checkout_id: checkout.id });

      // 8. Process direct transaction using PaymentProcessor
      this.logger.debug('Processing direct transaction...');
      
      const cardTokenRequest: CardTokenRequest = {
        number: card_data.number,
        exp_month: card_data.exp_month,
        exp_year: card_data.exp_year.length > 2 ? card_data.exp_year.slice(-2) : card_data.exp_year,
        cvc: card_data.cvc,
        card_holder: card_data.card_holder
      };
      
      const transactionResult = await this.paymentProcessor.processDirectTransaction(
        checkout.id,
        total,
        'COP',
        customer_email,
        cardTokenRequest
      );
      
      if (!transactionResult.success || !transactionResult.data) {
        // If transaction fails, delete the checkout
        await this.prisma.checkout.delete({ where: { id: checkout.id } });
        throw new BadRequestException('Transaction processing failed');
      }
      
      this.logger.log('Transaction processed successfully', {
        transaction_id: transactionResult.data.transactionId,
        status: transactionResult.data.status
      });
      
      // 9. Update checkout with transaction info
      await this.prisma.checkout.update({
        where: { id: checkout.id },
        data: {
          providerPaymentId: transactionResult.data.transactionId,
          status: transactionResult.data.status === 'APPROVED' ? CheckoutStatus.PAID : CheckoutStatus.PENDING
        }
      });

      // 10. Build response (convert from cents back to pesos for display)
      const items: CheckoutItemDto[] = checkout.items.map(item => ({
        product_id: item.productId,
        name: item.product.name,
        unit_price: Math.round(item.unitPrice / 100),
        quantity: item.quantity,
        total_price: Math.round(item.totalPrice / 100)
      }));

      return {
        checkout_id: checkout.id,
        items,
        subtotal: Math.round(subtotal / 100),
        taxes: Math.round(taxes / 100),  
        total: Math.round(total / 100),
        currency: 'COP',
        transaction_id: transactionResult.data.transactionId,
        transaction_status: transactionResult.data.status,
        payment_method_info: {
          type: 'CARD',
          last_four: card_data.number.slice(-4),
          card_holder: card_data.card_holder
        }
      };

    } catch (error) {
      this.logger.error('Checkout creation failed', {
        error: error.message,
        code: error.code
      });
      
      // Handle PaymentProcessorException specifically
      if (error.name === 'PaymentProcessorException') {
        throw error;
      }
      
      // Provide more specific error messages
      if (error.code === 'P2002') {
        throw new BadRequestException('Duplicate checkout creation attempt');
      }
      
      if (error.code === 'P2025') {
        throw new BadRequestException('One or more products not found');
      }
      
      if (error.message?.includes('validation')) {
        throw new BadRequestException(`Validation error: ${error.message}`);
      }
      
      throw new BadRequestException(`Checkout failed: ${error.message}`);
    }
  }

  async getCheckoutStatus(checkoutId: string): Promise<CheckoutSimpleStatusDto> {
    this.logger.log(`Getting checkout status for ID: ${checkoutId}`);

    // 1. Buscar checkout en la base de datos
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
      this.logger.warn(`Checkout not found: ${checkoutId}`);
      throw new BadRequestException(`Checkout with ID ${checkoutId} not found`);
    }

    this.logger.debug(`Checkout found`, { 
      checkout_id: checkout.id,
      status: checkout.status,
      provider_payment_id: checkout.providerPaymentId
    });

    let updatedCheckout = checkout;
    let transactionDetails: any = null;

    // 2. Si tiene transaction_id, consultar estado en Wompi
    if (checkout.providerPaymentId) {
      this.logger.debug(`Checking transaction status in Wompi: ${checkout.providerPaymentId}`);
      
      try {
        const transactionStatus = await this.paymentProcessor.getTransactionStatus(
          checkout.providerPaymentId
        );

        if (transactionStatus.success && transactionStatus.data) {
          transactionDetails = transactionStatus.data.data;
          
          if (transactionDetails) {
            this.logger.debug('Transaction details from Wompi', {
              transaction_id: transactionDetails.id,
              status: transactionDetails.status,
              amount: transactionDetails.amount_in_cents
            });

            // 3. Actualizar estado del checkout si es diferente
            const currentStatus = this.mapWompiStatusToCheckout(transactionDetails.status);
            if (currentStatus && currentStatus !== checkout.status) {
              this.logger.log(`Updating checkout status from ${checkout.status} to ${currentStatus}`);
              
              const updateData: any = {
                status: currentStatus,
                updatedAt: new Date()
              };

              // Si el pago fue aprobado, marcar como pagado
              if (currentStatus === CheckoutStatus.PAID && !checkout.paidAt) {
                updateData.paidAt = new Date();
              }

              updatedCheckout = await this.prisma.checkout.update({
                where: { id: checkoutId },
                data: updateData,
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

              this.logger.log(`Checkout status updated successfully`);
            }
          }
        } else {
          this.logger.warn('Failed to get transaction status from Wompi', {
            error: transactionStatus.error_message
          });
        }
      } catch (error) {
        this.logger.error('Error checking transaction status', {
          error: error.message,
          transaction_id: checkout.providerPaymentId
        });
        // No fallar el endpoint si Wompi no responde, usar datos locales
      }
    } else {
      this.logger.debug('No transaction_id found, returning local status only');
    }

    // 4. Construir respuesta simplificada - Solo estado y total
    const response = {
      status: updatedCheckout.status,
      total: Math.round(updatedCheckout.total / 100) // Convertir a pesos para display
    };

    this.logger.log(`Checkout status retrieved successfully`, {
      checkout_id: checkoutId,
      status: response.status,
      has_transaction_details: !!transactionDetails
    });

    return response;
  }

  /**
   * Mapea el estado de Wompi al estado de checkout
   */
  private mapWompiStatusToCheckout(wompiStatus: string): CheckoutStatus | null {
    switch (wompiStatus?.toUpperCase()) {
      case 'APPROVED':
        return CheckoutStatus.PAID;
      case 'DECLINED':
      case 'ERROR':
        return CheckoutStatus.FAILED;
      case 'VOIDED':
        return CheckoutStatus.CANCELLED;
      case 'PENDING':
        return CheckoutStatus.PENDING;
      default:
        this.logger.warn(`Unknown Wompi status: ${wompiStatus}`);
        return null;
    }
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