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


  async findAll(query: CursorPaginationQueryDto): Promise<CursorPaginatedResponse<any>> {
    return this.cursorPaginationService.paginate<any>({
      model: this.prisma.product,
      query,
      baseWhere: { isActive: true },
      orderBy: { createdAt: 'desc' },
      include: {
        images: {
          orderBy: { position: 'asc' }
        }
      }
    } as any);
  }

  async findOne(id: string): Promise<any> {
    return this.prisma.product.findUnique({
      where: { id },
      include: {
        images: {
          orderBy: { position: 'asc' }
        }
      }
    } as any);
  }

}
