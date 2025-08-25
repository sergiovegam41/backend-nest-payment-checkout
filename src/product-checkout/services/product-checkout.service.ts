import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { PaymentProcessorService } from '../../payment-processor/payment-processor.service';
import { CheckoutCalculatorService } from './checkout-calculator.service';
import { CheckoutValidatorService } from './checkout-validator.service';
import { CreateCheckoutDto, CheckoutResponseDto, CheckoutItemDto, WompiWebhookDto } from '../dto';
import { Checkout, CheckoutStatus } from '@prisma/client';

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
      // 1. Normalize quantities array
      const normalizedQuantities = this.normalizeQuantities(product_ids, quantities);

      // 2. Validate products exist and are active
      await this.validator.validateProducts(product_ids);

      // 3. Validate quantities
      await this.validator.validateQuantities(normalizedQuantities);

      // 4. Validate stock availability
      await this.validator.validateStock(product_ids, normalizedQuantities);

      // 5. Get product details for response
      const products = await this.getProductDetails(product_ids);

      // 6. Calculate pricing
      const subtotal = await this.calculator.calculateSubtotal(product_ids, normalizedQuantities);
      const taxes = await this.calculator.calculateTaxes(subtotal);
      const total = subtotal + taxes;

      // 7. Save checkout to database first
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

      // 8. Create payment link with checkout reference
      const paymentLink = await this.paymentProcessor.createPaymentLink({
        amount_in_cents: total,
        currency: 'COP',
        name: 'Product Purchase',
        description: `Purchase of ${product_ids.length} product(s) - Checkout: ${checkout.id}`,
        single_use: true,
        collect_shipping: false
      });

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

      // 10. Build response
      const items: CheckoutItemDto[] = checkout.items.map(item => ({
        product_id: item.productId,
        name: item.product.name,
        unit_price: item.unitPrice,
        quantity: item.quantity,
        total_price: item.totalPrice
      }));

      return {
        checkout_id: checkout.id,
        items,
        subtotal,
        taxes,
        total,
        payment_url: paymentLink.payment_url,
        currency: 'COP'
      };

    } catch (error) {
      throw new BadRequestException(`Checkout failed: ${error.message}`);
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