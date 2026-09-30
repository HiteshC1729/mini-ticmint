import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Event } from '../events/entities/event.entity';
import { Reservation } from '../events/entities/reservation.entity';

export enum UserRole {
  ORGANIZER = 'ORGANIZER',
  CUSTOMER = 'CUSTOMER',
}

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  email: string;

  @Column()
  password: string;

  @Column({ type: 'varchar' })
  role: UserRole;

  @CreateDateColumn()
  createdAt: Date;

  @OneToMany(() => Event, (event) => event.organizer)
  events: Event[];

  @OneToMany(() => Reservation, (reservation) => reservation.customer)
  reservations: Reservation[];
}
