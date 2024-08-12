import { LoggerService } from '@nestjs/common';
import { NotFoundError } from '@shared/errors';

export class BookInventoryNotFoundError extends NotFoundError {
  constructor(logger: LoggerService, id: string, inner?: Error) {
    const message = `Book inventory with book id ${id} not found`;
    super(logger, message, inner);
  }
}
