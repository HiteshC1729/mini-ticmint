import {
    BadRequestException,
    Injectable,
    NotFoundException,
} from '@nestjs/common';

import { DataSource } from 'typeorm';
import { Cron, CronExpression } from '@nestjs/schedule';

import { TicketType } from '../events/entities/ticket-type.entity';
import { Reservation } from '../events/entities/reservation.entity';
import { Order } from '../events/entities/order.entity';
import { CreateReservationDto } from '../events/dto/create-reservation.dto';

@Injectable()
export class ReservationsService {
    constructor(
        private readonly dataSource: DataSource,
    ) { }

    async createReservation(
        ticketTypeId: string,
        body: CreateReservationDto,
    ) {
        const queryRunner = this.dataSource.createQueryRunner();

        await queryRunner.connect();
        await queryRunner.startTransaction();

        try {
            const ticketType = await queryRunner.manager
                .getRepository(TicketType)
                .createQueryBuilder('ticketType')
                .setLock('pessimistic_write')
                .where('ticketType.id = :id', {
                    id: Number(ticketTypeId),
                })
                .getOne();

            if (!ticketType) {
                throw new NotFoundException('Ticket type not found');
            }

            if (ticketType.availableQuantity < body.quantity) {
                throw new BadRequestException(
                    'Not enough tickets available',
                );
            }

            ticketType.availableQuantity -= body.quantity;

            await queryRunner.manager
                .getRepository(TicketType)
                .save(ticketType);

            const reservation = queryRunner.manager
                .getRepository(Reservation)
                .create({
                    quantity: body.quantity,
                    status: 'ACTIVE',
                    expiresAt: new Date(
                        Date.now() + 15 * 60 * 1000,
                    ),
                    ticketType,
                });

            await queryRunner.manager
                .getRepository(Reservation)
                .save(reservation);

            await queryRunner.commitTransaction();

            return reservation;
        } catch (error) {
            await queryRunner.rollbackTransaction();
            throw error;
        } finally {
            await queryRunner.release();
        }
    }

    async purchaseReservation(reservationId: string) {
        const queryRunner = this.dataSource.createQueryRunner();

        await queryRunner.connect();
        await queryRunner.startTransaction();

        try {
            const reservation = await queryRunner.manager
                .getRepository(Reservation)
                .createQueryBuilder('reservation')
                .setLock('pessimistic_write')
                .where('reservation.id = :id', {
                    id: Number(reservationId),
                })
                .getOne();

            if (!reservation) {
                throw new NotFoundException(
                    'Reservation not found',
                );
            }

            if (reservation.status !== 'ACTIVE') {
                throw new BadRequestException(
                    'Reservation cannot be purchased',
                );
            }

            if (reservation.expiresAt <= new Date()) {
                throw new BadRequestException(
                    'Reservation has expired',
                );
            }

            const ticketType = await queryRunner.manager
                .getRepository(TicketType)
                .findOne({
                    where: {
                        id: reservation.ticketTypeId,
                    },
                });

            if (!ticketType) {
                throw new NotFoundException(
                    'Ticket type not found',
                );
            }

            const totalAmount =
                ticketType.price * reservation.quantity;

            const order = queryRunner.manager
                .getRepository(Order)
                .create({
                    quantity: reservation.quantity,
                    totalAmount,
                    reservation,
                });

            await queryRunner.manager
                .getRepository(Order)
                .save(order);

            reservation.status = 'PURCHASED';

            await queryRunner.manager
                .getRepository(Reservation)
                .save(reservation);

            await queryRunner.commitTransaction();

            return order;
        } catch (error) {
            await queryRunner.rollbackTransaction();
            throw error;
        } finally {
            await queryRunner.release();
        }
    }

    @Cron(CronExpression.EVERY_MINUTE)
    async expireReservations() {
        const reservations = await this.dataSource
            .getRepository(Reservation)
            .createQueryBuilder('reservation')
            .where('reservation.status = :status', {
                status: 'ACTIVE',
            })
            .andWhere('reservation.expiresAt <= :now', {
                now: new Date(),
            })
            .getMany();

        for (const reservation of reservations) {
            const queryRunner =
                this.dataSource.createQueryRunner();

            await queryRunner.connect();
            await queryRunner.startTransaction();

            try {
                // Lock the reservation itself.
                // No JOIN here because PostgreSQL does not allow
                // FOR UPDATE on the nullable side of a LEFT JOIN.
                const lockedReservation =
                    await queryRunner.manager
                        .getRepository(Reservation)
                        .createQueryBuilder('reservation')
                        .setLock('pessimistic_write')
                        .where('reservation.id = :id', {
                            id: reservation.id,
                        })
                        .getOne();

                if (!lockedReservation) {
                    await queryRunner.rollbackTransaction();
                    continue;
                }

                // Re-check because the reservation may have changed
                // after the initial candidate query.
                if (
                    lockedReservation.status !== 'ACTIVE' ||
                    lockedReservation.expiresAt > new Date()
                ) {
                    await queryRunner.rollbackTransaction();
                    continue;
                }

                // Lock the ticket type separately because we are
                // about to modify its inventory.
                const ticketType = await queryRunner.manager
                    .getRepository(TicketType)
                    .createQueryBuilder('ticketType')
                    .setLock('pessimistic_write')
                    .where('ticketType.id = :id', {
                        id: lockedReservation.ticketTypeId,
                    })
                    .getOne();

                if (!ticketType) {
                    throw new NotFoundException(
                        'Ticket type not found',
                    );
                }

                // Return the reserved tickets to inventory.
                ticketType.availableQuantity +=
                    lockedReservation.quantity;

                await queryRunner.manager
                    .getRepository(TicketType)
                    .save(ticketType);

                // Prevent this reservation from being processed
                // again by future scheduler runs.
                lockedReservation.status = 'EXPIRED';

                await queryRunner.manager
                    .getRepository(Reservation)
                    .save(lockedReservation);

                await queryRunner.commitTransaction();
            } catch (error) {
                await queryRunner.rollbackTransaction();
                throw error;
            } finally {
                await queryRunner.release();
            }
        }
    }
}