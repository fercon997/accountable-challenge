export interface ITransactionService<T> {
  startTransaction<T>(executor: () => Promise<T>): Promise<T>;

  getCurrentTransaction(): T;
}

export const ITransactionService = Symbol('ITransactionService');
