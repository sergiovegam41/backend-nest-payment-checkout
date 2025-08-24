import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Product } from '@prisma/client';
import { CursorPaginationQueryDto, CursorPaginatedResponse, CursorPaginationService } from '../common';

@Injectable()
export class ProductService {
  constructor(
    private prisma: PrismaService,
    private cursorPaginationService: CursorPaginationService
  ) {}


  async findAll(query: CursorPaginationQueryDto): Promise<CursorPaginatedResponse<Product>> {
    return this.cursorPaginationService.paginate<Product>({
      model: this.prisma.product,
      query,
      baseWhere: { isActive: true },
      orderBy: { createdAt: 'desc' }
    });
  }

  async findOne(id: string): Promise<Product | null> {
    return this.prisma.product.findUnique({
      where: { id },
    });
  }

}
