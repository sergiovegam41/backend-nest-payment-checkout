import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { PaymentProcessorService } from './payment-processor.service';
import { CreatePaymentProcessorDto } from './dto/create-payment-processor.dto';
import { UpdatePaymentProcessorDto } from './dto/update-payment-processor.dto';

@Controller('payment-processor')
export class PaymentProcessorController {
  constructor(private readonly paymentProcessorService: PaymentProcessorService) {}

  @Post()
  create(@Body() createPaymentProcessorDto: CreatePaymentProcessorDto) {
    return this.paymentProcessorService.create(createPaymentProcessorDto);
  }

  @Get()
  findAll() {
    return this.paymentProcessorService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.paymentProcessorService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updatePaymentProcessorDto: UpdatePaymentProcessorDto) {
    return this.paymentProcessorService.update(+id, updatePaymentProcessorDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.paymentProcessorService.remove(+id);
  }
}
