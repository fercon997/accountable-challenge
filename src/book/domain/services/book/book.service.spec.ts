import { Test, TestingModule } from '@nestjs/testing';
import { createMock } from '@golevelup/ts-jest';
import { Genres, PaginationResult } from '@shared/types';
import { IBookDao } from '../../../data-access/persistence/dao/book-dao';
import { Book } from '../../../common/entities';
import { BookNotFoundError } from '../../../common/errors';
import { BookService } from './book.service';
import { IBookService } from './book-service.interface';

describe('BookService', () => {
  let service: IBookService;
  let bookDao: IBookDao;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        { provide: IBookService, useClass: BookService },
        { provide: IBookDao, useValue: createMock() },
        { provide: 'LoggerService', useValue: createMock() },
      ],
    }).compile();

    service = module.get<IBookService>(IBookService);
    bookDao = module.get<IBookDao>(IBookDao);
  });

  const book: Book = {
    _id: '1231324hs',
    title: 'title',
    price: 25,
    isAvailable: true,
    publicationYear: 2020,
    author: 'Author',
    publisher: 'Publisher',
    genre: Genres.mystery,
  };

  const bookResult = {
    ...book,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  describe('Create book tests', () => {
    it('should return the created book', async () => {
      jest.spyOn(bookDao, 'create').mockResolvedValueOnce(bookResult);

      const result = await service.create(book);
      expect(result).toEqual(bookResult);
      expect(bookDao.create).toHaveBeenCalledWith(book);
    });
  });

  describe('Get book tests', () => {
    it('should return the book', async () => {
      jest.spyOn(bookDao, 'getById').mockResolvedValueOnce(bookResult);

      const result = await service.getById(book._id);
      expect(result).toEqual(bookResult);
      expect(bookDao.getById).toHaveBeenCalledWith(book._id);
    });

    it('should throw an error when it is not found', async () => {
      jest.spyOn(bookDao, 'getById').mockResolvedValueOnce(null);

      await expect(service.getById(book._id)).rejects.toThrow(
        BookNotFoundError,
      );
    });
  });

  describe('Update book tests', () => {
    it('should return the book', async () => {
      const toUpdate: Partial<Book> = { title: 'New Title', price: 42 };
      const bookRes = { ...bookResult, ...toUpdate };
      jest.spyOn(bookDao, 'update').mockResolvedValueOnce(bookRes);

      const result = await service.update(book._id, toUpdate);
      expect(result).toEqual(bookRes);
      expect(bookDao.update).toHaveBeenCalledWith(book._id, toUpdate);
    });

    it('should throw an error when it is not found', async () => {
      jest.spyOn(bookDao, 'update').mockResolvedValueOnce(null);

      await expect(service.update(book._id, { title: 'New' })).rejects.toThrow(
        BookNotFoundError,
      );
    });
  });

  describe('Delete book tests', () => {
    it('should return true when deleted', async () => {
      jest.spyOn(bookDao, 'delete').mockResolvedValueOnce(true);

      expect(await service.delete(book._id)).toEqual(true);
      expect(bookDao.delete).toHaveBeenCalledWith(book._id);
    });

    it('should throw an error when it is not found', async () => {
      jest.spyOn(bookDao, 'delete').mockResolvedValueOnce(false);

      await expect(service.delete(book._id)).rejects.toThrow(BookNotFoundError);
    });
  });

  describe('Search books tests', () => {
    it('should return books with total count without filters', async () => {
      const books: Book[] = [bookResult];
      const result: PaginationResult<Book> = {
        data: books,
        totalCount: books.length,
      };

      jest.spyOn(bookDao, 'search').mockResolvedValueOnce(result);

      expect(await service.search({}, { pageSize: 10, page: 1 })).toEqual(
        result,
      );
    });

    it('should return books with filters', async () => {
      const author: string = 'search author';
      const books: Book[] = [bookResult, { ...bookResult, author }];
      const filtered = books.filter((book) => book.author === author);

      const result: PaginationResult<Book> = {
        data: filtered,
        totalCount: filtered.length,
      };

      jest
        .spyOn(bookDao, 'search')
        .mockImplementationOnce(async ({ author }) => {
          const filtered = books.filter((book) => book.author === author);
          return { data: filtered, totalCount: filtered.length };
        });

      expect(
        await service.search({ author }, { pageSize: 10, page: 1 }),
      ).toEqual(result);
    });

    it('should return books with pagination options', async () => {
      const books: Book[] = [
        bookResult,
        { ...bookResult, _id: '1234new' },
        { ...bookResult, _id: '1234other' },
      ];
      const result: PaginationResult<Book> = {
        data: [books[1]],
        totalCount: books.length,
      };

      jest
        .spyOn(bookDao, 'search')
        .mockImplementationOnce(async (filters, { limit, offset }) => {
          let count = 0;
          const res: Book[] = [];
          for (let i = offset; i < books.length; i++) {
            if (count >= limit) {
              break;
            }
            res.push(books[i]);
            count++;
          }
          return {
            data: res,
            totalCount: books.length,
          };
        });

      expect(await service.search({}, { pageSize: 1, page: 2 })).toEqual(
        result,
      );
    });

    it('should return empty when not found', async () => {
      const books = [];

      const result: PaginationResult<Book> = {
        data: books,
        totalCount: books.length,
      };

      jest.spyOn(bookDao, 'search').mockResolvedValueOnce(result);

      expect(await service.search({}, { pageSize: 10, page: 1 })).toEqual(
        result,
      );
    });
  });
});
