import { Test, TestingModule } from '@nestjs/testing';
import { createMock } from '@golevelup/ts-jest';
import { Response } from '@shared/base.controller';
import { IBookService } from '../../domain/services/book';
import { Book } from '../../common/entities';
import { BookDto, UpdateBookDto } from '../../domain/dto';
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
    isAvailable: true,
    publicationYear: 2020,
    author: 'Author',
    publisher: 'Publisher',
    genre: 'mystery',
  };

  const bookFromDto = (dto: BookDto): Book => {
    return new Book({ _id: dto.id, ...dto });
  };

  const exepctResponse = <T>(response: Response<T>, data: T): void => {
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
        .mockResolvedValueOnce(bookFromDto(book));

      const result = await controller.create(book);
      exepctResponse(result, book);
    });
  });

  describe('Get Book tests', () => {
    it('should return book when found', async () => {
      jest
        .spyOn(bookService, 'getById')
        .mockResolvedValueOnce(bookFromDto(book));

      exepctResponse(await controller.getBook(book.id), book);
      expect(bookService.getById).toHaveBeenCalledWith(book.id);
    });
  });

  describe('Update Book tests', () => {
    it('should update book and return it', async () => {
      const update: UpdateBookDto = {
        title: 'New title',
      };

      const returnData: BookDto = {
        ...book,
        ...update,
      };

      jest
        .spyOn(bookService, 'update')
        .mockResolvedValueOnce(bookFromDto(returnData));

      const result = await controller.update(book.id, book);
      exepctResponse(result, returnData);
    });
  });

  describe('DELETE book tests', () => {
    it('should delete book and return 200', async () => {
      jest.spyOn(bookService, 'delete').mockResolvedValueOnce(true);

      exepctResponse(await controller.delete(book.id), void 0);
    });
  });
});
