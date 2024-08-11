import { LoggerService, NotFoundException } from '@nestjs/common';

export class BookInventoryNotFoundError extends NotFoundException {
  constructor(logger: LoggerService, id: string, inner?: Error) {
    const message = `Book inventory with book id ${id} not found`;
    logger.error(message, inner);
    super(message);
  }
}
