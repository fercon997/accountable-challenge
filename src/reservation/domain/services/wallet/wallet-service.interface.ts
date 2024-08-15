import { Wallet } from '../../../common/entities';

export interface IWalletService {
  incrementBalance(userId: string, amount: number): Promise<Wallet>;

  get(userId: string, reservation?: boolean): Promise<Wallet>;

  addReservation(userId: string, reservationId: string): Promise<boolean>;

  removeReservation(
    userId: string,
    reservationId: string,
    fees?: number,
  ): Promise<boolean>;

  decrementBalance(userId: string, amount: number): Promise<Wallet>;
}

export const IWalletService = Symbol('IWalletService');
