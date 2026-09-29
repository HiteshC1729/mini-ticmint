import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { EventsModule } from './events/events.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Event } from './events/entities/event.entity';
import { TicketType } from './events/entities/ticket-type.entity';

@Module({
  controllers: [AppController],
  providers: [AppService],
  imports: [
    EventsModule,
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: 'localhost',
      port: 5432,
      username: 'hitesh',
      database: 'mini_ticmint',
      entities: [Event, TicketType],
      synchronize: true,
    }),
  ],
})
export class AppModule {}