import { BadRequestError } from '@shared/errors';
import { LoggerService } from '@nestjs/common';

export class AlreadyReservedError extends BadRequestError {
  constructor(
    logger: LoggerService,
    userId: string,
    bookId: string,
    inner?: Error,
  ) {
    const msg = `User ${userId} has an active reservation for book ${bookId}`;
    super(logger, msg, inner);
  }
}
