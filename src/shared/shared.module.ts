import { Logger, Module } from '@nestjs/common';
import {
  TransactionService,
  ITransactionService,
} from './services/transaction';

@Module({
  providers: [
    { provide: 'LoggerService', useClass: Logger },
    { provide: ITransactionService, useClass: TransactionService },
  ],
  exports: ['LoggerService', ITransactionService],
})
export class SharedModule {}
