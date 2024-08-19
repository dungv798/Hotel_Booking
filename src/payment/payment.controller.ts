import { Controller, Post, Param, Res, UseGuards, HttpStatus } from '@nestjs/common';
import { PaymentService } from './payment.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Response } from 'express';

@ApiTags('Payment')
@Controller('payment')
export class PaymentController {
  constructor(private readonly paymentService: PaymentService) {}

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @Post(':confirmationNo')
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
