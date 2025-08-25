import { IsArray, IsNotEmpty, IsOptional, IsNumber, Min, ArrayMinSize, IsUUID, ValidateNested } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class CheckoutItemInputDto {
  @ApiProperty({
    description: 'Product UUID - Identificador único del producto',
    example: '550e8400-e29b-41d4-a716-446655440000',
    format: 'uuid'
  })
  @IsUUID('4')
  id: string;

  @ApiProperty({
    description: 'Quantity to purchase - Cantidad a comprar del producto',
    example: 2,
    minimum: 1,
    type: 'integer'
  })
  @IsNumber()
  @Min(1)
  quantity: number;
}

export class CreateCheckoutDto {
  @ApiProperty({
    description: 'Lista de productos con sus cantidades - Array of products with their quantities. Cada item debe incluir el ID del producto y la cantidad deseada.',
    example: [
      { id: '550e8400-e29b-41d4-a716-446655440000', quantity: 2 },
      { id: '6ba7b810-9dad-11d1-80b4-00c04fd430c8', quantity: 1 }
    ],
    type: [CheckoutItemInputDto],
    minItems: 1,
    isArray: true
  })
  @IsArray()
  @ArrayMinSize(1, { message: 'Se debe incluir al menos un producto en el checkout' })
  @ValidateNested({ each: true })
  @Type(() => CheckoutItemInputDto)
  items: CheckoutItemInputDto[];
}