import { Wallet } from '../../../common/entities';

export interface IWalletService {
  incrementBalance(userId: string, amount: number): Promise<Wallet>;

  get(userId: string): Promise<Wallet>;

  decrementBalance(userId: string, amount: number): Promise<Wallet>;
}

export const IWalletService = Symbol('IWalletService');
