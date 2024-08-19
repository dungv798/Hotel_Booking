import { Injectable } from '@nestjs/common';

@Injectable()
export class PaymentService {
  private bookings = new Map<string, any>();

  storeBookingData(confirmationNo: string, bookingData: any) {
    this.bookings.set(confirmationNo, bookingData);
  }

  getBookingData(confirmationNo: string): any | null {
    return this.bookings.get(confirmationNo) || null;
  }

  async generatePaymentUrl(confirmationNo: string): Promise<string> {
    const bookingData = this.getBookingData(confirmationNo);
    if (!bookingData) {
      throw new Error('Booking data not found');
    }
    const paymentUrl = `https://payment.example.com/pay?orderId=${confirmationNo}&amount=${bookingData.amount}`;
    return paymentUrl;
  }
}
