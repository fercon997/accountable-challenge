import { Test, TestingModule } from '@nestjs/testing';
import { FilterQuery, Model, Query, Types } from 'mongoose';
import { getModelToken } from '@nestjs/mongoose';
import { createMock } from '@golevelup/ts-jest';
import { PersistenceError } from '@shared/errors';
import { ITransactionService } from '@shared/services/transaction';
import {
  Reservation,
  ReservationDocument,
  ReservationStatus,
} from '../../../../common/entities';
import { IReservationDao } from './reservation-dao.interface';
import { ReservationDaoService } from './reservation-dao.service';

describe('ReservationDaoService', () => {
  let service: IReservationDao;
  let reservModel: Model<Reservation>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        {
          provide: IReservationDao,
          useClass: ReservationDaoService,
        },
        { provide: getModelToken(Reservation.name), useValue: createMock() },
        { provide: 'LoggerService', useValue: createMock() },
        { provide: ITransactionService, useValue: createMock() },
      ],
    }).compile();

    service = module.get<IReservationDao>(IReservationDao);
    reservModel = module.get<Model<Reservation>>(
      getModelToken(Reservation.name),
    );
  });
  const userId = new Types.ObjectId();
  const bookId = '1234sa';
  const _id = new Types.ObjectId();
  const createdAt = new Date();
  const updatedAt = new Date();

  const reservation: Reservation = {
    userId: userId.toString(),
    bookId: bookId.toString(),
    price: 3,
    expectedReturnDate: new Date(),
    reservationDate: new Date(),
  };

  const reservationRes: Reservation = {
    ...reservation,
    _id: _id.toString(),
    status: ReservationStatus.pending,
    createdAt,
    updatedAt,
    version: 0,
  };

  const parseDocument = (
    reservation: Reservation,
    id?: string,
  ): ReservationDocument => {
    const res = {
      status: ReservationStatus.pending,
      ...reservation,
      _id: id || _id,
      userId,
      bookId,
      createdAt: createdAt.toISOString(),
      updatedAt: updatedAt.toISOString(),
      version: 0,
    };
    return {
      ...res,
      toJSON: () => res,
      price: new Types.Decimal128(reservation.price.toString()),
    } as unknown as ReservationDocument;
  };

  describe('Create reservation tests', () => {
    const createMock = (document: Reservation[]): Query<any, any> => {
      return [parseDocument(document[0])] as unknown as Query<any, any>;
    };

    it('should create reservation', async () => {
      jest.spyOn(reservModel, 'create').mockImplementationOnce(createMock);

      const result = await service.create(reservation);

      expect(result).toEqual(reservationRes);
      expect(result).toBeInstanceOf(Reservation);
    });

    it('should throw an error if something goes wrong', async () => {
      jest.spyOn(reservModel, 'create').mockImplementationOnce(() => {
        throw new Error('could not create');
      });

      await expect(service.create(reservation)).rejects.toThrow(
        PersistenceError,
      );
    });
  });

  describe('Get reservation by id tests', () => {
    const getMock = (id: string): Query<any, any> => {
      if (id === _id.toString()) {
        return parseDocument(reservation) as unknown as Query<any, any>;
      }
    };

    it('should return reservation by id', async () => {
      jest.spyOn(reservModel, 'findById').mockImplementationOnce(getMock);

      const result = await service.getById(_id.toString());

      expect(result).toEqual(reservationRes);
      expect(result).toBeInstanceOf(Reservation);
    });

    it('should return null if not found', async () => {
      jest.spyOn(reservModel, 'findById').mockImplementationOnce(getMock);

      expect(await service.getById('1234sa')).toBeNull();
    });

    it('should throw an error if something goes wrong', async () => {
      jest.spyOn(reservModel, 'findById').mockImplementationOnce(() => {
        throw new Error('could not get');
      });

      await expect(service.getById(_id.toString())).rejects.toThrow(
        PersistenceError,
      );
    });
  });

  describe('Get reservation tests', () => {
    const getMock = (params?: FilterQuery<Reservation>): Query<any, any> => {
      const { userId: usrId, bookId: bokId } = params;
      const $exists = params?.returnDate?.$exists;
      const documents = [parseDocument(reservation)] as unknown as Query<
        any,
        any
      >;
      const existsCondition =
        $exists === false ? !documents[0].returnDate : true;
      if (
        usrId &&
        bokId &&
        usrId === userId.toString() &&
        bokId === bookId &&
        existsCondition
      ) {
        return documents;
      }

      if (usrId && usrId === userId.toString() && existsCondition) {
        return documents;
      }

      if (bokId && bokId === bookId && existsCondition) {
        return documents;
      }

      if ($exists === false) {
        return documents;
      }

      return [] as unknown as Query<any, any>;
    };

    const testLogic = async (
      userId?: string,
      bookId?: string,
      returnDate?: Date,
    ) => {
      jest.spyOn(reservModel, 'find').mockImplementationOnce(getMock);

      const result = await service.get({ userId, bookId, returnDate });
      expect(result).toHaveLength(1);
      expect(result[0]).toEqual(reservationRes);
      expect(result[0]).toBeInstanceOf(Reservation);
    };

    it('should return an array of documents if found by the two conditions', async () => {
      await testLogic(userId.toString(), bookId);
    });

    it('should return an array of documents if found by userId', async () => {
      await testLogic(userId.toString());
    });

    it('should return an array of documents if found by the two conditions', async () => {
      await testLogic(undefined, bookId);
    });

    it('should return an array if found by null condition', async () => {
      await testLogic(undefined, undefined, null);
    });

    it('should return an empty array if none found', async () => {
      jest.spyOn(reservModel, 'find').mockImplementationOnce(getMock);

      expect(await service.get({ userId: '123asda' })).toHaveLength(0);
    });

    it('should throw an error if something goes wrong', async () => {
      jest.spyOn(reservModel, 'find').mockImplementationOnce(() => {
        throw new Error('could not find');
      });

      await expect(service.get({ userId: '123asda' })).rejects.toThrow(
        PersistenceError,
      );
    });
  });

  describe('Get with pagination tests', () => {
    const getMock = (reservations: Reservation[]) => () => {
      return {
        size: reservations.length,
        offset: 0,
        limit(limit: number) {
          this.size = limit;
          return this;
        },
        skip(offset: number) {
          this.offset = offset;
          return this;
        },
        countDocuments() {
          return reservations.length;
        },
        exec() {
          const result = [];
          for (
            let i = this.offset, count = 0;
            i < reservations.length;
            i++, count++
          ) {
            if (count === this.size) {
              break;
            }
            result.push(parseDocument(reservations[i], reservations[i]._id));
          }
          return result;
        },
      } as unknown as Query<any, any>;
    };

    it('should return an array of reservations with pagination', async () => {
      const id = new Types.ObjectId().toString();
      jest
        .spyOn(reservModel, 'find')
        .mockImplementation(
          getMock([reservationRes, { ...reservationRes, _id: id }]),
        );

      const result = await service.get({}, { limit: 1, offset: 1 });
      expect(result.totalCount).toBe(2);
      expect(result.data).toHaveLength(1);
      expect(result.data[0]._id).toBe(id);
    });

    it('should return none if not found', async () => {
      jest.spyOn(reservModel, 'find').mockImplementation(getMock([]));
      const result = await service.get({}, { limit: 10, offset: 0 });
      expect(result.totalCount).toBe(0);
      expect(result.data).toHaveLength(0);
    });
  });

  describe('Update reservation tests', () => {
    const updateMock = ({ _id: id, version }, update: Partial<Reservation>) => {
      if (id === _id.toString() && (!version || version === 0)) {
        return parseDocument({ ...reservation, ...update }) as unknown as Query<
          any,
          any
        >;
      }
    };

    it('should return updated document', async () => {
      jest
        .spyOn(reservModel, 'findOneAndUpdate')
        .mockImplementationOnce(updateMock);

      const toUpdate: Partial<Reservation> = {
        status: ReservationStatus.reserved,
        reservationDate: new Date(),
      };

      const result = await service.update(_id.toString(), toUpdate);
      expect(result).toEqual({ ...reservationRes, ...toUpdate });
      expect(result).toBeInstanceOf(Reservation);
    });

    it('should return null if not found', async () => {
      jest
        .spyOn(reservModel, 'findOneAndUpdate')
        .mockImplementationOnce(updateMock);

      expect(await service.update('12345sa', {})).toBeNull();
    });

    it('should return null if version not found', async () => {
      jest
        .spyOn(reservModel, 'findOneAndUpdate')
        .mockImplementationOnce(updateMock);

      expect(await service.update(_id.toString(), { price: 24 }, 2)).toBeNull();
    });

    it('should throw an error if something goes wrong', async () => {
      jest.spyOn(reservModel, 'findOneAndUpdate').mockImplementationOnce(() => {
        throw new Error('could not update');
      });

      await expect(service.update(_id.toString(), {})).rejects.toThrow(
        PersistenceError,
      );
    });
  });
});
