import { Body, Controller, Get, Param, Post, Patch, Delete } from '@nestjs/common';
import { EventsService } from './events.service';
import { CreateEventDto } from './dto/create-event.dto';
import { CreateTicketTypeDto } from './dto/create-ticket-type.dto';
import { UpdateEventDto } from './dto/update-event.dto';

@Controller('events')
export class EventsController {
  constructor(private readonly eventsService: EventsService) {}

  @Get()
  getEvents(){
    return this.eventsService.getEvents();
  }

  @Get(':id')
  getEvent(@Param('id') id: string){
    return this.eventsService.getEventById(id);
  }

  @Get(':id/ticket-types')
  getTicketTypes(@Param('id') id: string) {
    return this.eventsService.getTicketTypesForEvent(id);
  }

  @Post()
  createEvent(@Body() body: CreateEventDto){
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
  deleteEvent (
    @Param('id') id: string,
  ) {
    return this.eventsService.deleteEvent(id);
  }
}