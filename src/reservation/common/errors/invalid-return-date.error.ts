import { BadRequestError } from '@shared/errors';
import { LoggerService } from '@nestjs/common';

export class InvalidReturnDateError extends BadRequestError {
  constructor(logger: LoggerService, maxReturnDate: Date, inner?: Error) {
    const msg = `Return date cannot be further than ${maxReturnDate.toDateString()}`;
    super(logger, msg, inner);
  }
}
