import { BadRequestException, LoggerService } from '@nestjs/common';
import { Error } from 'mongoose';

export class InvalidQuantityError extends BadRequestException {
  constructor(
    logger: LoggerService,
    bookId: string,
    quantity: number,
    inner?: Error,
  ) {
    const msg = `Cannot update bookInventory ${bookId}, quantity ${quantity} is invalid`;
    logger.error(msg, inner);
    super(msg);
  }
}
