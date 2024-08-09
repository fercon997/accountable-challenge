import { Inject, Injectable, LoggerService } from '@nestjs/common';
import { Promise } from 'mongoose';
import { IBookDao } from '../../../data-access/persistence/dao/book-dao';
import { Book } from '../../../common/entities';
import { BookNotFoundError } from '../../../common/errors';
import { IBookService } from './book-service.interface';

@Injectable()
export class BookService implements IBookService {
  constructor(
    @Inject(IBookDao) private bookDao: IBookDao,
    @Inject('LoggerService') private logger: LoggerService,
  ) {}

  async create(book: Book): Promise<Book> {
    this.logger.log(`Creating book with id ${book._id}`);
    const result = await this.bookDao.create(book);
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

  async update(id: string, book: Partial<Book>): Promise<Book> {
    this.logger.log(`Updating book ${id} with values ${JSON.stringify(book)}`);
    const result = await this.bookDao.update(id, book);
    if (!result) {
      throw new BookNotFoundError(this.logger, id);
    }
    this.logger.log(`Book ${id} updated`);

    return result;
  }
}
