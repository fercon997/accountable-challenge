import { Inject, Injectable, LoggerService } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import {
  ClientSession,
  FilterQuery,
  Model,
  Types,
  UpdateQuery,
} from 'mongoose';
import { ITransactionService } from '@shared/services/transaction';
import { DaoService } from '@shared/dao.service';
import {
  Reservation,
  ReservationDocument,
  Wallet,
  WalletDocument,
  WalletReservation,
} from '../../../../common/entities';
import { IWalletDao } from './wallet-dao.interface';

@Injectable()
export class WalletDaoService extends DaoService implements IWalletDao {
  constructor(
    @InjectModel(Wallet.name) private walletModel: Model<Wallet>,
    @Inject('LoggerService') logger: LoggerService,
    @Inject(ITransactionService)
    private transactionService: ITransactionService<ClientSession>,
  ) {
    super(logger);
  }

  private parseDbWallet(walletDoc: WalletDocument): Wallet {
    return walletDoc
      ? new Wallet({
          ...walletDoc.toJSON(),
          balance: parseFloat(walletDoc.balance.toString()),
          reservations: walletDoc.reservations.map(this.parseReservation),
        })
      : null;
  }

  private parseReservation(
    reservationDoc: ReservationDocument,
  ): WalletReservation {
    if (reservationDoc instanceof Types.ObjectId) {
      return { _id: reservationDoc.toString() };
    }

    return new Reservation({
      ...reservationDoc.toJSON(),
      price: parseFloat(reservationDoc.price.toString()),
    });
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

      const result = await this.walletModel.findOneAndUpdate(
        query,
        {
          $inc: { balance: balance },
        },
        {
          returnOriginal: false,
          session: this.transactionService.getCurrentTransaction(),
        },
      );
      return this.parseDbWallet(result);
    } catch (error) {
      this.throwError(`Could not update ${userId} wallet by ${balance}`, error);
    }
  }

  private async updateReservations({
    userId,
    reservationId,
    operation,
    fees,
    version,
  }: {
    userId: string;
    reservationId: string;
    operation: 'push' | 'pull';
    fees?: number;
    version?: number;
  }): Promise<boolean> {
    try {
      const query: FilterQuery<Wallet> = version
        ? { userId, version }
        : { userId };
      const update: UpdateQuery<Wallet> = {};
      if (operation === 'push') {
        update.$push = { reservations: reservationId };
      }

      if (operation === 'pull') {
        update.$pull = { reservations: reservationId };
      }

      if (fees) {
        update.$inc = { balance: fees };
      }

      const result = await this.walletModel.findOneAndUpdate(query, update, {
        session: this.transactionService.getCurrentTransaction(),
      });
      return !!result;
    } catch (e) {
      this.throwError('Could not update wallet with reservations', e);
    }
  }

  async incrementBalance(userId: string, balance: number): Promise<Wallet> {
    return this.updateBalance(userId, balance);
  }

  async decrementBalance(
    userId: string,
    balance: number,
    version?: number,
  ): Promise<Wallet> {
    return this.updateBalance(userId, -balance, version);
  }

  async get(userId: string, reservations = false): Promise<Wallet> {
    try {
      const query = this.walletModel.findOne({ userId });
      if (reservations) {
        query.populate('reservations');
      }

      const result: WalletDocument = await query;

      return this.parseDbWallet(result);
    } catch (error) {
      this.throwError(`Could not get wallet for user ${userId}`, error);
    }
  }

  async addReservation(
    userId: string,
    reservationId: string,
    version?: number,
  ): Promise<boolean> {
    return this.updateReservations({
      userId,
      reservationId,
      operation: 'push',
      version,
    });
  }

  async removeReservation(
    userId: string,
    reservationId: string,
    fees?: number,
    version?: number,
  ): Promise<boolean> {
    return this.updateReservations({
      userId,
      reservationId,
      operation: 'pull',
      fees,
      version,
    });
  }
}
