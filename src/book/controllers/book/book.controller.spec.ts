import { Test, TestingModule } from '@nestjs/testing';
import { createMock } from '@golevelup/ts-jest';
import { Response, ResponsePaginated } from '@shared/base.controller';
import { Genres } from '@shared/types';
import { IBookService } from '../../domain/services/book';
import { Book } from '../../common/entities';
import {
  BookDto,
  CreateBookDto,
  PaginationBookDto,
  ResponseBookDto,
  UpdateBookDto,
} from '../../domain/dto';
import { BookController } from './book.controller';

describe('BookController', () => {
  let controller: BookController;
  let bookService: IBookService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [BookController],
      providers: [{ provide: IBookService, useValue: createMock() }],
    }).compile();

    controller = module.get<BookController>(BookController);
    bookService = module.get<IBookService>(IBookService);
  });

  const book: BookDto = {
    id: '1231324hs',
    title: 'title',
    price: 25,
    publicationYear: 2020,
    author: 'Author',
    publisher: 'Publisher',
    genre: Genres.mystery,
  };

  const resultBook: ResponseBookDto = { ...book, isAvailable: true };

  const createBook: CreateBookDto = { ...book, quantity: 4 };

  const bookFromDto = (dto: ResponseBookDto): Book => {
    return new Book({ _id: dto.id, ...dto });
  };

  const expectRes = <T>(response: Response<T>, data: T): void => {
    const res: Response<T> = {
      data,
      statusCode: 200,
    };
    expect(response).toEqual(res);
  };

  describe('Post book tests', () => {
    it('should create book and return it', async () => {
      jest
        .spyOn(bookService, 'create')
        .mockResolvedValueOnce(bookFromDto(resultBook));

      const result = await controller.create(createBook);
      expectRes(result, resultBook);
    });
  });

  describe('Get Book tests', () => {
    it('should return book when found', async () => {
      jest
        .spyOn(bookService, 'getById')
        .mockResolvedValueOnce(bookFromDto(resultBook));

      expectRes(await controller.getBook(book.id), resultBook);
      expect(bookService.getById).toHaveBeenCalledWith(book.id);
    });
  });

  describe('Update Book tests', () => {
    it('should update book and return it', async () => {
      const update: UpdateBookDto = {
        title: 'New title',
      };

      const returnData: ResponseBookDto = {
        ...resultBook,
        ...update,
      };

      jest
        .spyOn(bookService, 'update')
        .mockResolvedValueOnce(bookFromDto(returnData));

      const result = await controller.update(book.id, resultBook);
      expectRes(result, returnData);
    });
  });

  describe('DELETE book tests', () => {
    it('should delete book and return 200', async () => {
      jest.spyOn(bookService, 'delete').mockResolvedValueOnce(true);

      expectRes(await controller.delete(book.id), void 0);
    });
  });

  describe('GET search tests', () => {
    it('should return books paginated', async () => {
      const query: PaginationBookDto = {
        page: 1,
        pageSize: 10,
      };

      const result: ResponsePaginated<ResponseBookDto> = {
        data: [resultBook],
        totalCount: 1,
        page: query.page,
        nextPage: null,
        totalPages: 1,
        statusCode: 200,
      };

      jest
        .spyOn(bookService, 'search')
        .mockImplementationOnce(async (filters, { page, pageSize }) => {
          return {
            data: [bookFromDto(resultBook)],
            totalCount: 1,
            page,
            pageSize,
          };
        });

      expect(await controller.search(query)).toEqual(result);
    });

    it('should return books and next page', async () => {
      const query: PaginationBookDto = {
        page: 1,
        pageSize: 1,
      };

      const result: ResponsePaginated<ResponseBookDto> = {
        data: [resultBook],
        totalCount: 2,
        page: query.page,
        nextPage: 2,
        totalPages: 2,
        statusCode: 200,
      };

      jest
        .spyOn(bookService, 'search')
        .mockImplementationOnce(async (filters, { page, pageSize }) => {
          return {
            data: [bookFromDto(resultBook)],
            totalCount: 2,
            page,
            pageSize,
          };
        });

      expect(await controller.search(query)).toEqual(result);
    });
  });
});
