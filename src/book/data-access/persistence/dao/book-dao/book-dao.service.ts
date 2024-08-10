import { Inject, Injectable, LoggerService } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Promise } from 'mongoose';
import { PersistenceError } from '@shared/errors';
import { DbPaginationOptions, PaginationResult } from '@shared/types';
import { Book, BookDocument } from '../../../../common/entities';
import { IBookDao, BookSearchFilters } from './book-dao-interface';

@Injectable()
export class BookDaoService implements IBookDao {
  constructor(
    @InjectModel(Book.name) private bookModel: Model<Book>,
    @Inject('LoggerService') private logger: LoggerService,
  ) {}

  private parseBookDocument(book: BookDocument): Book {
    return new Book({
      ...book.toJSON(),
      price: parseFloat(book.price.toString()),
    });
  }

  async create(book: Book): Promise<Book> {
    try {
      const bookDocument: BookDocument = await this.bookModel.create(book);
      return this.parseBookDocument(bookDocument);
    } catch (error) {
      throw new PersistenceError(this.logger, 'Could not create book', error);
    }
  }

  async getById(id: string): Promise<Book> {
    try {
      const bookDocument: BookDocument = await this.bookModel.findById(id);
      return bookDocument ? this.parseBookDocument(bookDocument) : null;
    } catch (error) {
      throw new PersistenceError(this.logger, 'Could not get book', error);
    }
  }

  async delete(id: string): Promise<boolean> {
    try {
      const deleteResult = await this.bookModel.deleteOne({ _id: id });
      return deleteResult.deletedCount === 1;
    } catch (error) {
      throw new PersistenceError(this.logger, 'Could not delete book', error);
    }
  }

  async update(id: string, book: Partial<Book>): Promise<Book> {
    try {
      const updated: BookDocument = await this.bookModel.findByIdAndUpdate(
        id,
        book,
        { returnOriginal: false },
      );
      return updated ? this.parseBookDocument(updated) : null;
    } catch (error) {
      throw new PersistenceError(this.logger, 'Could not update book', error);
    }
  }

  async search(
    { title, author, genre }: BookSearchFilters,
    { limit, offset }: DbPaginationOptions,
  ): Promise<PaginationResult<Book>> {
    try {
      const query = this.bookModel
        .find({ title, author, genre })
        .limit(limit)
        .skip(offset);

      return {
        data: (await query.exec()).map(this.parseBookDocument),
        totalCount: await query.countDocuments(),
      };
    } catch (error) {
      throw new PersistenceError(
        this.logger,
        'Could not search books with selected filters',
        error,
      );
    }
  }
}
