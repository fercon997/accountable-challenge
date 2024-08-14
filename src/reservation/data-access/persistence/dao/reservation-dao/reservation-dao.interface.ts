import { DbPaginationOptions, DbPaginationResult } from '@shared/types';
import { Reservation } from '../../../../common/entities';

export interface IReservationDao {
  create(reservation: Reservation): Promise<Reservation>;

  update(
    id: string,
    update: Partial<Reservation>,
    version?: number,
  ): Promise<Reservation>;

  get(
    input: Partial<Reservation>,
    paginationOptions: DbPaginationOptions,
  ): Promise<DbPaginationResult<Reservation>>;

  get(input: Partial<Reservation>): Promise<Reservation[]>;

  getById(id: string): Promise<Reservation>;
}

export const IReservationDao = Symbol('IReservationDao');
