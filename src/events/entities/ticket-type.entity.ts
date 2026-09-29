import {
  Check,
  Column,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

import { Event } from './event.entity';

@Entity()
@Check(`"price" >= 0`)
@Check(`"totalQuantity" >= 0`)
@Check(`"availableQuantity" >= 0`)
@Check(`"availableQuantity" <= "totalQuantity"`)
export class TicketType {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column()
  price: number;

  @Column()
  totalQuantity: number;

  @Column()
  availableQuantity: number;
  @ManyToOne(() => Event)
  event: Event;
}
