import { DbPaginationOptions, Genres, PaginationResult } from '@shared/types';
import { Book } from '../../../../common/entities';

export type SearchFilters = {
  title?: string;
  author?: string;
  genre?: Genres;
};

export interface IBookDao {
  create(book: Book): Promise<Book>;

  getById(id: string): Promise<Book>;

  update(id: string, book: Partial<Book>): Promise<Book>;

  delete(id: string): Promise<boolean>;

  search(
    filters: SearchFilters,
    paginationOptions: DbPaginationOptions,
  ): Promise<PaginationResult<Book>>;
}

export const IBookDao = Symbol('IBookDao');
