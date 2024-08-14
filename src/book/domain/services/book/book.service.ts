import { forwardRef, Inject, Injectable, LoggerService } from '@nestjs/common';
import { PaginationOptions, PaginationResult } from '@shared/types';
import { IBookInventoryService } from '@reservation/domain/services/book-inventory/book-inventory-service.interface';
import {
  BookSearchFilters,
  IBookDao,
} from '../../../data-access/persistence/dao/book-dao';
import { Book } from '../../../common/entities';
import { BookNotFoundError } from '../../../common/errors';
import { IBookService } from './book-service.interface';

@Injectable()
export class BookService implements IBookService {
  constructor(
    @Inject(IBookDao) private bookDao: IBookDao,
    @Inject('LoggerService') private logger: LoggerService,
    @Inject(forwardRef(() => IBookInventoryService))
    private bookInvService: IBookInventoryService,
  ) {}

  async create(book: Book, quantity: number): Promise<Book> {
    this.logger.log(`Creating book with id ${book._id}`);
    await this.bookInvService.create(book._id, quantity);
    const result = await this.bookDao.create({
      ...book,
      isAvailable: quantity > 0,
    });
    this.logger.log(`Book ${book._id} created`);
    return result;
  }

  async delete(id: string): Promise<boolean> {
    this.logger.log(`Deleting book ${id}`);
    const res = await this.bookDao.delete(id);
    if (!res) {
      throw new BookNotFoundError(this.logger, id);
    }
    this.logger.log(`Book ${id} deleted`);
    return res;
  }

  async getById(id: string): Promise<Book> {
    this.logger.log(`Getting book ${id}`);
    const book = await this.bookDao.getById(id);
    if (!book) {
      throw new BookNotFoundError(this.logger, id);
    }
    this.logger.log(`Book ${id} retrieved`);
    return book;
  }

  async update(
    id: string,
    book: Partial<Book>,
    quantity?: number,
  ): Promise<Book> {
    this.logger.log(`Updating book ${id} with values ${JSON.stringify(book)}`);
    book = await this.manageQuantityUpdate(id, book, quantity);
    const result = await this.bookDao.update(id, book);
    if (!result) {
      throw new BookNotFoundError(this.logger, id);
    }
    this.logger.log(`Book ${id} updated`);

    return result;
  }

  private async manageQuantityUpdate(
    bookId: string,
    book: Partial<Book>,
    quantity?: number,
  ): Promise<Partial<Book>> {
    if (quantity !== undefined) {
      await this.bookInvService.update(bookId, quantity);
      book.isAvailable = quantity > 0;
    }

    return book;
  }

  async search(
    filters: BookSearchFilters,
    options: PaginationOptions,
  ): Promise<PaginationResult<Book>> {
    this.logger.log(
      `Searching books with filters ${filters} and options ${options}`,
    );

    const { page, pageSize } = options;

    const result = await this.bookDao.search(filters, {
      limit: pageSize,
      offset: (page - 1) * pageSize,
    });

    this.logger.log(
      `Found ${result.totalCount} books, returning ${pageSize} books corresponding to page ${page} `,
    );

    return { ...result, page, pageSize };
  }
}
