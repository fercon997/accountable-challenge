import { LoggerService } from '@nestjs/common';
import { NotFoundError } from '@shared/errors';

export class BookNotFoundError extends NotFoundError {
  constructor(logger: LoggerService, id: string, inner?: Error) {
    const message = `Book with id ${id} not found`;
    super(logger, message, inner);
  }
}
