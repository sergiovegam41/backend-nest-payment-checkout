import { IsEmail, IsString, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import { CreateCheckoutDto } from './create-checkout.dto';

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

export class CreateCheckoutWithCardDto extends CreateCheckoutDto {
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