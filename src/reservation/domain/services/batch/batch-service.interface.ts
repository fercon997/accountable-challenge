export interface IBatchService {
  handleLateReservations(): Promise<void>;

  handleCloseToReturn(): Promise<void>;

  handle7DaysLate(): Promise<void>;
}

export const IBatchService = Symbol('IBatchService');
