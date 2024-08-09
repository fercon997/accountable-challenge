import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { createMock } from '@golevelup/ts-jest';
import { Model, Types } from 'mongoose';
import { PersistenceError } from '@shared/errors';
import { Book, BookDocument } from '../../../../common/entities';
import { BookDaoService } from './book-dao.service';
import { IBookDao } from './book-dao-interface';

describe('BookDaoService', () => {
  let service: IBookDao;
  let bookModel: Model<Book>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        { provide: IBookDao, useClass: BookDaoService },
        {
          provide: getModelToken(Book.name),
          useValue: createMock<Model<Book>>(),
        },
        { provide: 'LoggerService', useValue: createMock() },
      ],
    }).compile();

    service = module.get<IBookDao>(IBookDao);
    bookModel = module.get<Model<Book>>('BookModel');
  });

  const book: Book = {
    _id: '1231324hs',
    title: 'title',
    price: 25,
    isAvailable: true,
    publicationYear: 2020,
    author: 'Author',
    publisher: 'Publisher',
    genre: 'mystery',
  };

  const bookResult = {
    ...book,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const parseDbBook = (book: Book) => ({
    ...book,
    price: new Types.Decimal128(book.price.toString()),
  });

  const dbBook: BookDocument = {
    ...parseDbBook(bookResult),
    toJSON: () => parseDbBook(bookResult),
  } as unknown as BookDocument;

  describe('Create Book tests', () => {
    it('should return a book instance when created', async () => {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-expect-error
      jest.spyOn(bookModel, 'create').mockResolvedValueOnce(dbBook);

      const result = await service.create(book);
      expect(result).toBeInstanceOf(Book);
      expect(result).toEqual(bookResult);
      expect(bookModel.create).toHaveBeenCalledWith(book);
    });

    it('should throw a persistence error when creation fails', async () => {
      jest.spyOn(bookModel, 'create').mockImplementationOnce(() => {
        throw new Error('creation failed');
      });

      await expect(service.create(book)).rejects.toThrow(PersistenceError);
    });
  });

  describe('Get book tests', () => {
    it('should fetch the book and return it', async () => {
      jest.spyOn(bookModel, 'findById').mockResolvedValueOnce(dbBook);

      const result = await service.getById(book._id);
      expect(result).toBeInstanceOf(Book);
      expect(result).toEqual(bookResult);
      expect(bookModel.findById).toHaveBeenCalledWith(book._id);
    });

    it('should return null when book is not found', async () => {
      jest.spyOn(bookModel, 'findById').mockResolvedValueOnce(undefined);

      expect(await service.getById(book._id)).toBe(null);
      expect(bookModel.findById).toHaveBeenCalledWith(book._id);
    });

    it('should throw persistence error when fetching fails', async () => {
      jest.spyOn(bookModel, 'findById').mockImplementationOnce(() => {
        throw new Error('failed getting');
      });

      await expect(service.getById(book._id)).rejects.toThrow(PersistenceError);
    });
  });

  describe('Update book tests', () => {
    it('should return updated book', async () => {
      const toUpdate: Partial<Book> = {
        title: 'New Title',
        price: 37,
      };

      const returnBook = {
        ...bookResult,
        ...toUpdate,
      };

      const returnDbBook = {
        ...parseDbBook(returnBook),
        toJSON: () => parseDbBook(returnBook),
      } as unknown as BookDocument;

      jest
        .spyOn(bookModel, 'findByIdAndUpdate')
        .mockResolvedValueOnce(returnDbBook);

      const result = await service.update(book._id, toUpdate);

      expect(result).toBeInstanceOf(Book);
      expect(result).toEqual(returnBook);
      expect(result.title).toBe(toUpdate.title);
      expect(result.price).toBe(toUpdate.price);
      expect(bookModel.findByIdAndUpdate).toHaveBeenCalledWith(
        book._id,
        toUpdate,
      );
    });

    it('should return null if book is not found', async () => {
      jest
        .spyOn(bookModel, 'findByIdAndUpdate')
        .mockResolvedValueOnce(undefined);

      expect(await service.update(book._id, book)).toBe(null);
      expect(bookModel.findByIdAndUpdate).toHaveBeenCalledWith(book._id, book);
    });

    it('should throw an error if update fails', async () => {
      jest.spyOn(bookModel, 'findByIdAndUpdate').mockImplementationOnce(() => {
        throw new Error('failed updating');
      });

      await expect(service.update(book._id, book)).rejects.toThrow(
        PersistenceError,
      );
    });

    describe('Delete book tests', () => {
      it('should return true if book is deleted', async () => {
        jest
          .spyOn(bookModel, 'deleteOne')
          .mockResolvedValueOnce({ deletedCount: 1, acknowledged: true });

        expect(await service.delete(book._id)).toBe(true);
        expect(bookModel.deleteOne).toHaveBeenCalledWith({ _id: book._id });
      });

      it('should return false if not found or not deleted', async () => {
        jest
          .spyOn(bookModel, 'deleteOne')
          .mockResolvedValueOnce({ deletedCount: 0, acknowledged: true });

        expect(await service.delete(book._id)).toBe(false);
        expect(bookModel.deleteOne).toHaveBeenCalledWith({ _id: book._id });
      });

      it('should throw error if deletion fails', async () => {
        jest.spyOn(bookModel, 'deleteOne').mockImplementationOnce(() => {
          throw new Error('failed deleting');
        });

        await expect(service.delete(book._id)).rejects.toThrow(
          PersistenceError,
        );
      });
    });
  });
});
