import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { ICheckoutValidator } from '../interfaces';

@Injectable()
export class CheckoutValidatorService implements ICheckoutValidator {
  constructor(private readonly prisma: PrismaService) {}

  async validateProducts(productIds: string[]): Promise<void> {
    const products = await this.prisma.product.findMany({
      where: {
        id: { in: productIds }
      },
      select: {
        id: true,
        name: true,
        isActive: true
      }
    });

    if (products.length !== productIds.length) {
      const foundIds = products.map(p => p.id);
      const missingIds = productIds.filter(id => !foundIds.includes(id));
      throw new NotFoundException(`Products not found: ${missingIds.join(', ')}`);
    }

    const inactiveProducts = products.filter(p => !p.isActive);
    if (inactiveProducts.length > 0) {
      throw new BadRequestException(
        `Inactive products: ${inactiveProducts.map(p => p.name).join(', ')}`
      );
    }
  }

  async validateQuantities(quantities: number[]): Promise<void> {
    if (quantities.some(qty => qty < 1)) {
      throw new BadRequestException('All quantities must be greater than 0');
    }

    if (quantities.some(qty => !Number.isInteger(qty))) {
      throw new BadRequestException('All quantities must be integers');
    }
  }

  async validateStock(productIds: string[], quantities: number[]): Promise<void> {
    const products = await this.prisma.product.findMany({
      where: {
        id: { in: productIds }
      },
      select: {
        id: true,
        name: true,
        stock: true
      }
    });

    products.forEach((product, index) => {
      const requestedQuantity = quantities[index] || 1;
      
      if (product.stock !== null && product.stock < requestedQuantity) {
        throw new BadRequestException(
          `Insufficient stock for ${product.name}. Available: ${product.stock}, Requested: ${requestedQuantity}`
        );
      }
    });
  }
}