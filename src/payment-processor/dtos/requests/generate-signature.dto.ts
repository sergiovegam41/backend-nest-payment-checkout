import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNumber, Min } from 'class-validator';

export class GenerateSignatureDto {
  @ApiProperty({ 
    description: 'Referencia de la transacción', 
    example: 'checkout-uuid-123',
    minLength: 1,
    maxLength: 100
  })
  @IsString()
  reference: string;

  @ApiProperty({ 
    description: 'Monto en centavos', 
    example: 150000,
    minimum: 1
  })
  @IsNumber()
  @Min(1, { message: 'El monto debe ser mayor a 0' })
  amount_in_cents: number;

  @ApiProperty({ 
    description: 'Código de moneda', 
    example: 'COP',
    enum: ['COP']
  })
  @IsString()
  currency: string;
}