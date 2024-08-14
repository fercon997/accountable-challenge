import { BookInventory } from '../../../../common/entities';

export interface IBookInventoryDao {
  create(bookId: string, quantity: number): Promise<BookInventory>;

  get(bookId: string): Promise<BookInventory>;

  update(bookId: string, quantity: number): Promise<BookInventory>;

  delete(bookId: string): Promise<boolean>;

  updateReserved(
    bookId: string,
    quantity: number,
    version?: number,
  ): Promise<BookInventory>;
}

export const IBookInventoryDao = Symbol('IBookInventoryDao');
