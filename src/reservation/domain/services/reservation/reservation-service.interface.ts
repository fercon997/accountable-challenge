import { PaginationOptions, PaginationResult } from '@shared/types';
import { Reservation } from '../../../common/entities';

export interface IReservationService {
  createReservation(
    userId: string,
    bookId: string,
    returnDate: Date,
  ): Promise<Reservation>;

  payReservation(reservationId: string, userId: string): Promise<Reservation>;

  endReservation(reservationId: string, userId: string): Promise<Reservation>;

  cancelReservation(
    reservationId: string,
    userId: string,
  ): Promise<Reservation>;

  get(filters: Partial<Reservation>): Promise<Reservation[]>;

  getById(id: string): Promise<Reservation>;

  getPaginated(
    filters: Partial<Reservation>,
    pagination: PaginationOptions,
  ): Promise<PaginationResult<Reservation>>;
}

export const IReservationService = Symbol('IReservationService');
