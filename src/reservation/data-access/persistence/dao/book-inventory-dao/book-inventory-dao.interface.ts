import { BookInventory } from '../../../../common/entities';

export interface IBookInventoryDao {
  create(bookId: string, quantity: number): Promise<BookInventory>;

  get(bookId: string): Promise<BookInventory>;

  update(bookId: string, quantity: number): Promise<BookInventory>;

  delete(bookId: string): Promise<boolean>;
}

export const IBookInventoryDao = Symbol('IBookInventoryDao');
