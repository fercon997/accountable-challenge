import { Book } from '../../../../common/entities';

export interface IBookDao {
  create(book: Book): Promise<Book>;

  getById(id: string): Promise<Book>;

  update(id: string, book: Partial<Book>): Promise<Book>;

  delete(id: string): Promise<boolean>;
}

export const IBookDao = Symbol('IBookDao');
