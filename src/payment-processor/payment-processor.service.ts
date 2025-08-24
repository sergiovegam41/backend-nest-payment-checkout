import { Injectable } from '@nestjs/common';
import { CreatePaymentProcessorDto } from './dto/create-payment-processor.dto';
import { UpdatePaymentProcessorDto } from './dto/update-payment-processor.dto';

@Injectable()
export class PaymentProcessorService {
  create(createPaymentProcessorDto: CreatePaymentProcessorDto) {
    return 'This action adds a new paymentProcessor';
  }

  findAll() {
    return `This action returns all paymentProcessor`;
  }

  findOne(id: number) {
    return `This action returns a #${id} paymentProcessor`;
  }

  update(id: number, updatePaymentProcessorDto: UpdatePaymentProcessorDto) {
    return `This action updates a #${id} paymentProcessor`;
  }

  remove(id: number) {
    return `This action removes a #${id} paymentProcessor`;
  }
}
