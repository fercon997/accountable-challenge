import { LoggerService, NotFoundException } from '@nestjs/common';

export class BookNotFoundError extends NotFoundException {
  constructor(logger: LoggerService, id: string, inner?: Error) {
    const message = `Book with id ${id} not found`;
    logger.error(message);
    super(inner, message);
  }
}
