import {
  Inject,
  Injectable,
  LoggerService,
  UnauthorizedException,
} from '@nestjs/common';
import { ITransactionService } from '@shared/services/transaction';
import { VersionChangedError } from '@shared/errors';
import { PaginationOptions, PaginationResult } from '@shared/types';
import { Reservation, ReservationStatus } from '../../../common/entities';
import { IReservationDao } from '../../../data-access/persistence/dao/reservation-dao/reservation-dao.interface';
import { IBookInventoryService } from '../book-inventory';
import { IWalletService } from '../wallet';
import {
  AlreadyReservedError,
  InvalidReservationStatusError,
  InvalidReturnDateError,
  ReservationNotFoundError,
} from '../../../common/errors';
import { IReservationService } from './reservation-service.interface';

@Injectable()
export class ReservationService implements IReservationService {
  private reservationPrice = 3;

  constructor(
    @Inject(IReservationDao) private dao: IReservationDao,
    @Inject(IBookInventoryService)
    private bookInvService: IBookInventoryService,
    @Inject(IWalletService) private walletService: IWalletService,
    @Inject('LoggerService') private logger: LoggerService,
    @Inject(ITransactionService)
    private transactionService: ITransactionService<unknown>,
  ) {}

  private validateReturnDate(returnDate: Date): void {
    returnDate = new Date(returnDate);
    const nextMonth = (new Date().getUTCMonth() + 1) % 12;
    const nextMonthDate = new Date();
    nextMonthDate.setUTCMonth(nextMonth);
    nextMonthDate.setUTCHours(0);
    nextMonthDate.setUTCMinutes(0);
    nextMonthDate.setUTCSeconds(0);
    nextMonthDate.setUTCMilliseconds(0);

    if (returnDate > nextMonthDate || returnDate < new Date()) {
      throw new InvalidReturnDateError(this.logger, nextMonthDate);
    }
  }

  private async updateReservation(
    id: string,
    update: Partial<Reservation>,
    version: number,
  ): Promise<Reservation> {
    const reservation = await this.dao.update(id, update, version);
    if (!reservation) {
      throw new VersionChangedError(this.logger, Reservation.name);
    }

    return reservation;
  }

  private async validateReservation(
    userId: string,
    bookId: string,
  ): Promise<void> {
    const reservation = await this.get({
      userId,
      bookId,
      returnDate: null,
    });

    if (reservation.length > 0) {
      throw new AlreadyReservedError(this.logger, userId, bookId);
    }
  }

  private async validateReservationStatus(
    reservationId: string,
    userId: string,
    status: ReservationStatus[],
    operation: string,
  ): Promise<Reservation> {
    const reservation = await this.getById(reservationId);

    if (reservation.userId !== userId) {
      throw new UnauthorizedException(
        `Reservation does not belong to user ${userId}`,
      );
    }

    if (!status.includes(reservation.status) || reservation.returnDate) {
      throw new InvalidReservationStatusError(
        this.logger,
        operation,
        reservation.status,
      );
    }

    return reservation;
  }

  private async manageLateFees(reservation: Reservation): Promise<void> {
    if (reservation.lateFees) {
      await this.walletService.decrementBalance(
        reservation.userId,
        reservation.lateFees,
      );
    }
  }

  async get(filters: Partial<Reservation>): Promise<Reservation[]> {
    this.logger.log(
      `Getting reservations by filters ${JSON.stringify(filters)}`,
    );
    const result = await this.dao.get(filters);

    this.logger.log(`Got ${result.length} reservations`);
    return result;
  }

  async getPaginated(
    filters: Partial<Reservation>,
    { page, pageSize }: PaginationOptions,
  ): Promise<PaginationResult<Reservation>> {
    const result = await this.dao.get(filters, {
      limit: pageSize,
      offset: (page - 1) * pageSize,
    });

    return { ...result, page, pageSize };
  }

  async getById(id: string): Promise<Reservation> {
    const reservation = await this.dao.getById(id);
    if (!reservation) {
      throw new ReservationNotFoundError(this.logger, id);
    }

    return reservation;
  }

  async createReservation(
    userId: string,
    bookId: string,
    returnDate: Date,
  ): Promise<Reservation> {
    this.logger.log(
      `Creating reservation for book ${bookId} and user ${userId}`,
    );

    await this.validateReservation(userId, bookId);

    this.validateReturnDate(returnDate);

    return await this.transactionService.startTransaction(
      async (): Promise<Reservation> => {
        await this.bookInvService.addReservation(bookId);

        const result = await this.dao.create({
          userId,
          bookId,
          price: this.reservationPrice,
          reservationDate: new Date(),
          expectedReturnDate: returnDate,
        });

        await this.walletService.addReservation(userId, result._id);

        this.logger.log('Reservation was successfully created');

        return result;
      },
    );
  }

  async payReservation(
    reservationId: string,
    userId: string,
  ): Promise<Reservation> {
    const reservation = await this.validateReservationStatus(
      reservationId,
      userId,
      [ReservationStatus.pending],
      'pay',
    );

    return await this.transactionService.startTransaction(
      async (): Promise<Reservation> => {
        await this.walletService.decrementBalance(
          reservation.userId,
          reservation.price,
        );

        return await this.updateReservation(
          reservationId,
          {
            status: ReservationStatus.reserved,
          },
          reservation.version,
        );
      },
    );
  }

  async cancelReservation(
    reservationId: string,
    userId: string,
  ): Promise<Reservation> {
    this.logger.log(`Canceling reservation ${reservationId}`);
    const reservation = await this.validateReservationStatus(
      reservationId,
      userId,
      [ReservationStatus.pending],
      'cancel',
    );

    return await this.transactionService.startTransaction(async () => {
      const result = await this.updateReservation(
        reservationId,
        { status: ReservationStatus.canceled },
        reservation.version,
      );

      await this.walletService.removeReservation(
        reservation.userId,
        reservationId,
      );

      await this.bookInvService.releaseReservation(reservation.bookId);

      this.logger.log(`Canceled reservation ${reservationId}`);
      return result;
    });
  }

  async endReservation(
    reservationId: string,
    userId: string,
  ): Promise<Reservation> {
    const reservation = await this.validateReservationStatus(
      reservationId,
      userId,
      [
        ReservationStatus.reserved,
        ReservationStatus.late,
        ReservationStatus.bought,
      ],
      'end',
    );

    return await this.transactionService.startTransaction(async () => {
      const status =
        reservation.status === ReservationStatus.bought
          ? reservation.status
          : ReservationStatus.returned;

      const result = await this.updateReservation(
        reservationId,
        {
          status,
          returnDate: new Date(),
        },
        reservation.version,
      );

      await this.manageLateFees(reservation);

      await this.bookInvService.releaseReservation(reservation.bookId);

      await this.walletService.removeReservation(userId, reservationId);

      return result;
    });
  }
}
