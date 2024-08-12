import { Reservation } from '../../../../common/entities';

export interface IReservationDao {
  create(reservation: Reservation): Promise<Reservation>;

  update(
    id: string,
    update: Partial<Reservation>,
    version?: number,
  ): Promise<Reservation>;

  get(input: { userId: string; bookId: string }): Promise<Reservation[]>;

  get(input: { userId: string }): Promise<Reservation[]>;

  get(input: { bookId: string }): Promise<Reservation[]>;

  getById(id: string): Promise<Reservation>;
}

export const IReservationDao = Symbol('IReservationDao');
