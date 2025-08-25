import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { ICheckoutCalculator } from '../interfaces';

@Injectable()
export class CheckoutCalculatorService implements ICheckoutCalculator {
  constructor(private readonly prisma: PrismaService) {}

  async calculateTotal(productIds: string[], quantities?: number[]): Promise<number> {
    const subtotal = await this.calculateSubtotal(productIds, quantities);
    const taxes = await this.calculateTaxes(subtotal);
    return subtotal + taxes;
  }

  async calculateSubtotal(productIds: string[], quantities?: number[]): Promise<number> {
    const products = await this.prisma.product.findMany({
      where: {
        id: { in: productIds }
      },
      select: {
        id: true,
        price: true
      }
    });

    let subtotalInCents = 0;
    
    products.forEach((product, index) => {
      const quantity = quantities?.[index] || 1;
      // Convert price from pesos to cents (multiply by 100) and round
      const priceInCents = Math.round(product.price.toNumber() * 100);
      subtotalInCents += priceInCents * quantity;
    });

    return subtotalInCents; // Return in cents
  }

  async calculateTaxes(subtotal: number): Promise<number> {
    // Colombia IVA: 19%
    const taxRate = 0.19;
    return Math.round(subtotal * taxRate);
  }
}