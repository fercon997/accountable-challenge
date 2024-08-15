import { forwardRef, Inject, Injectable, LoggerService } from '@nestjs/common';
import { IBookService } from '@book/domain/services/book/book-service.interface';
import { VersionChangedError } from '@shared/errors';
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
    @Inject(forwardRef(() => IBookService)) private bookService: IBookService,
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

  async addReservation(bookId: string): Promise<BookInventory> {
    this.logger.log(`Adding reservation to bookId ${bookId} count`);
    const amount = 1;
    const bookInv = await this.get(bookId);
    if (bookInv.totalReserved === bookInv.totalInventory) {
      throw new InvalidQuantityError(this.logger, bookId, amount);
    }

    const result = await this.bookInvDao.updateReserved(
      bookId,
      amount,
      bookInv.version,
    );

    this.handleVersionChanged(result);

    if (result.totalInventory === result.totalReserved) {
      await this.bookService.update(bookId, { isAvailable: false });
    }

    this.logger.log('Reservation count addeed successfully');
    return result;
  }

  async releaseReservation(bookId: string): Promise<BookInventory> {
    this.logger.log(`Removing reservation from book ${bookId} count`);
    const amount = -1;
    const bookInv = await this.get(bookId);

    if (bookInv.totalReserved === 0) {
      throw new InvalidQuantityError(this.logger, bookId, amount);
    }

    const result = await this.bookInvDao.updateReserved(
      bookId,
      amount,
      bookInv.version,
    );

    this.handleVersionChanged(result);

    if (bookInv.totalReserved === bookInv.totalInventory) {
      await this.bookService.update(bookId, { isAvailable: true });
    }

    this.logger.log('Reservation successfully removed from count');
    return result;
  }

  async decrementInventory(bookId: string): Promise<BookInventory> {
    this.logger.log(`Removing inventory from book ${bookId} count`);
    const amount = -1;
    const bookInv = await this.get(bookId);

    if (bookInv.totalInventory === 0) {
      throw new InvalidQuantityError(this.logger, bookId, amount);
    }

    const result = await this.bookInvDao.updateInventory(
      bookId,
      amount,
      bookInv.version,
    );

    this.handleVersionChanged(result);

    this.logger.log('Inventory successfully removed from count');
    return result;
  }

  private handleVersionChanged(result: BookInventory) {
    if (!result) {
      throw new VersionChangedError(this.logger, BookInventory.name);
    }
  }
}
