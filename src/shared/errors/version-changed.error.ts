import { InternalServerErrorException, LoggerService } from '@nestjs/common';
import { Error } from 'mongoose';

export class VersionChangedError extends InternalServerErrorException {
  constructor(logger: LoggerService, name: string, inner?: Error) {
    const msg = `Could not update ${name.toLowerCase()}, the record was changed by another resource`;
    logger.error(msg, inner?.stack);
    super(msg);
  }
}
