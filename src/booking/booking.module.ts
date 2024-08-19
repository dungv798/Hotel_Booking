import { Module } from '@nestjs/common';
import { BookingController } from './booking.controller';
import { BookingService } from './booking.service';
import { XmlService } from './xml.service';
import { PaymentService } from '../payment/payment.service';

@Module({
  controllers: [BookingController],
  providers: [BookingService, XmlService, PaymentService],
})
export class BookingModule {}
