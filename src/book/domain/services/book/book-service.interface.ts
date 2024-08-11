import { PaginationOptions, PaginationResult } from '@shared/types';
import { Book } from '../../../common/entities';
import { BookSearchFilters } from '../../../data-access/persistence/dao/book-dao';

export interface IBookService {
  create(book: Book, quantity: number): Promise<Book>;

  getById(id: string): Promise<Book>;

  update(id: string, book: Partial<Book>, quantity?: number): Promise<Book>;

  delete(id: string): Promise<boolean>;

  search(
    filters: BookSearchFilters,
    options: PaginationOptions,
  ): Promise<PaginationResult<Book>>;
}

export const IBookService = Symbol('IBookService');
