import { Test, TestingModule } from '@nestjs/testing';
import { createMock } from '@golevelup/ts-jest';
import { ITransactionService } from '@shared/services/transaction';
import { Types } from 'mongoose';
import { VersionChangedError } from '@shared/errors';
import { UnauthorizedException } from '@nestjs/common';
import { IReservationDao } from '../../../data-access/persistence/dao/reservation-dao/reservation-dao.interface';
import { Reservation, ReservationStatus } from '../../../common/entities';
import { IBookInventoryService } from '../book-inventory';
import { IWalletService } from '../wallet';
import {
  AlreadyReservedError,
  InvalidReservationStatusError,
  InvalidReturnDateError,
  ReservationNotFoundError,
} from '../../../common/errors';
import { IReservationService } from './reservation-service.interface';
import { ReservationService } from './reservation.service';

describe('ReservationService', () => {
  let service: IReservationService;
  let dao: IReservationDao;
  let walletService: IWalletService;

  const _id = new Types.ObjectId().toString();
  const userId = new Types.ObjectId().toString();
  const bookId = '1234sa';
  const createdAt = new Date();
  const updatedAt = new Date();
  const expectedReturnDate = new Date();
  expectedReturnDate.setUTCDate(new Date().getUTCDate() + 20);
  const price = 3;
  const status = ReservationStatus.pending;

  const reservationResult: Reservation = {
    _id,
    userId,
    bookId,
    createdAt,
    updatedAt,
    status,
    price,
    expectedReturnDate,
    reservationDate: createdAt,
    version: 0,
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        { provide: IReservationService, useClass: ReservationService },
        {
          provide: IReservationDao,
          useValue: createMock(),
        },
        {
          provide: IBookInventoryService,
          useValue: createMock(),
        },
        { provide: IWalletService, useValue: createMock() },
        { provide: 'LoggerService', useValue: createMock() },
        {
          provide: ITransactionService,
          useValue: createMock<ITransactionService<unknown>>({
            startTransaction<T>(executor: () => Promise<T>): Promise<T> {
              return executor.apply(void 0);
            },
          }),
        },
      ],
    }).compile();

    service = module.get<IReservationService>(IReservationService);
    dao = module.get<IReservationDao>(IReservationDao);
    walletService = module.get<IWalletService>(IWalletService);

    jest.spyOn(dao, 'getById').mockImplementationOnce(async (id) => {
      if (id === _id) {
        return reservationResult;
      }
      return null;
    });
  });

  describe('Get reservation by id tests', () => {
    it('should get reservation', async () => {
      expect(await service.getById(_id)).toEqual(reservationResult);
    });

    it('should throw an error if not found', async () => {
      await expect(service.getById('123543')).rejects.toThrow(
        ReservationNotFoundError,
      );
    });
  });

  describe('Get reservations tests', () => {
    it('should return reservations', async () => {
      jest.spyOn(dao, 'get').mockResolvedValueOnce([reservationResult]);

      const result = await service.get({});
      expect(result).toHaveLength(1);
      expect(result[0]).toEqual(reservationResult);
    });
  });

  describe('Get paginated tests', () => {
    it('should return paginated reservations', async () => {
      jest.spyOn(dao, 'get').mockResolvedValueOnce({
        data: [reservationResult],
        totalCount: 1,
      } as unknown as Reservation[]);

      const result = await service.getPaginated({}, { page: 1, pageSize: 10 });
      expect(result).toEqual({
        data: [reservationResult],
        totalCount: 1,
        page: 1,
        pageSize: 10,
      });
    });
  });

  describe('Create reservation tests', () => {
    const getMock =
      (returnDate: boolean) =>
      async (reservation: Partial<Reservation>): Promise<Reservation[]> => {
        const { userId: usrId, bookId: bokId } = reservation;
        if (usrId === userId && bokId === bookId && returnDate) {
          return [reservationResult];
        }
        return [];
      };
    beforeEach(() => {
      jest.spyOn(dao, 'create').mockImplementationOnce(async (reservation) => {
        return new Reservation({
          _id,
          createdAt,
          updatedAt,
          status,
          price,
          version: 0,
          ...reservation,
          reservationDate: createdAt,
        });
      });
    });

    it('should return created reservation', async () => {
      jest.spyOn(dao, 'get').mockImplementationOnce(getMock(false));
      const result = await service.createReservation(
        userId,
        bookId,
        expectedReturnDate,
      );

      expect(result).toEqual(reservationResult);
    });

    it('should throw an error if return date is invalid', async () => {
      jest.spyOn(dao, 'get').mockImplementationOnce(getMock(false));
      const returnDate = new Date();
      returnDate.setUTCFullYear(new Date().getUTCFullYear() + 1);
      await expect(
        service.createReservation(userId, bookId, returnDate),
      ).rejects.toThrow(InvalidReturnDateError);
    });

    it('should throw an error if user has an active reservation for book', async () => {
      jest.spyOn(dao, 'get').mockImplementationOnce(getMock(true));
      await expect(
        service.createReservation(userId, bookId, new Date()),
      ).rejects.toThrow(AlreadyReservedError);
    });
  });

  describe('Pay reservation tests', () => {
    const updateMock =
      (v: number) =>
      async (
        id: string,
        reservation?: Partial<Reservation>,
        version?: number,
      ) => {
        if (id === _id && (version === undefined || version === v)) {
          return { ...reservationResult, ...reservation };
        }
        return null;
      };

    it('should return updated reservation', async () => {
      jest.spyOn(dao, 'update').mockImplementationOnce(updateMock(0));

      expect(await service.payReservation(_id, userId)).toEqual({
        ...reservationResult,
        status: ReservationStatus.reserved,
      });
    });

    it('should throw an error if reservation does not belong to user', async () => {
      await expect(service.payReservation(_id, '1234')).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('should throw an error if there is a version mismatch', async () => {
      jest.spyOn(dao, 'update').mockImplementationOnce(updateMock(1));

      await expect(service.payReservation(_id, userId)).rejects.toThrow(
        VersionChangedError,
      );
    });
  });

  const updateStatusMock = async (
    id: string,
    { status, returnDate }: Partial<Reservation>,
  ) => {
    if (id === _id) {
      return { ...reservationResult, status: status, returnDate };
    }
  };

  describe('Cancel reservation tests', () => {
    beforeEach(() => {
      jest.spyOn(dao, 'update').mockImplementationOnce(updateStatusMock);
    });

    it('should cancel reservation', async () => {
      expect(await service.cancelReservation(_id, userId)).toEqual({
        ...reservationResult,
        status: ReservationStatus.canceled,
      });
    });

    it('should throw an error if reservation does not belong to user', async () => {
      await expect(service.cancelReservation(_id, '1234')).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('should throw error if reservation is in invalid state', async () => {
      reservationResult.status = ReservationStatus.reserved;

      await expect(service.cancelReservation(_id, userId)).rejects.toThrow(
        InvalidReservationStatusError,
      );

      reservationResult.status = ReservationStatus.pending;
    });
  });

  describe('End reservation tests', () => {
    beforeEach(() => {
      jest.spyOn(dao, 'update').mockImplementationOnce(updateStatusMock);
    });

    afterEach(() => {
      reservationResult.status = ReservationStatus.pending;
      reservationResult.returnDate = undefined;
    });

    it('should end reservation', async () => {
      reservationResult.status = ReservationStatus.reserved;

      const result = await service.endReservation(_id, userId);

      expect(result.status).toBe(ReservationStatus.returned);
      expect(result.returnDate).toBeTruthy();
    });

    it('should charge late fees', async () => {
      reservationResult.status = ReservationStatus.late;
      reservationResult.lateFees = 1.2;

      const result = await service.endReservation(_id, userId);
      expect(result.status).toBe(ReservationStatus.returned);
      expect(result.returnDate).toBeTruthy();
      expect(walletService.decrementBalance).toHaveBeenCalled();
    });

    it('should not change status if it is already bought', async () => {
      reservationResult.status = ReservationStatus.bought;

      const result = await service.endReservation(_id, userId);
      expect(result.status).toBe(ReservationStatus.bought);
      expect(result.returnDate).toBeTruthy();
    });

    it('should throw error if reservation is invalid status', async () => {
      reservationResult.status = ReservationStatus.pending;

      await expect(service.endReservation(_id, userId)).rejects.toThrow(
        InvalidReservationStatusError,
      );
    });

    it('should throw an error if reservation does not belong to user', async () => {
      await expect(service.endReservation(_id, '1234')).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('should throw error if reservation is already returned', async () => {
      reservationResult.status = ReservationStatus.bought;
      reservationResult.returnDate = new Date();

      await expect(service.endReservation(_id, userId)).rejects.toThrow(
        InvalidReservationStatusError,
      );
    });
  });
});
