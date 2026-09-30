import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { User } from '../../auth/user.entity';

@Entity()
export class Event {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @ManyToOne(() => User, (user) => user.events, {
    nullable: false,
    onDelete: 'RESTRICT',
  })
  organizer: User;
}

export class EventEntity {}
