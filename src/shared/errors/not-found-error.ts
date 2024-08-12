import { LoggerService, NotFoundException } from '@nestjs/common';
import { Error } from 'mongoose';

export class NotFoundError extends NotFoundException {
  constructor(logger: LoggerService, msg: string, inner?: Error) {
    logger.error(msg, inner?.stack);
    super(msg);
  }
}
