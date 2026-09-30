import { Body, Controller, Get, Param, Post, Patch, Delete, Req, UseGuards } from '@nestjs/common';
import { EventsService } from './events.service';
import { CreateEventDto } from './dto/create-event.dto';
import { CreateTicketTypeDto } from './dto/create-ticket-type.dto';
import { UpdateEventDto } from './dto/update-event.dto';
import { CreateReservationDto } from './dto/create-reservation.dto';
import { ReservationsService } from '../reservations/reservations.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Roles } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';
import { UserRole } from '../auth/user.entity';

type AuthenticatedRequest = { user: { userId: number } };

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

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ORGANIZER)
  @Get('my-events')
  getMyEvents(@Req() req: AuthenticatedRequest) {
    return this.eventsService.getOrganizerEvents(req.user.userId);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.CUSTOMER)
  @Get('my-reservations')
  getMyReservations(@Req() req: AuthenticatedRequest) {
    return this.reservationsService.getCustomerReservations(req.user.userId);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.CUSTOMER)
  @Get('my-orders')
  getMyOrders(@Req() req: AuthenticatedRequest) {
    return this.reservationsService.getCustomerOrders(req.user.userId);
  }

  @Get(':id')
  getEvent(@Param('id') id: string) {
    return this.eventsService.getEventById(id);
  }

  @Get(':id/ticket-types')
  getTicketTypes(@Param('id') id: string) {
    return this.eventsService.getTicketTypesForEvent(id);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ORGANIZER)
  @Post()
  createEvent(@Body() body: CreateEventDto, @Req() req: AuthenticatedRequest) {
    return this.eventsService.createEvent(body, req.user.userId);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ORGANIZER)
  @Post(':id/ticket-types')
  createTicketType(
    @Param('id') id: string,
    @Body() body: CreateTicketTypeDto,
    @Req() req: AuthenticatedRequest,
  ) {
    return this.eventsService.createTicketType(id, body, req.user.userId);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ORGANIZER)
  @Patch(':id')
  updateEvent(
    @Param('id') id: string,
    @Body() body: UpdateEventDto,
    @Req() req: AuthenticatedRequest,
  ) {
    return this.eventsService.updateEvent(id, body, req.user.userId);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ORGANIZER)
  @Delete(':id')
  deleteEvent(
    @Param('id') id: string,
    @Req() req: AuthenticatedRequest,
  ) {
    return this.eventsService.deleteEvent(id, req.user.userId);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.CUSTOMER)
  @Post(':id/ticket-types/:ticketTypeId/reservations')
  createReservation(
    @Param('id') eventId: string,
    @Param('ticketTypeId') ticketTypeId: string,
    @Body() body: CreateReservationDto,
    @Req() req: AuthenticatedRequest,
  ) {
    return this.reservationsService.createReservation(
      eventId,
      ticketTypeId,
      body,
      req.user.userId,
    );
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.CUSTOMER)
  @Post('reservations/:reservationId/purchase')
  purchaseReservation(
    @Param('reservationId') reservationId: string,
    @Req() req: AuthenticatedRequest,
  ) {
    return this.reservationsService.purchaseReservation(
      reservationId,
      req.user.userId,
    );
  }
}
