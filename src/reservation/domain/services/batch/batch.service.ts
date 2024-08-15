import { Inject, Injectable, LoggerService } from '@nestjs/common';
import { IBookService } from '@book/domain/services/book';
import { IUserService } from '@user/domain/services/user';
import { Book } from '@book/common/entities';
import { User } from '@user/common/entities';
import { Entity } from '@shared/entity';
import { ITransactionService } from '@shared/services/transaction';
import { VersionChangedError } from '@shared/errors';
import { IEmailService } from '../../../../notification/domain/services/email';
import { Reservation, ReservationStatus } from '../../../common/entities';
import { IBookInventoryService } from '../book-inventory';
import { IReservationDao } from '../../../data-access/persistence/dao/reservation-dao/reservation-dao.interface';
import { IBatchService } from './batch-service.interface';

@Injectable()
export class BatchService implements IBatchService {
  constructor(
    @Inject(IReservationDao) private dao: IReservationDao,
    @Inject('LoggerService') private logger: LoggerService,
    @Inject(IBookInventoryService)
    private bookInvService: IBookInventoryService,
    @Inject(IBookService) private bookService: IBookService,
    @Inject(IUserService) private userService: IUserService,
    @Inject(IEmailService) private emailService: IEmailService,
    @Inject(ITransactionService)
    private transactionService: ITransactionService<unknown>,
  ) {}

  private generateDate(numberOfDays: number): Date {
    const date = new Date();
    date.setUTCHours(0);
    date.setUTCMinutes(0);
    date.setUTCSeconds(0);
    date.setUTCMilliseconds(0);
    date.setUTCDate(date.getUTCDate() + numberOfDays);

    return date;
  }

  private generateMap<T extends Entity>(entities: T[]): Map<string, T> {
    const map: Map<string, Entity> = new Map();

    entities.forEach((entity) => {
      map.set(entity._id, entity);
    });

    return map as Map<string, T>;
  }

  private async prepForEmail(
    numberOfDays: number,
    status: ReservationStatus,
  ): Promise<{
    reservations: Reservation[];
    userMap: Map<string, User>;
    bookMap: Map<string, Book>;
  }> {
    const date = this.generateDate(numberOfDays);
    this.logger.log(
      `Getting reservations that are due in ${date.toDateString()}`,
    );
    const reservations = await this.dao.getByExpectedReturnDate(date, status);
    this.logger.log(`Got ${reservations.length} reservations`);

    const idsMap = { userIds: [], bookIds: [] };

    reservations.forEach((reservation) => {
      idsMap.userIds.push(reservation.userId);
      idsMap.bookIds.push(reservation.bookId);
    });

    const users = idsMap.userIds.length
      ? await this.userService.getByIds(idsMap.userIds)
      : [];
    const books = idsMap.bookIds.length
      ? await this.bookService.getByIds(idsMap.bookIds)
      : [];

    const userMap = this.generateMap(users);
    const bookMap = this.generateMap(books);

    this.logger.log(`Sending emails to ${users.length} users`);
    return {
      reservations,
      bookMap,
      userMap,
    };
  }

  private async updateForLate(
    reservation: Reservation,
    fees: number,
    status: ReservationStatus,
  ): Promise<void> {
    this.logger.log(`Updating reservation with ${fees} of late fees`);
    const result = await this.dao.update(
      reservation._id,
      {
        status,
        lateFees: fees,
      },
      reservation.version,
    );
    if (!result) {
      throw new VersionChangedError(this.logger, Reservation.name);
    }
    this.logger.log('Updated reservation');
  }

  async handleLateReservations(): Promise<void> {
    this.logger.log('Getting late reservations to charge late fees');
    const reservations = await this.dao.getLate();

    this.logger.log(`Got ${reservations.length} reservations`);

    const bookIds = reservations.map((reservation) => reservation.bookId);

    this.logger.log(`Getting ${bookIds.length} books data for reservations`);
    const books = bookIds.length
      ? await this.bookService.getByIds(bookIds)
      : [];
    this.logger.log(`Got books`);

    const bookMap = this.generateMap(books);

    let updateInventory = false;

    for (const reservation of reservations) {
      const book = bookMap.get(reservation.bookId);
      const fee = 0.2;
      let status = ReservationStatus.late;
      if (reservation.lateFees + fee >= book.price) {
        status = ReservationStatus.bought;
        updateInventory = reservation.status !== ReservationStatus.bought;
      }
      try {
        if (updateInventory) {
          await this.transactionService.startTransaction(async () => {
            await this.bookInvService.decrementInventory(reservation.bookId);
            await this.updateForLate(reservation, fee, status);
          });
          return;
        }

        await this.updateForLate(reservation, fee, status);
      } catch (e) {
        this.logger.error(
          `Couldnt update late fees for reservation ${reservation._id} because of ${(e as VersionChangedError).getResponse()}`,
        );
      }
    }
  }

  async handleCloseToReturn(): Promise<void> {
    const { reservations, userMap, bookMap } = await this.prepForEmail(
      2,
      ReservationStatus.reserved,
    );
    reservations.forEach((reservation) => {
      const user = userMap.get(reservation.userId);
      const book = bookMap.get(reservation.bookId);
      this.emailService.sendEmail({
        email: user.email,
        title: `It's almost time to return your book`,
        body: `The book you borrowed called ${book.title} by ${book.author} is due to be returned on ${reservation.expectedReturnDate.toDateString()}`,
      });
    });
  }

  async handle7DaysLate(): Promise<void> {
    const { reservations, userMap, bookMap } = await this.prepForEmail(
      -7,
      ReservationStatus.late,
    );

    reservations.forEach((reservation) => {
      const user = userMap.get(reservation.userId);
      const book = bookMap.get(reservation.bookId);
      this.emailService.sendEmail({
        email: user.email,
        title: `You haven't returned your book yet`,
        body: `You should have returned the book you borrowed called ${book.title} by ${book.author} by ${reservation.expectedReturnDate.toDateString()}.
        You have already accumulated ${reservation.lateFees} in late fees return it as soon as possible to avoid incrementing your debt`,
      });
    });
  }
}
