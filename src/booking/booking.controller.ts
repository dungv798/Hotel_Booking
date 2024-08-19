import { Controller, Get, Param, UseGuards, Post, Res, HttpStatus } from '@nestjs/common';
import { XmlService } from './xml.service';
import { BookingService } from './booking.service';
import { PaymentService } from '../payment/payment.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Response } from 'express';

@ApiTags('Booking')
@Controller('booking')
export class BookingController {
  constructor(
    private readonly xmlService: XmlService,
    private readonly bookingService: BookingService,
    private readonly paymentService: PaymentService
  ) {}

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @Get(':confirmationNo')
  async getBooking(@Param('confirmationNo') confirmationNo: string) {
    const bookingData = await this.xmlService.parseXmlWithLibrary(confirmationNo);
    this.paymentService.storeBookingData(confirmationNo, bookingData);
    return bookingData;
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @Get('custom/:confirmationNo')
  async getBookingCustom(@Param('confirmationNo') confirmationNo: string) {
    const bookingData = this.xmlService.parseXmlWithoutLibrary(confirmationNo);
    this.paymentService.storeBookingData(confirmationNo, bookingData);
    return bookingData;
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @Post('payment/:confirmationNo')
  async processPayment(
    @Param('confirmationNo') confirmationNo: string,
    @Res() res: Response,
  ) {
    try {
      const paymentUrl = await this.paymentService.generatePaymentUrl(confirmationNo);
      res.redirect(paymentUrl);
    } catch (error) {
      console.error('Payment processing failed:', error.message);
      res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
        message: 'Payment processing failed',
        error: error.message,
      });
    }
  }
}
