import { ApiProperty } from '@nestjs/swagger';

export class TransactionDataDto {
  @ApiProperty({ 
    description: 'ID único de la transacción', 
    example: 'trans_12345-abcde-67890' 
  })
  transactionId: string;

  @ApiProperty({ 
    description: 'Estado de la transacción', 
    example: 'APPROVED',
    enum: ['APPROVED', 'DECLINED', 'PENDING', 'ERROR']
  })
  status: string;

  @ApiProperty({ 
    description: 'Referencia original de la transacción', 
    example: 'checkout-uuid-123' 
  })
  reference: string;

  @ApiProperty({ 
    description: 'Monto procesado en centavos', 
    example: 150000 
  })
  amount_in_cents: number;

  @ApiProperty({ 
    description: 'Moneda de la transacción', 
    example: 'COP' 
  })
  currency: string;
}

export class TransactionResponseDto {
  @ApiProperty({ description: 'Resultado de la transacción', example: true })
  success: boolean;

  @ApiProperty({ 
    description: 'Datos de la transacción procesada', 
    type: TransactionDataDto,
    required: false 
  })
  data?: TransactionDataDto;

  @ApiProperty({ 
    description: 'Mensaje de error si la transacción falló', 
    example: 'Card declined by issuer',
    required: false 
  })
  errorMessage?: string;

  @ApiProperty({ 
    description: 'Timestamp de la respuesta', 
    example: '2024-01-15T10:30:00.000Z' 
  })
  timestamp: string;
}