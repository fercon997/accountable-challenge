import { BadRequestError } from '@shared/errors';
import { LoggerService } from '@nestjs/common';
import { Error } from 'mongoose';

export class InvalidBalanceError extends BadRequestError {
  constructor(
    logger: LoggerService,
    userId: string,
    balance: number,
    inner?: Error,
  ) {
    const msg = `Deducting ${balance} to user ${userId} wallet would result in a negative balance`;
    super(logger, msg, inner);
  }
}
