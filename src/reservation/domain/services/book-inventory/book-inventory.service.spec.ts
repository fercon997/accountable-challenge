import { Test, TestingModule } from '@nestjs/testing';
import { createMock } from '@golevelup/ts-jest';
import { Types } from 'mongoose';
import { VersionChangedError } from '@shared/errors';
import { IBookService } from '@book/domain/services/book/book-service.interface';
import { IBookInventoryDao } from '../../../data-access/persistence/dao/book-inventory-dao';
import { BookInventory } from '../../../common/entities';
import {
  BookInventoryNotFoundError,
  InvalidQuantityError,
} from '../../../common/errors';
import { IBookInventoryService } from './book-inventory-service.interface';
import { BookInventoryService } from './book-inventory.service';

describe('BookInventoryService', () => {
  let service: IBookInventoryService;
  let bookInvDao: IBookInventoryDao;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        { provide: IBookInventoryService, useClass: BookInventoryService },
        {
          provide: IBookInventoryDao,
          useValue: createMock(),
        },
        { provide: 'LoggerService', useValue: createMock() },
        { provide: IBookService, useValue: createMock() },
      ],
    }).compile();

    service = module.get<IBookInventoryService>(IBookInventoryService);
    bookInvDao = module.get<IBookInventoryDao>(IBookInventoryDao);
  });

  const _id = new Types.ObjectId().toString();
  const bookId = '1234xs';
  const quantity = 4;
  const createdAt = new Date();
  const updatedAt = new Date();

  const bookInv: BookInventory = {
    _id,
    bookId,
    totalInventory: quantity,
    totalReserved: 0,
    createdAt,
    updatedAt,
    version: 0,
  };

  const getMock =
    (bookInv: BookInventory) =>
    async (id: string): Promise<BookInventory> => {
      if (id === bookId) {
        return bookInv;
      }
      return null;
    };

  describe('Create book inventory tests', () => {
    it('should return created book inventory', async () => {
      jest
        .spyOn(bookInvDao, 'create')
        .mockImplementationOnce(async (bookId, quantity) => {
          return new BookInventory({
            _id,
            bookId,
            totalInventory: quantity,
            totalReserved: 0,
            createdAt,
            updatedAt,
            version: 0,
          });
        });

      expect(await service.create(bookId, quantity)).toEqual(bookInv);
    });
  });

  describe('Get book inventory tests', () => {
    beforeEach(() => {
      jest.spyOn(bookInvDao, 'get').mockImplementationOnce(getMock(bookInv));
    });

    it('should return book inventory', async () => {
      expect(await service.get(bookId)).toEqual(bookInv);
    });

    it('should throw not found error when not found', async () => {
      await expect(service.get('qweq423')).rejects.toThrow(
        BookInventoryNotFoundError,
      );
    });
  });

  describe('Update book inventory tests', () => {
    const toUpdate: BookInventory = { ...bookInv, totalReserved: 2 };
    const updateMock = async (id: string, quantity: number) => {
      if (id === bookId) {
        return new BookInventory({
          ...toUpdate,
          totalInventory: quantity,
        });
      }
      return null;
    };

    beforeEach(() => {
      jest.spyOn(bookInvDao, 'get').mockImplementationOnce(getMock(toUpdate));
    });

    it('should return updated book inventory', async () => {
      jest.spyOn(bookInvDao, 'update').mockImplementationOnce(updateMock);

      expect(await service.update(bookId, 8)).toEqual({
        ...toUpdate,
        totalInventory: 8,
      });
    });

    it('should throw an error if not found', async () => {
      await expect(service.update('112323qa', 5)).rejects.toThrow(
        BookInventoryNotFoundError,
      );
    });

    it('should throw an error if quantity is invalid', async () => {
      jest.spyOn(bookInvDao, 'update').mockImplementationOnce(updateMock);

      await expect(service.update(bookId, 1)).rejects.toThrow(
        InvalidQuantityError,
      );
    });
  });

  describe('Delete book inventory tests', () => {
    beforeEach(() => {
      jest
        .spyOn(bookInvDao, 'delete')
        .mockImplementationOnce(async (id: string) => {
          return id === bookId;
        });
    });

    it('should return true when deleted', async () => {
      expect(await service.delete(bookId)).toBe(true);
    });

    it('should throw an error when not found', async () => {
      await expect(service.delete('12312asds')).rejects.toThrow(
        BookInventoryNotFoundError,
      );
    });
  });

  const updateResMock =
    (v: number, inv?: BookInventory) => async (id, quantity, version) => {
      const bokInv = inv || bookInv;
      if (id === bokInv.bookId && (!version || version === v)) {
        return {
          ...bokInv,
          totalReserved: bokInv.totalReserved + quantity,
        };
      }
      return null;
    };

  describe('Add reservation tests', () => {
    it('should return updated bookInventory', async () => {
      const expected = { ...bookInv, totalReserved: 3 };
      jest.spyOn(bookInvDao, 'get').mockImplementationOnce(getMock(expected));
      jest
        .spyOn(bookInvDao, 'updateReserved')
        .mockImplementationOnce(updateResMock(0, expected));

      expect(await service.addReservation(bookId)).toEqual({
        ...expected,
        totalReserved: expected.totalReserved + 1,
      });
    });

    it('should fail if cannot update', async () => {
      jest
        .spyOn(bookInvDao, 'get')
        .mockImplementationOnce(
          getMock({ ...bookInv, totalInventory: 4, totalReserved: 4 }),
        );
      await expect(service.addReservation(bookId)).rejects.toThrow(
        InvalidQuantityError,
      );
    });

    it('should fail if version mismatch', async () => {
      jest
        .spyOn(bookInvDao, 'get')
        .mockImplementationOnce(getMock({ ...bookInv, version: 1 }));
      jest
        .spyOn(bookInvDao, 'updateReserved')
        .mockImplementationOnce(updateResMock(2));

      await expect(service.addReservation(bookId)).rejects.toThrow(
        VersionChangedError,
      );
    });
  });

  describe('Release reservation tests', () => {
    it('should return updated bookInventory', async () => {
      const expected = { ...bookInv, totalReserved: 4 };
      jest.spyOn(bookInvDao, 'get').mockImplementationOnce(getMock(expected));
      jest
        .spyOn(bookInvDao, 'updateReserved')
        .mockImplementationOnce(updateResMock(0, expected));

      expect(await service.releaseReservation(bookId)).toEqual({
        ...expected,
        totalReserved: expected.totalReserved - 1,
      });
    });

    it('should fail if cannot update', async () => {
      jest
        .spyOn(bookInvDao, 'get')
        .mockImplementationOnce(
          getMock({ ...bookInv, totalInventory: 4, totalReserved: 0 }),
        );
      await expect(service.releaseReservation(bookId)).rejects.toThrow(
        InvalidQuantityError,
      );
    });

    it('should fail if version mismatch', async () => {
      jest
        .spyOn(bookInvDao, 'get')
        .mockImplementationOnce(
          getMock({ ...bookInv, totalReserved: 2, version: 1 }),
        );
      jest
        .spyOn(bookInvDao, 'updateReserved')
        .mockImplementationOnce(updateResMock(2));

      await expect(service.releaseReservation(bookId)).rejects.toThrow(
        VersionChangedError,
      );
    });
  });

  describe('Decrement inventory tests', () => {
    const updateInvMock =
      (v: number, inv?: BookInventory) => async (id, quantity, version) => {
        const bokInv = inv || bookInv;
        if (id === bokInv.bookId && (!version || version === v)) {
          return {
            ...bokInv,
            totalInventory: bokInv.totalInventory + quantity,
            totalReserved: bokInv.totalReserved + quantity,
          };
        }
        return null;
      };
    it('should return updated bookInventory', async () => {
      const expected = { ...bookInv, totalInventory: 4, totalReserved: 3 };
      jest.spyOn(bookInvDao, 'get').mockImplementationOnce(getMock(expected));
      jest
        .spyOn(bookInvDao, 'updateInventory')
        .mockImplementationOnce(updateInvMock(0, expected));

      expect(await service.decrementInventory(bookId)).toEqual({
        ...expected,
        totalInventory: expected.totalInventory - 1,
        totalReserved: expected.totalReserved - 1,
      });
    });

    it('should fail if cannot update', async () => {
      jest
        .spyOn(bookInvDao, 'get')
        .mockImplementationOnce(
          getMock({ ...bookInv, totalInventory: 0, totalReserved: 0 }),
        );
      await expect(service.decrementInventory(bookId)).rejects.toThrow(
        InvalidQuantityError,
      );
    });

    it('should fail if version mismatch', async () => {
      jest
        .spyOn(bookInvDao, 'get')
        .mockImplementationOnce(
          getMock({ ...bookInv, totalInventory: 2, version: 1 }),
        );
      jest
        .spyOn(bookInvDao, 'updateInventory')
        .mockImplementationOnce(updateInvMock(2));

      await expect(service.decrementInventory(bookId)).rejects.toThrow(
        VersionChangedError,
      );
    });
  });
});
