import { Module } from '@nestjs/common';
import { EventsController } from './events.controller';
import { EventsService } from './events.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Event } from './entities/event.entity';
import { TicketType } from './entities/ticket-type.entity';
import { Reservation } from './entities/reservation.entity';
import { ReservationsModule } from '../reservations/reservations.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Event, TicketType, Reservation]),
    ReservationsModule,
  ],
  controllers: [EventsController],
  providers: [EventsService]
})
export class EventsModule {}
