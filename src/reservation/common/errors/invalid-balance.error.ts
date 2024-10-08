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
    const msg = `User ${userId} does not have enough balance in wallet to pay ${balance}`;
    super(logger, msg, inner);
  }
}
