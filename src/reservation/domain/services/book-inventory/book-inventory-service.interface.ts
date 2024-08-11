import { BookInventory } from '../../../common/entities';

export interface IBookInventoryService {
  create(bookId: string, quantity: number): Promise<BookInventory>;

  get(bookId: string): Promise<BookInventory>;

  update(bookId: string, quantity: number): Promise<BookInventory>;

  delete(bookId: string): Promise<boolean>;
}

export const IBookInventoryService = Symbol('IBookInventoryService');
