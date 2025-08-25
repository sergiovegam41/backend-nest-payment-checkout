import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNumber, IsEmail, ValidateNested, IsOptional, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class CardDataDto {
  @ApiProperty({ 
    description: 'Número de tarjeta (16 dígitos)', 
    example: '4242424242424242',
    minLength: 16,
    maxLength: 19
  })
  @IsString()
  number: string;

  @ApiProperty({ 
    description: 'Mes de expiración (2 dígitos)', 
    example: '12',
    minLength: 2,
    maxLength: 2
  })
  @IsString()
  exp_month: string;

  @ApiProperty({ 
    description: 'Año de expiración (2 dígitos)', 
    example: '29',
    minLength: 2,
    maxLength: 2
  })
  @IsString()
  exp_year: string;

  @ApiProperty({ 
    description: 'Código de seguridad CVC (3 dígitos)', 
    example: '123',
    minLength: 3,
    maxLength: 4
  })
  @IsString()
  cvc: string;

  @ApiProperty({ 
    description: 'Nombre del titular de la tarjeta', 
    example: 'Juan Pérez',
    minLength: 2,
    maxLength: 100
  })
  @IsString()
  card_holder: string;
}

export class ProcessTransactionDto {
  @ApiProperty({ 
    description: 'Referencia única de la transacción', 
    example: 'checkout-uuid-123',
    minLength: 1,
    maxLength: 100
  })
  @IsString()
  reference: string;

  @ApiProperty({ 
    description: 'Monto en centavos (COP)', 
    example: 150000,
    minimum: 50
  })
  @IsNumber()
  @Min(50, { message: 'El monto mínimo es 50 centavos' })
  amount_in_cents: number;

  @ApiProperty({ 
    description: 'Código de moneda ISO', 
    example: 'COP',
    enum: ['COP']
  })
  @IsString()
  currency: string;

  @ApiProperty({ 
    description: 'Email del cliente', 
    example: 'cliente@ejemplo.com'
  })
  @IsEmail({}, { message: 'Debe ser un email válido' })
  customer_email: string;

  @ApiProperty({ 
    description: 'Datos de la tarjeta para el pago', 
    type: CardDataDto
  })
  @ValidateNested()
  @Type(() => CardDataDto)
  card_data: CardDataDto;

  @ApiProperty({ 
    description: 'Proveedor de pago específico (opcional)', 
    example: 'wompi',
    required: false
  })
  @IsOptional()
  @IsString()
  provider?: string;
}