import { Test, TestingModule } from '@nestjs/testing';
import { createMock } from '@golevelup/ts-jest';
import { ITransactionService } from '@shared/services/transaction';
import { IBookService } from '@book/domain/services/book';
import { IUserService } from '@user/domain/services/user';
import { User } from '@user/common/entities';
import { Book } from '@book/common/entities';
import { IReservationDao } from '../../../data-access/persistence/dao/reservation-dao/reservation-dao.interface';
import { IBookInventoryService } from '../book-inventory';
import { IEmailService } from '../../../../notification/domain/services/email';
import { Reservation, ReservationStatus } from '../../../common/entities';
import { IBatchService } from './batch-service.interface';
import { BatchService } from './batch.service';

describe('BatchService', () => {
  let service: IBatchService;
  let dao: IReservationDao;
  let bookService: IBookService;
  let userService: IUserService;
  let bookInvService: IBookInventoryService;
  let emailService: IEmailService;

  const userId = '121324';
  const bookId = '1234sa';

  let reservation: Reservation = {
    _id: '13232',
    bookId,
    status: ReservationStatus.late,
    lateFees: 0,
    userId,
    expectedReturnDate: new Date(),
    reservationDate: new Date(),
    version: 0,
    price: 3,
  };

  const originalReservation = { ...reservation };

  const generateDayDate = (days: number) => {
    const date = new Date();
    date.setUTCHours(0);
    date.setUTCMinutes(0);
    date.setUTCSeconds(0);
    date.setUTCMilliseconds(0);
    date.setUTCDate(date.getUTCDate() + days);

    return date;
  };

  const user: Partial<User> = {
    _id: userId,
    email: 'email@email.com',
  };

  const book: Partial<Book> = {
    _id: bookId,
    price: 27,
    title: 'title',
    author: 'author',
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        { provide: IBatchService, useClass: BatchService },
        { provide: 'LoggerService', useValue: createMock() },
        {
          provide: ITransactionService,
          useValue: createMock<ITransactionService<unknown>>({
            startTransaction<T>(executor: () => Promise<T>): Promise<T> {
              return executor.apply(void 0);
            },
          }),
        },
        { provide: IReservationDao, useValue: createMock() },
        { provide: IBookInventoryService, useValue: createMock() },
        { provide: IBookService, useValue: createMock() },
        { provide: IUserService, useValue: createMock() },
        { provide: IEmailService, useValue: createMock() },
      ],
    }).compile();

    service = module.get<IBatchService>(IBatchService);
    dao = module.get<IReservationDao>(IReservationDao);
    userService = module.get<IUserService>(IUserService);
    bookService = module.get<IBookService>(IBookService);
    bookInvService = module.get<IBookInventoryService>(IBookInventoryService);
    emailService = module.get<IEmailService>(IEmailService);

    jest
      .spyOn(bookService, 'getByIds')
      .mockImplementationOnce(async (ids: string[]) => {
        if (ids[0] === book._id) {
          return [book as Book];
        }
        return [];
      });

    jest
      .spyOn(userService, 'getByIds')
      .mockImplementationOnce(async (ids: string[]) => {
        if (ids[0] === user._id) {
          return [user as User];
        }
        return [];
      });

    jest
      .spyOn(dao, 'getByExpectedReturnDate')
      .mockImplementationOnce(async (date, status) => {
        if (
          reservation.status === status &&
          reservation.expectedReturnDate.valueOf() === date.valueOf()
        ) {
          return [reservation];
        }
        return [];
      });
  });

  afterEach(() => {
    reservation = originalReservation;
  });

  describe('handleLateFeesTests', () => {
    beforeEach(async () => {
      jest.spyOn(dao, 'getLate').mockImplementationOnce(async () => {
        if (new Date() > reservation.expectedReturnDate) {
          return [reservation];
        }
        return [];
      });
      jest
        .spyOn(dao, 'update')
        .mockImplementationOnce(async (id, update, version) => {
          if (id === reservation._id && version === 0) {
            reservation.lateFees += update.lateFees;
            reservation.status = update.status;
            return reservation;
          }
        });
    });

    it('should update late fees for late book', async () => {
      reservation.status = ReservationStatus.reserved;
      reservation.returnDate = null;
      await service.handleLateReservations();

      expect(reservation.lateFees).toBe(originalReservation.lateFees + 0.2);
      expect(reservation.status).toBe(ReservationStatus.late);
      expect(bookService.getByIds).toHaveBeenCalled();
      expect(bookInvService.decrementInventory).not.toHaveBeenCalled();
    });

    it('should update late fees for reservation and change status to bought because it has reached book price', async () => {
      reservation.status = ReservationStatus.late;
      reservation.returnDate = null;
      reservation.lateFees = book.price - 0.1;
      reservation.expectedReturnDate = generateDayDate(-5);
      const expectedFees = reservation.lateFees + 0.2;

      await service.handleLateReservations();

      expect(reservation.status).toBe(ReservationStatus.bought);
      expect(reservation.lateFees).toBe(expectedFees);
      expect(bookService.getByIds).toHaveBeenCalled();
      expect(bookInvService.decrementInventory).toHaveBeenCalled();
    });

    it('should continue to add late feees but not decrementing inventory', async () => {
      reservation.status = ReservationStatus.bought;
      reservation.returnDate = null;
      reservation.lateFees = book.price + 1;
      const expectedFees = reservation.lateFees + 0.2;

      await service.handleLateReservations();

      expect(reservation.status).toBe(ReservationStatus.bought);
      expect(reservation.lateFees).toBe(expectedFees);
      expect(bookService.getByIds).toHaveBeenCalled();
      expect(bookInvService.decrementInventory).not.toHaveBeenCalled();
    });

    it('should not update anything because there is nothing late', async () => {
      reservation.status = ReservationStatus.reserved;
      const date = new Date();
      date.setUTCDate(date.getUTCDate() + 5);
      reservation.expectedReturnDate = date;

      await service.handleLateReservations();
      expect(reservation.status).toBe(ReservationStatus.reserved);
      expect(reservation.lateFees).toBe(originalReservation.lateFees);
      expect(bookService.getByIds).not.toHaveBeenCalled();
      expect(bookInvService.decrementInventory).not.toHaveBeenCalled();
    });

    it('should not update because of version error', async () => {
      console.info(reservation);
      reservation.status = ReservationStatus.reserved;
      reservation.returnDate = null;
      reservation.version = 3;
      reservation.lateFees = 0;
      reservation.expectedReturnDate = generateDayDate(-5);

      await service.handleLateReservations();

      expect(reservation.status).toBe(ReservationStatus.reserved);
      expect(reservation.lateFees).toBe(originalReservation.lateFees);
      expect(bookService.getByIds).toHaveBeenCalled();
      expect(bookInvService.decrementInventory).not.toHaveBeenCalled();
    });
  });

  describe('handle close to return tests', () => {
    it('should get reservations and send email', async () => {
      reservation.status = ReservationStatus.reserved;
      reservation.expectedReturnDate = generateDayDate(2);

      await service.handleCloseToReturn();
      expect(bookService.getByIds).toHaveBeenCalled();
      expect(userService.getByIds).toHaveBeenCalled();
      expect(emailService.sendEmail).toHaveBeenCalled();
    });

    it('should not do anything because there are no values', async () => {
      reservation.status = ReservationStatus.reserved;
      reservation.expectedReturnDate = generateDayDate(8);

      await service.handleCloseToReturn();
      expect(bookService.getByIds).not.toHaveBeenCalled();
      expect(userService.getByIds).not.toHaveBeenCalled();
      expect(emailService.sendEmail).not.toHaveBeenCalled();
    });
  });

  describe('handle 7 days late tests', () => {
    it('should get reservations and send email', async () => {
      reservation.status = ReservationStatus.late;
      reservation.expectedReturnDate = generateDayDate(-7);

      await service.handle7DaysLate();
      expect(bookService.getByIds).toHaveBeenCalled();
      expect(userService.getByIds).toHaveBeenCalled();
      expect(emailService.sendEmail).toHaveBeenCalled();
    });

    it('should not do anything because there are no values', async () => {
      reservation.status = ReservationStatus.reserved;
      reservation.expectedReturnDate = generateDayDate(-3);

      await service.handleCloseToReturn();
      expect(bookService.getByIds).not.toHaveBeenCalled();
      expect(userService.getByIds).not.toHaveBeenCalled();
      expect(emailService.sendEmail).not.toHaveBeenCalled();
    });
  });
});
