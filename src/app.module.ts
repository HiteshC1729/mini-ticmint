import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { EventsModule } from './events/events.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Event } from './events/entities/event.entity';
import { TicketType } from './events/entities/ticket-type.entity';
import { Reservation } from './events/entities/reservation.entity';
import { ScheduleModule } from '@nestjs/schedule';
import { ReservationsModule } from './reservations/reservations.module';
import { Order } from './events/entities/order.entity';
import { User } from './auth/user.entity';
import { AuthModule } from './auth/auth.module';

@Module({
  controllers: [AppController],
  providers: [AppService],
  imports: [
    ScheduleModule.forRoot(),
    EventsModule,
    ReservationsModule,
    AuthModule,
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: 'localhost',
      port: 5432,
      username: 'hitesh',
      database: 'mini_ticmint',
      entities: [Event, TicketType, Reservation, Order, User],
      synchronize: true,
    }),
  ],
})
export class AppModule {}