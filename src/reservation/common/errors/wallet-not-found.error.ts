import { NotFoundError } from '@shared/errors';
import { Error } from 'mongoose';
import { LoggerService } from '@nestjs/common';

export class WalletNotFoundError extends NotFoundError {
  constructor(logger: LoggerService, userId: string, inner?: Error) {
    const msg = `Could not find wallet for user ${userId}`;
    super(logger, msg, inner);
  }
}
