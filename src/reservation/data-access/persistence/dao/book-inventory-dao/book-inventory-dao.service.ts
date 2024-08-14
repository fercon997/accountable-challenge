import { Inject, Injectable, LoggerService } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { ClientSession, FilterQuery, Model } from 'mongoose';
import { ITransactionService } from '@shared/services/transaction';
import { DaoService } from '@shared/dao.service';
import {
  BookInventory,
  BookInventoryDocument,
} from '../../../../common/entities';
import { IBookInventoryDao } from './book-inventory-dao.interface';

@Injectable()
export class BookInventoryDaoService
  extends DaoService
  implements IBookInventoryDao
{
  constructor(
    @InjectModel(BookInventory.name)
    private bookInventoryModel: Model<BookInventory>,
    @Inject('LoggerService') logger: LoggerService,
    @Inject(ITransactionService)
    private transactionService: ITransactionService<ClientSession>,
  ) {
    super(logger);
  }

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
      this.throwError(`Could not create book inventory ${bookId}`, error);
    }
  }

  async get(bookId: string): Promise<BookInventory> {
    try {
      const result: BookInventoryDocument =
        await this.bookInventoryModel.findOne({ bookId });

      return result ? new BookInventory(result) : null;
    } catch (error) {
      this.throwError(`Could not get book inventory ${bookId}`, error);
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
      this.throwError(`Could not update book inventory ${bookId}`, error);
    }
  }

  async delete(bookId: string): Promise<boolean> {
    try {
      const result = await this.bookInventoryModel.deleteOne({ bookId });
      return result.deletedCount === 1;
    } catch (error) {
      this.throwError(`Could not delete book inventory ${bookId}`, error);
    }
  }

  async updateReserved(
    bookId: string,
    quantity: number,
    version?: number,
  ): Promise<BookInventory> {
    try {
      const query: FilterQuery<BookInventory> = version
        ? { bookId, version }
        : { bookId };

      const result = await this.bookInventoryModel.findOneAndUpdate(
        query,
        {
          $inc: { totalReserved: quantity },
        },
        {
          returnOriginal: false,
          session: this.transactionService.getCurrentTransaction(),
        },
      );
      return result ? new BookInventory(result) : null;
    } catch (error) {
      this.throwError(`Could not update book inventory ${bookId}`, error);
    }
  }
}
