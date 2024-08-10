export enum PermissionMap {
  allBooks = 'books:*',
  createBook = 'books:create',
  getBook = 'books:get',
  deleteBook = 'books:delete',
  updateBook = 'books:update',
  allUser = 'users:*',
  createUser = 'users:create',
  getUser = 'users:get',
  deleteUser = 'users:delete',
  updateUser = 'users:update',
}

export enum Genres {
  fiction = 'fiction',
  fantasy = 'fantasy',
  mystery = 'mystery',
  novel = 'novel',
  graphicNovel = 'graphic novel',
  biography = 'biography',
}

export type DbPaginationOptions = {
  limit: number;
  offset: number;
};

export type PaginationResult<T> = {
  data: T[];
  totalCount: number;
};

export type PaginationOptions = {
  pageSize: number;
  page: number;
};
