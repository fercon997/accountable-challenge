import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { createMock } from '@golevelup/ts-jest';
import { FilterQuery, Model, Query, Types, UpdateQuery } from 'mongoose';
import { PersistenceError } from '@shared/errors';
import { ITransactionService } from '@shared/services/transaction';
import {
  BookInventory,
  BookInventoryDocument,
} from '../../../../common/entities';
import { IBookInventoryDao } from './book-inventory-dao.interface';
import { BookInventoryDaoService } from './book-inventory-dao.service';

describe('BookInventoryDaoService', () => {
  let service: IBookInventoryDao;
  let bookInvModel: Model<BookInventory>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        { provide: IBookInventoryDao, useClass: BookInventoryDaoService },
        {
          provide: getModelToken(BookInventory.name),
          useValue: createMock<Model<BookInventory>>(),
        },
        { provide: 'LoggerService', useValue: createMock() },
        { provide: ITransactionService, useValue: createMock() },
      ],
    }).compile();

    service = module.get<IBookInventoryDao>(IBookInventoryDao);
    bookInvModel = module.get<Model<BookInventory>>(
      getModelToken(BookInventory.name),
    );
  });

  const _id = new Types.ObjectId();
  const bookId = '12344xs';
  const quantity = 4;
  const createdAt = new Date();
  const updatedAt = new Date();

  const bookInv: BookInventory = {
    _id: _id.toString(),
    bookId,
    totalInventory: quantity,
    totalReserved: 0,
    createdAt,
    updatedAt,
    version: 0,
  };

  const bookInvDoc: BookInventoryDocument = {
    ...bookInv,
    _id,
  } as unknown as BookInventoryDocument;

  describe('Create bookInventory', () => {
    it('should create bookInventory document', async () => {
      jest.spyOn(bookInvModel, 'findOneAndUpdate').mockResolvedValueOnce(null);
      jest
        .spyOn(bookInvModel, 'create')
        .mockImplementationOnce((document: BookInventory) => {
          return {
            _id,
            bookId: document.bookId,
            totalInventory: document.totalInventory,
            totalReserved: 0,
            createdAt: createdAt.toISOString(),
            updatedAt: updatedAt.toISOString(),
            version: 0,
          } as unknown as Query<any, any>;
        });

      const res = await service.create(bookId, quantity);

      expect(res).toBeInstanceOf(BookInventory);
      expect(res).toEqual(bookInv);
    });

    it('should return updated document if it already existed', async () => {
      const quantity = 8;
      jest
        .spyOn(bookInvModel, 'findOneAndUpdate')
        .mockImplementationOnce(({ bookId: id }, { totalInventory }) => {
          if (id === bookId) {
            return {
              ...bookInvDoc,
              totalInventory,
            } as unknown as Query<any, any>;
          }
        });

      const res = await service.create(bookId, quantity);

      expect(res).toBeInstanceOf(BookInventory);
      expect(res).toEqual({ ...bookInv, totalInventory: quantity });
      expect(bookInvModel.create).not.toHaveBeenCalled();
    });

    it('should throw an error when something goes wrong', async () => {
      jest.spyOn(bookInvModel, 'findOneAndUpdate').mockResolvedValueOnce(null);
      jest.spyOn(bookInvModel, 'create').mockImplementationOnce(() => {
        throw new Error();
      });

      await expect(service.create('a123432', 4)).rejects.toThrow(
        PersistenceError,
      );
    });
  });

  describe('Get book inventory tests', () => {
    const findMock = ({ bookId: id }: FilterQuery<BookInventory>) => {
      if (id === bookId) {
        return bookInvDoc as unknown as Query<any, any>;
      }
    };

    it('should get record and return it', async () => {
      jest.spyOn(bookInvModel, 'findOne').mockImplementationOnce(findMock);

      const result = await service.get(bookInv.bookId);
      expect(result).toEqual(bookInv);
      expect(result).toBeInstanceOf(BookInventory);
    });

    it('should return null when it is not found', async () => {
      jest.spyOn(bookInvModel, 'findOne').mockImplementationOnce(findMock);

      expect(await service.get('123qweac')).toBe(null);
    });

    it('should throw a persistence error if something fails', async () => {
      jest.spyOn(bookInvModel, 'findOne').mockImplementationOnce(() => {
        throw new Error('could not find');
      });

      await expect(service.get('12asd')).rejects.toThrow(PersistenceError);
    });
  });

  describe('Update book inventory tests', () => {
    const updateMock = (
      { bookId: id }: FilterQuery<BookInventory>,
      { totalInventory }: UpdateQuery<BookInventory>,
    ) => {
      if (id === bookId) {
        return {
          ...bookInvDoc,
          totalInventory,
        } as unknown as Query<any, any>;
      }
    };

    it('should update book inventory document', async () => {
      jest
        .spyOn(bookInvModel, 'findOneAndUpdate')
        .mockImplementationOnce(updateMock);

      const quantity = 7;
      const expected = { ...bookInv, totalInventory: quantity };

      const res = await service.update(bookId, quantity);
      expect(res).toEqual(expected);
      expect(res).toBeInstanceOf(BookInventory);
    });

    it('should return null if not found', async () => {
      jest
        .spyOn(bookInvModel, 'findOneAndUpdate')
        .mockImplementationOnce(updateMock);

      expect(await service.update('1231', 34)).toBeNull();
    });

    it('should throw an error if something goes wrong', async () => {
      jest
        .spyOn(bookInvModel, 'findOneAndUpdate')
        .mockImplementationOnce(() => {
          throw new Error('could not update');
        });

      await expect(service.update('1aasdqw', 2)).rejects.toThrow(
        PersistenceError,
      );
    });
  });

  describe('Delete book inventory tests', () => {
    const deleteMock = ({ bookId: id }: FilterQuery<BookInventory>) => {
      let count = 0;
      if (id === bookId) {
        count++;
      }
      return {
        deletedCount: count,
        acknowledged: true,
      } as unknown as Query<any, any>;
    };

    it('should return true when deleted', async () => {
      jest.spyOn(bookInvModel, 'deleteOne').mockImplementationOnce(deleteMock);

      expect(await service.delete(bookId)).toBe(true);
    });

    it('should return false when not found', async () => {
      jest.spyOn(bookInvModel, 'deleteOne').mockImplementationOnce(deleteMock);

      expect(await service.delete('11asdas')).toBe(false);
    });

    it('should throw an error if something goes wrong', async () => {
      jest.spyOn(bookInvModel, 'deleteOne').mockImplementationOnce(() => {
        throw new Error('could not delete');
      });

      await expect(service.delete('a112312')).rejects.toThrow(PersistenceError);
    });
  });

  describe('Update reserved tests', () => {
    const updateMock = (
      { bookId: id, version },
      { $inc: { totalReserved } },
    ) => {
      if (id === bookId && (!version || version === bookInvDoc.version)) {
        return {
          ...bookInvDoc,
          totalReserved: bookInvDoc.totalReserved + totalReserved,
        } as unknown as Query<any, any>;
      }
    };

    it('should return updated inventory', async () => {
      jest
        .spyOn(bookInvModel, 'findOneAndUpdate')
        .mockImplementationOnce(updateMock);

      const quantity = 1;

      const result = await service.updateReserved(
        bookId,
        quantity,
        bookInv.version,
      );

      expect(result).toEqual({
        ...bookInv,
        totalReserved: bookInv.totalReserved + quantity,
      });
      expect(result).toBeInstanceOf(BookInventory);
    });

    it('should return null when not found', async () => {
      jest
        .spyOn(bookInvModel, 'findOneAndUpdate')
        .mockImplementationOnce(updateMock);

      expect(await service.updateReserved('123', 1)).toBeNull();
    });

    it('should return null when version mismatch', async () => {
      jest
        .spyOn(bookInvModel, 'findOneAndUpdate')
        .mockImplementationOnce(updateMock);

      expect(await service.updateReserved(bookId, 1, 3)).toBeNull();
    });

    it('should throw an error if something goes wrong', async () => {
      jest
        .spyOn(bookInvModel, 'findOneAndUpdate')
        .mockImplementationOnce(() => {
          throw new Error('could not update');
        });

      await expect(
        service.updateReserved(bookId, 1, bookInv.version),
      ).rejects.toThrow(PersistenceError);
    });
  });
});
