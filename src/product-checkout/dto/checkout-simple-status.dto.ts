import { ApiProperty } from '@nestjs/swagger';
import { CheckoutStatus } from '@prisma/client';

export class CheckoutSimpleStatusDto {
  @ApiProperty({
    description: 'Estado actual del checkout',
    enum: CheckoutStatus,
    example: CheckoutStatus.PAID
  })
  status: CheckoutStatus;

  @ApiProperty({
    description: 'Total del checkout en pesos colombianos',
    example: 6664040
  })
  total: number;
}