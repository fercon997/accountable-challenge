import { Wallet } from '../../../../common/entities';

export interface IWalletDao {
  incrementBalance(userId: string, balance: number): Promise<Wallet>;

  decrementBalance(userId: string, balance: number): Promise<Wallet>;
}

export const IWalletDao = Symbol('IWalletDao');
