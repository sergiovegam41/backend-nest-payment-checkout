import { IsEmail, IsString, ValidateNested, IsArray, ArrayMinSize } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import { CheckoutItemInputDto } from './create-checkout.dto';

export class CardDataDto {
  @ApiProperty({
    description: 'Número de tarjeta (16 dígitos)',
    example: '4242424242424242'
  })
  @IsString()
  number: string;

  @ApiProperty({
    description: 'Mes de expiración (2 dígitos)',
    example: '12'
  })
  @IsString()
  exp_month: string;

  @ApiProperty({
    description: 'Año de expiración (2 dígitos)',
    example: '29'
  })
  @IsString()
  exp_year: string;

  @ApiProperty({
    description: 'Código de seguridad (3 dígitos)',
    example: '123'
  })
  @IsString()
  cvc: string;

  @ApiProperty({
    description: 'Nombre del titular de la tarjeta',
    example: 'Juan Pérez'
  })
  @IsString()
  card_holder: string;
}

export class CreateCheckoutWithCardDto {
  @ApiProperty({
    description: 'Lista de productos con sus cantidades',
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
  @ApiProperty({
    description: 'Email del cliente para la transacción',
    example: 'cliente@ejemplo.com'
  })
  @IsEmail()
  customer_email: string;

  @ApiProperty({
    description: 'Datos de la tarjeta para el pago',
    type: CardDataDto
  })
  @ValidateNested()
  @Type(() => CardDataDto)
  card_data: CardDataDto;
}