import { Controller, Get, Post, Body, Query, Param } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiProperty } from '@nestjs/swagger';
import { PaymentProcessorService } from './payment-processor.service';
import { IsString, IsNumber, IsEmail, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

// DTOs for Payment Processor endpoints
class CardDataForProcessorDto {
  @ApiProperty({ description: 'Número de tarjeta', example: '4242424242424242' })
  @IsString()
  number: string;

  @ApiProperty({ description: 'Mes de expiración', example: '12' })
  @IsString()
  exp_month: string;

  @ApiProperty({ description: 'Año de expiración', example: '29' })
  @IsString()
  exp_year: string;

  @ApiProperty({ description: 'Código de seguridad', example: '123' })
  @IsString()
  cvc: string;

  @ApiProperty({ description: 'Nombre del titular', example: 'Juan Pérez' })
  @IsString()
  card_holder: string;
}

class DirectTransactionRequestDto {
  @ApiProperty({ description: 'Referencia de la transacción', example: 'checkout-uuid-123' })
  @IsString()
  reference: string;

  @ApiProperty({ description: 'Monto en centavos', example: 150000 })
  @IsNumber()
  amount_in_cents: number;

  @ApiProperty({ description: 'Código de moneda', example: 'COP' })
  @IsString()
  currency: string;

  @ApiProperty({ description: 'Email del cliente', example: 'cliente@ejemplo.com' })
  @IsEmail()
  customer_email: string;

  @ApiProperty({ description: 'Datos de la tarjeta', type: CardDataForProcessorDto })
  @ValidateNested()
  @Type(() => CardDataForProcessorDto)
  card_data: CardDataForProcessorDto;

  @ApiProperty({ description: 'Proveedor de pago (opcional)', example: 'wompi', required: false })
  @IsString()
  provider?: string;
}

@ApiTags('payments')
@Controller('payments')
export class PaymentProcessorController {
  constructor(private readonly paymentProcessorService: PaymentProcessorService) {}



  @Get('providers')
  @ApiOperation({ summary: 'Obtener proveedores de pago disponibles' })
  @ApiResponse({ status: 200, description: 'Lista de proveedores de pago disponibles' })
  getProviders(): { providers: string[] } {
    return {
      providers: this.paymentProcessorService.getAvailableProviders()
    };
  }

  @Post('process-transaction')
  @ApiOperation({ 
    summary: 'Procesar transacción directa (Uso interno/avanzado)',
    description: 'Procesa una transacción directa con tarjeta sin lógica de checkout. NOTA: Para compras de productos, usar POST /product-checkout en su lugar.'
  })
  @ApiResponse({ status: 201, description: 'Transacción procesada exitosamente' })
  @ApiResponse({ status: 400, description: 'Error en el procesamiento de la transacción' })
  async processDirectTransaction(@Body() request: DirectTransactionRequestDto) {
    return await this.paymentProcessorService.processDirectTransaction(
      request.reference,
      request.amount_in_cents,
      request.currency,
      request.customer_email,
      request.card_data,
      request.provider
    );
  }

  @Post('tokenize-card')
  @ApiOperation({ 
    summary: 'Tokenizar datos de tarjeta',
    description: 'Convierte los datos de tarjeta en un token seguro para uso en transacciones'
  })
  @ApiResponse({ status: 201, description: 'Tarjeta tokenizada exitosamente' })
  @ApiResponse({ status: 400, description: 'Error en la tokenización' })
  async tokenizeCard(
    @Body() cardData: CardDataForProcessorDto,
    @Query('provider') provider?: string
  ) {
    return await this.paymentProcessorService.tokenizeCard(cardData, provider);
  }

  @Get('merchant-info')
  @ApiOperation({ 
    summary: 'Obtener información del comercio',
    description: 'Obtiene información del comercio incluyendo tokens de aceptación necesarios para transacciones'
  })
  @ApiResponse({ status: 200, description: 'Información del comercio obtenida exitosamente' })
  @ApiResponse({ status: 400, description: 'Error al obtener información del comercio' })
  async getMerchantInfo(@Query('provider') provider?: string) {
    return await this.paymentProcessorService.getMerchantInfo(provider);
  }

  @Post('generate-signature')
  @ApiOperation({ 
    summary: 'Generar firma de transacción',
    description: 'Genera la firma SHA-256 necesaria para validar transacciones con el proveedor'
  })
  @ApiResponse({ status: 200, description: 'Firma generada exitosamente' })
  async generateSignature(
    @Body() request: { reference: string; amount_in_cents: number; currency: string },
    @Query('provider') provider?: string
  ) {
    const signature = await this.paymentProcessorService.generateTransactionSignature(
      request.reference,
      request.amount_in_cents,
      request.currency,
      provider
    );
    
    return { signature };
  }

  @Get('transaction/:transactionId/status')
  @ApiOperation({ 
    summary: 'Verificar estado de transacción',
    description: 'Consulta el estado actual de una transacción usando su ID'
  })
  @ApiResponse({ status: 200, description: 'Estado de transacción obtenido exitosamente' })
  @ApiResponse({ status: 400, description: 'Error al consultar el estado' })
  @ApiResponse({ status: 404, description: 'Transacción no encontrada' })
  async getTransactionStatus(
    @Param('transactionId') transactionId: string,
    @Query('provider') provider?: string
  ) {
    return await this.paymentProcessorService.getTransactionStatus(transactionId, provider);
  }
}
