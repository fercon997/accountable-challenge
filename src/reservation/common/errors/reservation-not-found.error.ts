import { NotFoundError } from '@shared/errors';
import { LoggerService } from '@nestjs/common';

export class ReservationNotFoundError extends NotFoundError {
  constructor(logger: LoggerService, reservationId: string, inner?: Error) {
    const msg = `Reservation with id ${reservationId} not found.`;
    super(logger, msg, inner);
  }
}
