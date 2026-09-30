import { Test, TestingModule } from '@nestjs/testing';
import { EventsController } from './events.controller';
import { EventsService } from './events.service';
import { ReservationsService } from '../reservations/reservations.service';

describe('EventsController', () => {
  let controller: EventsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [EventsController],
      providers: [
        { provide: EventsService, useValue: {} },
        { provide: ReservationsService, useValue: {} },
      ],
    }).compile();

    controller = module.get<EventsController>(EventsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
