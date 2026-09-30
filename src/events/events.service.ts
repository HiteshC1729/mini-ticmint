import { Injectable, NotFoundException, ConflictException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Event } from './entities/event.entity';
import { TicketType } from './entities/ticket-type.entity';
import { CreateTicketTypeDto } from './dto/create-ticket-type.dto';
import { CreateEventDto } from './dto/create-event.dto';
import { UpdateEventDto } from './dto/update-event.dto';

@Injectable()
export class EventsService {
    constructor(
        @InjectRepository(Event)
        private readonly eventRepository: Repository<Event>,

        @InjectRepository(TicketType)
        private readonly ticketTypeRepository: Repository<TicketType>,

    ) { }

    async createEvent(body: CreateEventDto, organizerId: number) {
        const event = this.eventRepository.create({
            name: body.name,
            organizer: { id: organizerId },
        });
        return this.eventRepository.save(event);
    }

    async createTicketType(id: string, body: CreateTicketTypeDto, organizerId: number) {
        const event = await this.getOwnedEvent(id, organizerId);

        const ticketType = this.ticketTypeRepository.create({
            name: body.name,
            price: body.price,
            totalQuantity: body.totalQuantity,
            availableQuantity: body.totalQuantity,
            event,
        });
        return this.ticketTypeRepository.save(ticketType);
    }

    getEvents() {
        return this.eventRepository.find();
    }

    getOrganizerEvents(organizerId: number) {
        return this.eventRepository.find({
            where: { organizer: { id: organizerId } },
        });
    }

    async getEventById(id: string) {
        const event = await this.eventRepository.findOneBy({
            id: Number(id),
        });
        if (!event) {
            throw new NotFoundException('Event not found');
        }

        return event;
    }

    async getTicketTypesForEvent(id: string) {
        const event = await this.eventRepository.findOneBy({
            id: Number(id),
        });
        if (!event) {
            throw new NotFoundException('Event not found');
        }

        return this.ticketTypeRepository.find({
            where: {
                event: {
                    id: Number(id),
                },
            },
        });
    }

    async updateEvent(id: string, body: UpdateEventDto, organizerId: number) {
        const event = await this.getOwnedEvent(id, organizerId);

        if (body.name !== undefined) {
            event.name = body.name;
        }

        await this.eventRepository.save(event);

        return event;
    }

    async deleteEvent(id: string, organizerId: number) {
        const event = await this.getOwnedEvent(id, organizerId);

        const ticketTypes = await this.ticketTypeRepository.find({
            where: {
                event: {
                    id: Number(id),
                },
            },
        });
        if (ticketTypes.length > 0) {
            throw new ConflictException(
                'Cannot delete event because it has ticket types',
            );
        }

        await this.eventRepository.remove(event);

        return {
            message: 'Event deleted successfully'
        };
    }

    private async getOwnedEvent(id: string, organizerId: number) {
        const event = await this.eventRepository.findOne({
            where: { id: Number(id) },
            relations: { organizer: true },
        });
        if (!event) {
            throw new NotFoundException('Event not found');
        }
        if (event.organizer.id !== organizerId) {
            throw new ForbiddenException('You can only manage your own events');
        }
        return event;
    }
}
