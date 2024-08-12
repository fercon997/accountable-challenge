import { BadRequestException, LoggerService } from '@nestjs/common';
import { Error } from 'mongoose';

export class BadRequestError extends BadRequestException {
  constructor(logger: LoggerService, msg: string, inner?: Error) {
    logger.error(msg, inner?.stack);
    super(msg);
  }
}
