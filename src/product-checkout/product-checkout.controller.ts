import { Controller, Post, Body, Get, Param } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam } from '@nestjs/swagger';
import { ProductCheckoutService } from './services/product-checkout.service';
import { CreateCheckoutDto, CreateCheckoutWithCardDto, CheckoutResponseDto, CheckoutStatusResponseDto, WompiWebhookDto } from './dto';

@ApiTags('product-checkout')
@Controller('product-checkout')
export class ProductCheckoutController {
  constructor(private readonly productCheckoutService: ProductCheckoutService) {}

  @Post()
  @ApiOperation({ 
    summary: 'Crear checkout de productos',
    description: 'Crea una sesión de checkout para productos seleccionados y retorna URL de pago. Requiere un array de productos con sus cantidades respectivas.'
  })
  @ApiResponse({ 
    status: 201, 
    description: 'Checkout creado exitosamente', 
    type: CheckoutResponseDto 
  })
  @ApiResponse({ 
    status: 400, 
    description: 'Validación fallida o productos no encontrados'
  })
  @ApiResponse({ 
    status: 404, 
    description: 'Uno o más productos no encontrados'
  })
  async createCheckout(
    @Body() createCheckoutDto: CreateCheckoutDto
  ): Promise<CheckoutResponseDto> {
    return await this.productCheckoutService.createCheckout(createCheckoutDto);
  }

  @Post('with-card')
  @ApiOperation({ 
    summary: 'Crear checkout y procesar pago con tarjeta',
    description: 'Crea una sesión de checkout y procesa el pago inmediatamente con los datos de tarjeta proporcionados usando transacción directa con Wompi. El año de expiración debe estar en formato de 2 dígitos.'
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
  async createCheckoutWithCard(
    @Body() createCheckoutDto: CreateCheckoutWithCardDto
  ): Promise<CheckoutResponseDto> {
    return await this.productCheckoutService.createCheckoutWithCard(createCheckoutDto);
  }

  @Get(':checkout_id/status')
  @ApiOperation({ 
    summary: 'Get checkout status',
    description: 'Retrieves the current status and details of a checkout'
  })
  @ApiParam({
    name: 'checkout_id',
    description: 'Checkout UUID',
    example: '7ba7b810-9dad-11d1-80b4-00c04fd430c8'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Checkout status retrieved successfully', 
    type: CheckoutStatusResponseDto 
  })
  @ApiResponse({ 
    status: 400, 
    description: 'Checkout not found'
  })
  async getCheckoutStatus(
    @Param('checkout_id') checkoutId: string
  ): Promise<CheckoutStatusResponseDto> {
    return await this.productCheckoutService.getCheckoutStatus(checkoutId);
  }

  @Post('webhook/wompi')
  @ApiOperation({ 
    summary: 'Wompi webhook handler',
    description: 'Receives payment status updates from Wompi'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Webhook processed successfully'
  })
  @ApiResponse({ 
    status: 400, 
    description: 'Webhook processing failed'
  })
  async handleWompiWebhook(
    @Body() webhook: WompiWebhookDto
  ): Promise<{ success: boolean; message: string }> {
    return await this.productCheckoutService.handleWompiWebhook(webhook);
  }
}