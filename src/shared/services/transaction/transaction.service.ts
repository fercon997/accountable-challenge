import { Inject, Injectable, LoggerService } from '@nestjs/common';
import { ClientSession, Connection } from 'mongoose';
import { InjectConnection } from '@nestjs/mongoose';
import { ITransactionService } from './transaction-service.interface';

@Injectable()
export class TransactionService implements ITransactionService<ClientSession> {
  private session: ClientSession;

  constructor(
    @Inject('LoggerService') private logger: LoggerService,
    @InjectConnection() private connection: Connection,
  ) {}

  getCurrentTransaction(): ClientSession {
    return this.session;
  }

  async startTransaction<T>(executor: () => Promise<T>): Promise<T> {
    try {
      this.logger.log('Starting mongoDB session');
      this.session = await this.connection.startSession({});
      this.logger.log('Starting transaction');
      this.session.startTransaction();
      const result = await executor.apply(void 0);
      await this.session.commitTransaction();
      this.logger.log('Transaction commited successfully');
      return result;
    } catch (error) {
      await this.session?.abortTransaction();
      throw error;
    } finally {
      await this.session?.endSession();
      this.logger.log('MongoDB session ended');
      this.session = undefined;
    }
  }
}
