import { Inject, Injectable, LoggerService } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Promise } from 'mongoose';
import { PersistenceError } from '@shared/errors';
import { Book, BookDocument } from '../../../../common/entities';
import { IBookDao } from './book-dao-interface';

@Injectable()
export class BookDaoService implements IBookDao {
  constructor(
    @InjectModel(Book.name) private bookModel: Model<Book>,
    @Inject('LoggerService') private logger: LoggerService,
  ) {}

  async create(book: Book): Promise<Book> {
    try {
      const bookDocument: BookDocument = await this.bookModel.create(book);
      return new Book(bookDocument);
    } catch (error) {
      throw new PersistenceError(this.logger, 'Could not create book', error);
    }
  }

  async getById(id: string): Promise<Book> {
    try {
      const bookDocument: BookDocument = await this.bookModel.findById(id);
      return bookDocument ? new Book(bookDocument) : null;
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
      );
      return updated ? new Book(updated) : null;
    } catch (error) {
      throw new PersistenceError(this.logger, 'Could not update book', error);
    }
  }
}
