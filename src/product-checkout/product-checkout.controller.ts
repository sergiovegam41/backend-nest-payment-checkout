import { Controller, Post, Body, Get, Param } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam } from '@nestjs/swagger';
import { ProductCheckoutService } from './services/product-checkout.service';
import { CreateCheckoutWithCardDto, CheckoutResponseDto, CheckoutSimpleStatusDto, WompiWebhookDto } from './dto';

@ApiTags('product-payment')
@Controller('product-checkout')
export class ProductCheckoutController {
  constructor(private readonly productCheckoutService: ProductCheckoutService) {}

  @Post()
  @ApiOperation({ 
    summary: 'Crear checkout y procesar pago con tarjeta',
    description: 'Crea una sesión de checkout y procesa el pago inmediatamente con los datos de tarjeta proporcionados usando transacción directa. El año de expiración debe estar en formato de 2 dígitos.'
  })
  @ApiResponse({ 
    status: 201, 
    description: 'Checkout y pago procesados exitosamente', 
    type: CheckoutResponseDto 
  })
  @ApiResponse({ 
    status: 400, 
    description: 'Validación fallida o procesamiento de pago fallido'
  })
  @ApiResponse({ 
    status: 404, 
    description: 'Productos no encontrados'
  })
  async createCheckout(
    @Body() createCheckoutDto: CreateCheckoutWithCardDto
  ): Promise<CheckoutResponseDto> {
    return await this.productCheckoutService.createCheckout(createCheckoutDto);
  }


  @Get(':checkout_id/status')
  @ApiOperation({ 
    summary: 'Obtener estado del checkout y transacción',
    description: 'Obtiene el estado actual del checkout desde la BD local y consulta el estado real de la transacción en Wompi API. Actualiza automáticamente el estado local si es necesario.'
  })
  @ApiParam({
    name: 'checkout_id',
    description: 'UUID del checkout',
    example: '99c066b6-882e-4c59-8ab8-d9721bbb3d9f'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Estado del checkout obtenido exitosamente. Consulta estado en Wompi y actualiza BD automáticamente.', 
    schema: {
      example: {
        status: 'PAID',
        total: 6664040
      }
    }
  })
  @ApiResponse({ 
    status: 400, 
    description: 'Checkout no encontrado'
  })
  async getCheckoutStatus(
    @Param('checkout_id') checkoutId: string
  ): Promise<CheckoutSimpleStatusDto> {
    return await this.productCheckoutService.getCheckoutStatus(checkoutId);
  }

 
}