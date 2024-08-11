import { Inject, Injectable, LoggerService } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { PersistenceError } from '@shared/errors';
import {
  BookInventory,
  BookInventoryDocument,
} from '../../../../common/entities';
import { IBookInventoryDao } from './book-inventory-dao.interface';

@Injectable()
export class BookInventoryDaoService implements IBookInventoryDao {
  constructor(
    @InjectModel(BookInventory.name)
    private bookInventoryModel: Model<BookInventory>,
    @Inject('LoggerService') private logger: LoggerService,
  ) {}

  async create(bookId: string, quantity: number): Promise<BookInventory> {
    try {
      let result: BookInventoryDocument =
        await this.bookInventoryModel.findOneAndUpdate(
          { bookId },
          { totalInventory: quantity },
          { returnOriginal: false },
        );
      if (!result) {
        result = await this.bookInventoryModel.create({
          bookId,
          totalInventory: quantity,
        });
      }

      return new BookInventory(result);
    } catch (error) {
      throw new PersistenceError(
        this.logger,
        `Could not create book inventory ${bookId}`,
        error,
      );
    }
  }

  async get(bookId: string): Promise<BookInventory> {
    try {
      const result: BookInventoryDocument =
        await this.bookInventoryModel.findOne({ bookId });

      return result ? new BookInventory(result) : null;
    } catch (error) {
      throw new PersistenceError(
        this.logger,
        `Could not get book inventory ${bookId}`,
        error,
      );
    }
  }

  async update(bookId: string, quantity: number): Promise<BookInventory> {
    try {
      const result: BookInventoryDocument =
        await this.bookInventoryModel.findOneAndUpdate(
          { bookId },
          { totalInventory: quantity },
          { returnOriginal: false },
        );

      return result ? new BookInventory(result) : null;
    } catch (error) {
      throw new PersistenceError(
        this.logger,
        `Could not update book inventory ${bookId}`,
        error,
      );
    }
  }

  async delete(bookId: string): Promise<boolean> {
    try {
      const result = await this.bookInventoryModel.deleteOne({ bookId });
      return result.deletedCount === 1;
    } catch (error) {
      throw new PersistenceError(
        this.logger,
        `Could not delete book inventory ${bookId}`,
        error,
      );
    }
  }
}
