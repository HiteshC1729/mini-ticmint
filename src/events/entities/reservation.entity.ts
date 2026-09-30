import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  RelationId,
} from 'typeorm';

import { TicketType } from './ticket-type.entity';
import { User } from '../../auth/user.entity';

@Entity()
export class Reservation {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  quantity: number;

  @Column()
  status: string;

  @Column()
  expiresAt: Date;

  @CreateDateColumn()
  createdAt: Date;

  @ManyToOne(() => TicketType)
  ticketType: TicketType;

  @RelationId((reservation: Reservation) => reservation.ticketType)
  ticketTypeId: number;

  @ManyToOne(() => User, (user) => user.reservations, {
    nullable: false,
    onDelete: 'RESTRICT',
  })
  customer: User;

  @RelationId((reservation: Reservation) => reservation.customer)
  customerId: number;
}
