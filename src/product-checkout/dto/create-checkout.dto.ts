import { IsArray, IsNotEmpty, IsOptional, IsNumber, Min, ArrayMinSize, IsUUID, ValidateNested } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class CheckoutItemInputDto {
  @ApiProperty({
    description: 'Identificador único del producto',
    example: '550e8400-e29b-41d4-a716-446655440000',
    format: 'uuid'
  })
  @IsUUID('4')
  id: string;

  @ApiProperty({
    description: 'Cantidad a comprar del producto',
    example: 2,
    minimum: 1,
    type: 'integer'
  })
  @IsNumber()
  @Min(1)
  quantity: number;
}

// CreateCheckoutDto ELIMINADO - Solo usamos CreateCheckoutWithCardDto