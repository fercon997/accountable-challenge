import { Inject, Injectable, LoggerService } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Promise } from 'mongoose';
import { DbPaginationOptions, DbPaginationResult } from '@shared/types';
import { DaoService } from '@shared/dao.service';
import { Book, BookDocument } from '../../../../common/entities';
import { IBookDao, BookSearchFilters } from './book-dao-interface';

@Injectable()
export class BookDaoService extends DaoService implements IBookDao {
  constructor(
    @InjectModel(Book.name) private bookModel: Model<Book>,
    @Inject('LoggerService') logger: LoggerService,
  ) {
    super(logger);
  }

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
      this.throwError('Could not create book', error);
    }
  }

  async getById(id: string): Promise<Book> {
    try {
      const bookDocument: BookDocument = await this.bookModel.findById(id);
      return bookDocument ? this.parseBookDocument(bookDocument) : null;
    } catch (error) {
      this.throwError('Could not get book', error);
    }
  }

  async delete(id: string): Promise<boolean> {
    try {
      const deleteResult = await this.bookModel.deleteOne({ _id: id });
      return deleteResult.deletedCount === 1;
    } catch (error) {
      this.throwError('Could not delete book', error);
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
      this.throwError('Could not update book', error);
    }
  }

  async search(
    { title, author, genre }: BookSearchFilters,
    { limit, offset }: DbPaginationOptions,
  ): Promise<DbPaginationResult<Book>> {
    try {
      const filter: BookSearchFilters = {};
      if (title) {
        filter.title = title;
      }
      if (author) {
        filter.author = author;
      }
      if (genre) {
        filter.genre = genre;
      }
      const result = await this.bookModel
        .find(filter)
        .limit(limit)
        .skip(offset)
        .exec();

      return {
        data: result.map(this.parseBookDocument),
        totalCount: await this.bookModel.find(filter).countDocuments(),
      };
    } catch (error) {
      this.throwError('Could not search books with selected filters', error);
    }
  }

  async getByIds(ids: string[]): Promise<Book[]> {
    try {
      const result = await this.bookModel.find({ _id: { $in: ids } });
      return result.map(this.parseBookDocument);
    } catch (e) {
      this.throwError('Could not get books', e);
    }
  }
}
