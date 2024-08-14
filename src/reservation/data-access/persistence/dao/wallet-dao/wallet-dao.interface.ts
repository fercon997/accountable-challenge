import { Wallet } from '../../../../common/entities';

export interface IWalletDao {
  incrementBalance(userId: string, balance: number): Promise<Wallet>;

  decrementBalance(
    userId: string,
    balance: number,
    version?: number,
  ): Promise<Wallet>;

  get(userId: string, reservations?: boolean): Promise<Wallet>;

  addReservation(
    userId: string,
    reservationId: string,
    version?: number,
  ): Promise<boolean>;

  removeReservation(
    userId: string,
    reservationId: string,
    version?: number,
  ): Promise<boolean>;
}

export const IWalletDao = Symbol('IWalletDao');
