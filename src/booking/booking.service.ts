import { Injectable, NotFoundException } from '@nestjs/common';

@Injectable()
export class BookingService {
  private bookings = [
    { id: '173903', customerName: 'John Doe', roomNumber: 101, checkIn: '2024-08-18', checkOut: '2024-08-20' },
    { id: '173904', customerName: 'Jane Smith', roomNumber: 102, checkIn: '2024-08-19', checkOut: '2024-08-21' },
  ];

  findBookingById(id: string) {
    const booking = this.bookings.find((b) => b.id === id);
    if (!booking) {
      throw new NotFoundException('Booking not found');
    }
    return booking;
  }
}
