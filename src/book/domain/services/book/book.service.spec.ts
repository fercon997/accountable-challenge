import { Test, TestingModule } from '@nestjs/testing';
import { createMock } from '@golevelup/ts-jest';
import { Genres } from '@shared/types';
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
});
