import { Body, Controller, Get, Param, Post, Patch, Delete, UseGuards } from '@nestjs/common';
import { EventsService } from './events.service';
import { CreateEventDto } from './dto/create-event.dto';
import { CreateTicketTypeDto } from './dto/create-ticket-type.dto';
import { UpdateEventDto } from './dto/update-event.dto';
import { CreateReservationDto } from './dto/create-reservation.dto';
import { ReservationsService } from '../reservations/reservations.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('events')
export class EventsController {
  constructor(
    private readonly eventsService: EventsService,
    private readonly reservationsService: ReservationsService,
  ) { }

  @Get()
  getEvents() {
    return this.eventsService.getEvents();
  }

  @Get(':id')
  getEvent(@Param('id') id: string) {
    return this.eventsService.getEventById(id);
  }

  @Get(':id/ticket-types')
  getTicketTypes(@Param('id') id: string) {
    return this.eventsService.getTicketTypesForEvent(id);
  }

  @UseGuards(JwtAuthGuard)
  @Post()
  createEvent(@Body() body: CreateEventDto) {
    return this.eventsService.createEvent(body);
  }

  @Post(':id/ticket-types')
  createTicketType(
    @Param('id') id: string,
    @Body() body: CreateTicketTypeDto,
  ) {
    return this.eventsService.createTicketType(id, body);
  }

  @Patch(':id')
  updateEvent(
    @Param('id') id: string,
    @Body() body: UpdateEventDto,
  ) {
    return this.eventsService.updateEvent(id, body);
  }

  @Delete(':id')
  deleteEvent(
    @Param('id') id: string,
  ) {
    return this.eventsService.deleteEvent(id);
  }

  @Post(':id/ticket-types/:ticketTypeId/reservations')
  createReservation(
    @Param('ticketTypeId') ticketTypeId: string,
    @Body() body: CreateReservationDto,
  ) {
    return this.reservationsService.createReservation(
      ticketTypeId,
      body,
    );
  }

  @Post('reservations/:reservationId/purchase')
  purchaseReservation(
    @Param('reservationId') reservationId: string,
  ) {
    return this.reservationsService.purchaseReservation(
      reservationId,
    );
  }
}