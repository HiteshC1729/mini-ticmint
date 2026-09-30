import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Reservation } from '../events/entities/reservation.entity';
import { TicketType } from '../events/entities/ticket-type.entity';
import { ReservationsService } from './reservations.service';
import { Order } from '../events/entities/order.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Reservation,
      TicketType,
      Order,
    ]),
  ],
  providers: [ReservationsService],
  exports: [ReservationsService],
})
export class ReservationsModule {}