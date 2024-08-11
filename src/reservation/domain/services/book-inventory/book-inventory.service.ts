import { Inject, Injectable, LoggerService } from '@nestjs/common';
import { IBookInventoryDao } from '../../../data-access/persistence/dao/book-inventory-dao';
import { BookInventory } from '../../../common/entities';
import {
  BookInventoryNotFoundError,
  InvalidQuantityError,
} from '../../../common/errors';
import { IBookInventoryService } from './book-inventory-service.interface';

@Injectable()
export class BookInventoryService implements IBookInventoryService {
  constructor(
    @Inject(IBookInventoryDao) private bookInvDao: IBookInventoryDao,
    @Inject('LoggerService') private logger: LoggerService,
  ) {}

  async create(bookId: string, quantity: number): Promise<BookInventory> {
    this.logger.log(
      `Creating inventory for book ${bookId} with quantity ${quantity}`,
    );
    const result = await this.bookInvDao.create(bookId, quantity);
    this.logger.log(`Created inventory for book ${bookId}`);
    return result;
  }

  async get(bookId: string): Promise<BookInventory> {
    const result = await this.bookInvDao.get(bookId);
    if (!result) {
      throw new BookInventoryNotFoundError(this.logger, bookId);
    }
    this.logger.log(`Got book inventory ${bookId}`);

    return result;
  }

  async update(bookId: string, quantity: number): Promise<BookInventory> {
    this.logger.log(`Updating book ${bookId} inventory with ${quantity} items`);
    const bookInv = await this.bookInvDao.get(bookId);
    if (!bookInv) {
      throw new BookInventoryNotFoundError(this.logger, bookId);
    }

    if (bookInv.totalReserved > quantity) {
      throw new InvalidQuantityError(this.logger, bookId, quantity);
    }

    const result = await this.bookInvDao.update(bookId, quantity);
    this.logger.log(`Book ${bookId} updated with ${quantity} items`);
    return result;
  }

  async delete(bookId: string): Promise<boolean> {
    this.logger.log(`Deleting book ${bookId} inventory`);
    const res = await this.bookInvDao.delete(bookId);
    if (!res) {
      throw new BookInventoryNotFoundError(this.logger, bookId);
    }

    this.logger.log(`Deleted book ${bookId} inventory`);
    return res;
  }
}
