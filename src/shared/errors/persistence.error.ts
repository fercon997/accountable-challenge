import { InternalServerErrorException, LoggerService } from '@nestjs/common';

export class PersistenceError extends InternalServerErrorException {
  constructor(logger: LoggerService, message: string, inner?: Error) {
    const msg = `There has been an error with the persistence source: ${message}`;
    logger.error(msg, inner.stack);
    super(msg);
  }
}
