import { LoggerService } from '@nestjs/common';
import { PersistenceError } from './errors';

export abstract class DaoService {
  constructor(protected logger: LoggerService) {}

  protected throwError(message: string, error: Error) {
    throw new PersistenceError(this.logger, message, error);
  }
}
