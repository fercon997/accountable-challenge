import { BadRequestError } from '@shared/errors';
import { LoggerService } from '@nestjs/common';
import { ReservationStatus } from '../entities';

export class InvalidReservationStatusError extends BadRequestError {
  constructor(
    logger: LoggerService,
    operation: string,
    status: ReservationStatus,
    inner?: Error,
  ) {
    const message = `Cannot ${operation} reservation as it is already ${status}`;
    super(logger, message, inner);
  }
}
