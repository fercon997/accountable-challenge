import { Inject, Injectable, LoggerService } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { FilterQuery, Model, Promise } from 'mongoose';
import { PersistenceError } from '@shared/errors';
import { Wallet, WalletDocument } from '../../../../common/entities';
import { IWalletDao } from './wallet-dao.interface';

@Injectable()
export class WalletDaoService implements IWalletDao {
  constructor(
    @InjectModel(Wallet.name) private walletModel: Model<Wallet>,
    @Inject('LoggerService') private logger: LoggerService,
  ) {}

  decrementBalance(
    userId: string,
    balance: number,
    version?: number,
  ): Promise<Wallet> {
    return this.updateBalance(userId, -balance, version);
  }

  incrementBalance(userId: string, balance: number): Promise<Wallet> {
    return this.updateBalance(userId, balance);
  }

  private parseDbWallet(walletDoc: WalletDocument): Wallet {
    return walletDoc
      ? new Wallet({
          ...walletDoc.toJSON(),
          balance: parseFloat(walletDoc.balance.toString()),
        })
      : null;
  }

  private async updateBalance(
    userId: string,
    balance: number,
    version?: number,
  ): Promise<Wallet> {
    try {
      const query: FilterQuery<Wallet> = version
        ? { userId, version }
        : { userId };

      const result = await this.walletModel.findOneAndUpdate(query, {
        $inc: { balance: balance },
      });
      return this.parseDbWallet(result);
    } catch (error) {
      throw new PersistenceError(
        this.logger,
        `Could not update ${userId} wallet by ${balance}`,
        error,
      );
    }
  }

  async get(userId: string): Promise<Wallet> {
    try {
      const result = await this.walletModel.findOne({ userId });
      return this.parseDbWallet(result);
    } catch (error) {
      throw new PersistenceError(
        this.logger,
        `Could not get wallet for user ${userId}`,
      );
    }
  }
}
